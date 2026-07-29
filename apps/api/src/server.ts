import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import Fastify from "fastify";
import type { FastifyRequest } from "fastify";
import { randomUUID } from "node:crypto";
import {
  campaignCreateSchema,
  createDataCipher,
  eventTrackSchema,
  geoUpdateSchema,
  subscriberHeartbeatSchema,
  subscriptionUpsertSchema
} from "@pushgiant/shared";
import type { ApiConfig } from "./config.js";
import type { Database } from "./db.js";
import type { Queues } from "./queues.js";
import {
  authenticateApiKey,
  createCampaign,
  getProjectOverview,
  listProjectSubscribers,
  markCampaignQueued,
  recordEvent,
  recordHeartbeat,
  updateSubscriberGeo,
  upsertSubscription
} from "./repositories.js";
import type { ApiKeyIdentity } from "./repositories.js";

type ServerDeps = {
  config: ApiConfig;
  database: Database;
  queues: Queues;
};

export function buildServer({ config, database, queues }: ServerDeps) {
  const cipher = createDataCipher(config.dataEncryptionKey);
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info"
    },
    genReqId: (request) =>
      request.headers["x-request-id"]?.toString() ?? randomUUID()
  });

  app.register(helmet);
  app.register(cors, {
    origin: config.corsOrigins,
    credentials: true
  });

  app.get("/healthz", async () => ({ status: "ok" }));

  app.get("/readyz", async (_request, reply) => {
    const [databaseReady, redisReady] = await Promise.all([
      database.health().catch(() => false),
      queues.connection.ping().then((result) => result === "PONG").catch(() => false)
    ]);

    if (!databaseReady || !redisReady) {
      return reply.code(503).send({
        status: "not_ready",
        dependencies: { database: databaseReady, redis: redisReady }
      });
    }

    return {
      status: "ready",
      dependencies: { database: true, redis: true }
    };
  });

  app.get("/v1/projects/:projectId/config", async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const result = await database.pool.query(
      `
        select
          p.id,
          p.name,
          pc.name as pwa_name,
          pc.short_name,
          pc.theme_color,
          pc.background_color,
          pc.start_url,
          pc.scope,
          vc.public_key
        from projects p
        left join pwa_configs pc on pc.project_id = p.id
        left join vapid_credentials vc on vc.project_id = p.id
        where p.id = $1 and p.status = 'active'
        limit 1
      `,
      [projectId]
    );

    const row = result.rows[0];
    if (!row) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return {
      projectId: row.id,
      name: row.name,
      publicKey: row.public_key,
      pwa: {
        name: row.pwa_name,
        shortName: row.short_name,
        themeColor: row.theme_color,
        backgroundColor: row.background_color,
        startUrl: row.start_url,
        scope: row.scope
      }
    };
  });

  app.post("/v1/subscriptions/upsert", async (request, reply) => {
    const parsed = subscriptionUpsertSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_subscription", details: parsed.error.flatten() });
    }

    const subscription = await upsertSubscription(database.pool, cipher, parsed.data);
    if (!subscription) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return reply.code(202).send({
      status: "accepted",
      project_id: parsed.data.project_id,
      subscription
    });
  });

  app.post("/v1/subscribers/heartbeat", async (request, reply) => {
    const parsed = subscriberHeartbeatSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_heartbeat", details: parsed.error.flatten() });
    }

    const result = await recordHeartbeat(database.pool, parsed.data);
    if (!result) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return reply.code(202).send({ status: "accepted", ...result });
  });

  app.post("/v1/events/track", async (request, reply) => {
    const parsed = eventTrackSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_event", details: parsed.error.flatten() });
    }

    const result = await recordEvent(database.pool, parsed.data);
    if (!result) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return reply.code(202).send({ status: "accepted", ...result });
  });

  app.post("/v1/subscribers/geo", async (request, reply) => {
    const parsed = geoUpdateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_geo", details: parsed.error.flatten() });
    }

    const result = await updateSubscriberGeo(database.pool, parsed.data);
    if (!result) {
      return reply.code(404).send({ error: "project_or_subscriber_not_found" });
    }

    return reply.code(202).send({ status: "accepted", ...result });
  });

  app.get("/v1/projects/:projectId/overview", async (request, reply) => {
    const apiKey = await requireApiKey(request, database, ["analytics:read"]);
    if (!apiKey) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const { projectId } = request.params as { projectId: string };
    const overview = await getProjectOverview(database.pool, apiKey, projectId);
    if (!overview) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return overview;
  });

  app.get("/v1/projects/:projectId/subscribers", async (request, reply) => {
    const apiKey = await requireApiKey(request, database, ["subscribers:read"]);
    if (!apiKey) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const { projectId } = request.params as { projectId: string };
    const { limit } = request.query as { limit?: string };
    const parsedLimit = limit ? Number(limit) : 100;
    const subscribers = await listProjectSubscribers(
      database.pool,
      apiKey,
      projectId,
      Number.isFinite(parsedLimit) ? parsedLimit : 100
    );
    if (!subscribers) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return { subscribers };
  });

  app.post("/v1/campaigns", async (request, reply) => {
    const apiKey = await requireApiKey(request, database, ["campaigns:write"]);
    if (!apiKey) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const parsed = campaignCreateSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_campaign", details: parsed.error.flatten() });
    }

    const campaign = await createCampaign(database.pool, apiKey, parsed.data);
    if (!campaign) {
      return reply.code(404).send({ error: "project_not_found" });
    }

    return reply.code(201).send({
      id: campaign.id,
      status: campaign.status,
      project_id: campaign.project_id
    });
  });

  app.post("/v1/campaigns/:campaignId/send-now", async (request, reply) => {
    const apiKey = await requireApiKey(request, database, ["campaigns:send"]);
    if (!apiKey) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    const { campaignId } = request.params as { campaignId: string };
    const campaign = await markCampaignQueued(database.pool, apiKey, campaignId);
    if (!campaign) {
      return reply.code(404).send({ error: "campaign_not_found_or_not_queueable" });
    }

    await queues.campaignDelivery.add(
      "campaign.send",
      {
        campaignId,
        projectId: campaign.project_id,
        organizationId: campaign.organization_id
      },
      { jobId: `campaign:${campaignId}` }
    );

    return reply.code(202).send({ id: campaignId, status: campaign.status });
  });

  return app;
}

async function requireApiKey(
  request: FastifyRequest,
  database: Database,
  requiredScopes: string[]
): Promise<ApiKeyIdentity | null> {
  const value = readApiKey(request);
  if (!value) {
    return null;
  }

  const apiKey = await authenticateApiKey(database.pool, value);
  if (!apiKey) {
    return null;
  }

  if (!requiredScopes.every((scope) => apiKey.scopes.includes(scope))) {
    return null;
  }

  return apiKey;
}

function readApiKey(request: FastifyRequest): string | null {
  const headerValue = request.headers["x-api-key"];
  if (typeof headerValue === "string" && headerValue.trim()) {
    return headerValue.trim();
  }

  const authorization = request.headers.authorization;
  if (authorization?.startsWith("Bearer ")) {
    return authorization.slice("Bearer ".length).trim();
  }

  return null;
}
