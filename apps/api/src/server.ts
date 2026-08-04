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

  app.get("/sdk/pushgiant.js", async (_request, reply) => {
    return reply
      .type("application/javascript; charset=utf-8")
      .header("Cache-Control", "public, max-age=300, stale-while-revalidate=86400")
      .send(PUSHGIANT_BROWSER_SDK);
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

const PUSHGIANT_BROWSER_SDK = String.raw`
(function (window) {
  if (window.PushGiant) return;

  var state = { config: null };

  function init(config) {
    if (!config || !config.projectId || !config.apiUrl) {
      throw new Error("PushGiant.init requires projectId and apiUrl");
    }

    state.config = {
      projectId: config.projectId,
      apiUrl: String(config.apiUrl).replace(/\/$/, ""),
      serviceWorkerPath: config.serviceWorkerPath || "/pushgiant-sw.js",
      anonymousId: config.anonymousId || getAnonymousId(),
      externalCustomerId: config.externalCustomerId || null,
      externalSource: config.externalSource || "web"
    };

    heartbeat().catch(function () {});
    return window.PushGiant;
  }

  function isSupported() {
    return "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  }

  async function subscribe() {
    var config = requireConfig();
    if (!isSupported()) return { status: "unsupported" };

    var permission = await Notification.requestPermission();
    if (permission !== "granted") return { status: permission };

    var projectConfig = await request(config.apiUrl + "/v1/projects/" + encodeURIComponent(config.projectId) + "/config");
    if (!projectConfig.publicKey) throw new Error("Push Giant public key is not configured");

    var registration = await navigator.serviceWorker.register(config.serviceWorkerPath);
    var subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(projectConfig.publicKey)
      });
    }

    var subscriptionJson = subscription.toJSON();
    await request(config.apiUrl + "/v1/subscriptions/upsert", {
      method: "POST",
      body: JSON.stringify({
        project_id: config.projectId,
        anonymous_id: config.anonymousId,
        external_customer_id: config.externalCustomerId || undefined,
        external_source: config.externalSource,
        endpoint: subscription.endpoint,
        keys: subscriptionJson.keys,
        content_encoding: "aes128gcm",
        permission: Notification.permission,
        platform: navigator.platform,
        browser: detectBrowser(),
        os: detectOs(),
        user_agent: navigator.userAgent,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });

    await track({ type: "subscription.granted" }).catch(function () {});
    return { status: "subscribed" };
  }

  async function heartbeat() {
    var config = requireConfig();
    return request(config.apiUrl + "/v1/subscribers/heartbeat", {
      method: "POST",
      body: JSON.stringify({
        project_id: config.projectId,
        anonymous_id: config.anonymousId,
        external_customer_id: config.externalCustomerId || undefined,
        permission: typeof Notification === "undefined" ? "default" : Notification.permission,
        platform: navigator.platform,
        browser: detectBrowser(),
        os: detectOs(),
        user_agent: navigator.userAgent,
        locale: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      })
    });
  }

  async function track(event) {
    var config = requireConfig();
    return request(config.apiUrl + "/v1/events/track", {
      method: "POST",
      body: JSON.stringify({
        project_id: config.projectId,
        anonymous_id: config.anonymousId,
        external_customer_id: config.externalCustomerId || undefined,
        type: event.type,
        payload: event.payload || {}
      })
    });
  }

  async function updateGeo(position, consentVersion) {
    var config = requireConfig();
    return request(config.apiUrl + "/v1/subscribers/geo", {
      method: "POST",
      body: JSON.stringify({
        project_id: config.projectId,
        anonymous_id: config.anonymousId,
        external_customer_id: config.externalCustomerId || undefined,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        consent_version: consentVersion || "v1"
      })
    });
  }

  function requireConfig() {
    if (!state.config) throw new Error("PushGiant SDK is not initialized");
    return state.config;
  }

  async function request(url, init) {
    var response = await fetch(url, Object.assign({}, init, {
      headers: Object.assign({ "Content-Type": "application/json" }, init && init.headers)
    }));
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) throw new Error(data.error || "Push Giant request failed: " + response.status);
    return data;
  }

  function getAnonymousId() {
    var key = "pushgiant_anonymous_id";
    var existing = window.localStorage && localStorage.getItem(key);
    if (existing) return existing;
    var value = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);
    if (window.localStorage) localStorage.setItem(key, value);
    return value;
  }

  function detectBrowser() {
    var ua = navigator.userAgent;
    if (/Edg\//.test(ua)) return "Edge";
    if (/Chrome\//.test(ua)) return "Chrome";
    if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return "Safari";
    if (/Firefox\//.test(ua)) return "Firefox";
    return "unknown";
  }

  function detectOs() {
    var ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
    if (/Android/.test(ua)) return "Android";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Windows/.test(ua)) return "Windows";
    return "unknown";
  }

  function urlBase64ToUint8Array(value) {
    var padding = "=".repeat((4 - value.length % 4) % 4);
    var base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
    var raw = atob(base64);
    var output = new Uint8Array(raw.length);
    for (var index = 0; index < raw.length; index += 1) {
      output[index] = raw.charCodeAt(index);
    }
    return output;
  }

  window.PushGiant = {
    init: init,
    subscribe: subscribe,
    heartbeat: heartbeat,
    track: track,
    updateGeo: updateGeo,
    isSupported: isSupported
  };
})(window);
`;