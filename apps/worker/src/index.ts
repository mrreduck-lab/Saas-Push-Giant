import { Worker } from "bullmq";
import pg from "pg";
import webpush from "web-push";
import {
  CAMPAIGN_DELIVERY_QUEUE_NAME,
  DEFAULT_CAMPAIGN_BATCH_SIZE,
  createDataCipher
} from "@pushgiant/shared";

type CampaignJob = {
  campaignId: string;
  projectId: string;
  organizationId: string;
};

type CampaignRow = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  body: string;
  url: string | null;
  ttl_seconds: number | null;
  urgency: webpush.Urgency | null;
  topic: string | null;
};

type SubscriptionRow = {
  id: string;
  subscriber_id: string;
  endpoint_encrypted: string;
  p256dh_encrypted: string;
  auth_encrypted: string;
};

type VapidRow = {
  public_key: string;
  private_key_encrypted: string;
  subject: string;
};

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const databaseUrl = process.env.DATABASE_URL ?? "postgres://pushgiant:pushgiant@localhost:5432/pushgiant";
const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 10);
const sendConcurrency = Number(process.env.WEB_PUSH_SEND_CONCURRENCY ?? 25);
const batchSize = Number(process.env.CAMPAIGN_BATCH_SIZE ?? DEFAULT_CAMPAIGN_BATCH_SIZE);
const publicApiUrl = (process.env.API_PUBLIC_URL ?? "https://api.pushgiant.ru").replace(/\/$/, "");
const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null
};
const pool = new pg.Pool({ connectionString: databaseUrl });
const cipher = createDataCipher(process.env.DATA_ENCRYPTION_KEY);

const worker = new Worker<CampaignJob>(
  CAMPAIGN_DELIVERY_QUEUE_NAME,
  async (job) => {
    console.log(JSON.stringify({
      level: "info",
      message: "campaign delivery job accepted",
      jobId: job.id,
      name: job.name,
      data: job.data
    }));

    return deliverCampaign(job.data);
  },
  { connection, concurrency }
);

async function deliverCampaign(job: CampaignJob) {
  const campaign = await markCampaignSending(job.campaignId);
  if (!campaign) {
    return { skipped: true, reason: "campaign_not_sendable" };
  }

  const vapid = await loadVapidCredentials(campaign.project_id);
  if (!vapid) {
    await finishCampaign(campaign.id, "failed");
    throw new Error(`Missing VAPID credentials for project ${campaign.project_id}`);
  }

  webpush.setVapidDetails(
    vapid.subject,
    vapid.public_key,
    cipher.decrypt(vapid.private_key_encrypted)
  );

  const subscriptions = await loadActiveSubscriptions(campaign.project_id, batchSize);
  const batchId = await createBatch(campaign, subscriptions.length);
  let sent = 0;
  let failed = 0;

  for (let index = 0; index < subscriptions.length; index += sendConcurrency) {
    const chunk = subscriptions.slice(index, index + sendConcurrency);
    const results = await Promise.all(chunk.map((subscription) =>
      sendToSubscription(campaign, batchId, subscription)
    ));

    for (const result of results) {
      if (result) {
        sent += 1;
      } else {
        failed += 1;
      }
    }
  }

  await finishBatch(batchId, sent, failed);
  if (sent > 0) {
    await consumeTrialPushes(campaign.organization_id, sent);
  }
  const status = failed === 0 ? "completed" : sent > 0 ? "partially_failed" : "failed";
  await finishCampaign(campaign.id, status);

  return { sent, failed, status };
}

async function markCampaignSending(campaignId: string): Promise<CampaignRow | null> {
  const result = await pool.query<CampaignRow>(
    `
      update campaigns
      set status = 'sending', started_at = coalesce(started_at, now()), updated_at = now()
      where id = $1 and status = 'queued'
      returning id, organization_id, project_id, title, body, url, ttl_seconds, urgency, topic
    `,
    [campaignId]
  );

  return result.rows[0] ?? null;
}

async function loadVapidCredentials(projectId: string): Promise<VapidRow | null> {
  const result = await pool.query<VapidRow>(
    `
      select public_key, private_key_encrypted, subject
      from vapid_credentials
      where project_id = $1
      limit 1
    `,
    [projectId]
  );

  return result.rows[0] ?? null;
}

async function loadActiveSubscriptions(projectId: string, limit: number): Promise<SubscriptionRow[]> {
  const result = await pool.query<SubscriptionRow>(
    `
      select id, subscriber_id, endpoint_encrypted, p256dh_encrypted, auth_encrypted
      from push_subscriptions
      where project_id = $1
        and status = 'active'
      order by last_seen_at desc
      limit $2
    `,
    [projectId, limit]
  );

  return result.rows;
}

