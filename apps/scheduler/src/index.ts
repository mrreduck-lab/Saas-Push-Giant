import { Queue } from "bullmq";
import pg from "pg";
import { CAMPAIGN_DELIVERY_QUEUE_NAME } from "@pushgiant/shared";

type DueCampaign = {
  id: string;
  organization_id: string;
  project_id: string;
};

const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000);
const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const databaseUrl = process.env.DATABASE_URL ?? "postgres://pushgiant:pushgiant@localhost:5432/pushgiant";
const limit = Number(process.env.SCHEDULER_CAMPAIGN_LIMIT ?? 100);
const pool = new pg.Pool({ connectionString: databaseUrl });
const queue = new Queue(CAMPAIGN_DELIVERY_QUEUE_NAME, {
  connection: {
    url: redisUrl,
    maxRetriesPerRequest: null
  }
});
let running = false;

console.log(JSON.stringify({
  level: "info",
  message: "scheduler started",
  intervalMs
}));

async function tick() {
  if (running) {
    return;
  }

  running = true;
  try {
    const campaigns = await queueDueCampaigns();
    console.log(JSON.stringify({
      level: "info",
      message: "scheduler tick",
      queued: campaigns.length,
      at: new Date().toISOString()
    }));
  } catch (error) {
    console.error(JSON.stringify({
      level: "error",
      message: "scheduler tick failed",
      error: error instanceof Error ? error.message : "unknown_error"
    }));
  } finally {
    running = false;
  }
}

async function queueDueCampaigns(): Promise<DueCampaign[]> {
  const result = await pool.query<DueCampaign>(
    `
      update campaigns
      set status = 'queued', queued_at = now(), updated_at = now()
      where id in (
        select id
        from campaigns
        where status = 'scheduled'
          and scheduled_at <= now()
        order by scheduled_at asc
        limit $1
        for update skip locked
      )
      returning id, organization_id, project_id
    `,
    [limit]
  );

  await Promise.all(result.rows.map((campaign) =>
    queue.add(
      "campaign.send",
      {
        campaignId: campaign.id,
        projectId: campaign.project_id,
        organizationId: campaign.organization_id
      },
      { jobId: `campaign:${campaign.id}` }
    )
  ));

  return result.rows;
}

const timer = setInterval(() => {
  void tick();
}, intervalMs);
timer.unref();
void tick();

const shutdown = async (signal: string) => {
  console.log(JSON.stringify({ level: "info", message: "shutting down scheduler", signal }));
  clearInterval(timer);
  await queue.close();
  await pool.end();
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM").then(() => process.exit(0), () => process.exit(1));
});

process.on("SIGINT", () => {
  shutdown("SIGINT").then(() => process.exit(0), () => process.exit(1));
});