async function createBatch(campaign: CampaignRow, subscriberCount: number): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `
      insert into campaign_batches (
        organization_id,
        project_id,
        campaign_id,
        status,
        subscriber_count,
        started_at
      )
      values ($1, $2, $3, 'sending', $4, now())
      returning id
    `,
    [campaign.organization_id, campaign.project_id, campaign.id, subscriberCount]
  );

  return result.rows[0].id;
}

async function sendToSubscription(
  campaign: CampaignRow,
  batchId: string,
  subscription: SubscriptionRow
): Promise<boolean> {
  const payload = JSON.stringify({
    api_url: publicApiUrl,
    campaign_id: campaign.id,
    project_id: campaign.project_id,
    subscriber_id: subscription.subscriber_id,
    title: campaign.title,
    body: campaign.body,
    url: campaign.url
  });

  try {
    const response = await webpush.sendNotification(
      {
        endpoint: cipher.decrypt(subscription.endpoint_encrypted),
        keys: {
          p256dh: cipher.decrypt(subscription.p256dh_encrypted),
          auth: cipher.decrypt(subscription.auth_encrypted)
        }
      },
      payload,
      {
        TTL: campaign.ttl_seconds ?? undefined,
        urgency: campaign.urgency ?? undefined,
        topic: campaign.topic ?? undefined
      }
    );

    await recordAttempt(campaign, batchId, subscription.id, "sent", response.statusCode);
    await pool.query(
      `
        update push_subscriptions
        set
          failure_count = 0,
          last_failure_at = null,
          last_success_at = now(),
          last_confirmed_at = now(),
          updated_at = now()
        where id = $1
      `,
      [subscription.id]
    );
    return true;
  } catch (error) {
    const statusCode = readStatusCode(error);
    const disabled = statusCode === 404 || statusCode === 410;
    await recordAttempt(
      campaign,
      batchId,
      subscription.id,
      "failed",
      statusCode,
      error instanceof Error ? error.message : "unknown_error"
    );
    await pool.query(
      `
        update push_subscriptions
        set
          failure_count = failure_count + 1,
          last_failure_at = now(),
          status = case when $2 then 'disabled' else status end,
          disabled_at = case when $2 then now() else disabled_at end,
          updated_at = now()
        where id = $1
      `,
      [subscription.id, disabled]
    );
    return false;
  }
}

async function recordAttempt(
  campaign: CampaignRow,
  batchId: string,
  subscriptionId: string,
  status: "sent" | "failed",
  providerStatusCode?: number,
  errorCode?: string
) {
  await pool.query(
    `
      insert into delivery_attempts (
        organization_id,
        project_id,
        campaign_id,
        batch_id,
        subscription_id,
        status,
        provider_status_code,
        error_code
      )
      values ($1, $2, $3, $4, $5, $6, $7, $8)
    `,
    [
      campaign.organization_id,
      campaign.project_id,
      campaign.id,
      batchId,
      subscriptionId,
      status,
      providerStatusCode ?? null,
      errorCode ?? null
    ]
  );
}

async function finishBatch(batchId: string, sent: number, failed: number) {
  await pool.query(
    `
      update campaign_batches
      set status = 'completed', sent_count = $2, failed_count = $3, finished_at = now()
      where id = $1
    `,
    [batchId, sent, failed]
  );
}

async function finishCampaign(campaignId: string, status: "completed" | "partially_failed" | "failed") {
  await pool.query(
    `
      update campaigns
      set status = $2, finished_at = now(), updated_at = now()
      where id = $1
    `,
    [campaignId, status]
  );
}

async function consumeTrialPushes(organizationId: string, sent: number) {
  await pool.query(
    `
      update organizations
      set trial_push_sent = trial_push_sent + $2, updated_at = now()
      where id = $1
    `,
    [organizationId, sent]
  );
}

function readStatusCode(error: unknown): number | undefined {
  if (error && typeof error === "object" && "statusCode" in error) {
    const statusCode = Number((error as { statusCode?: unknown }).statusCode);
    return Number.isFinite(statusCode) ? statusCode : undefined;
  }

  return undefined;
}

const shutdown = async (signal: string) => {
  console.log(JSON.stringify({ level: "info", message: "shutting down worker", signal }));
  await worker.close();
  await pool.end();
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM").then(() => process.exit(0), () => process.exit(1));
});

process.on("SIGINT", () => {
  shutdown("SIGINT").then(() => process.exit(0), () => process.exit(1));
});
