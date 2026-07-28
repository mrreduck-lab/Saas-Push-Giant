import { Worker } from "bullmq";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
const concurrency = Number(process.env.WORKER_CONCURRENCY ?? 10);
const connection = {
  url: redisUrl,
  maxRetriesPerRequest: null
};

const worker = new Worker(
  "campaign-delivery",
  async (job) => {
    console.log(JSON.stringify({
      level: "info",
      message: "campaign delivery job accepted",
      jobId: job.id,
      name: job.name,
      data: job.data
    }));

    return { accepted: true };
  },
  { connection, concurrency }
);

const shutdown = async (signal: string) => {
  console.log(JSON.stringify({ level: "info", message: "shutting down worker", signal }));
  await worker.close();
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM").then(() => process.exit(0), () => process.exit(1));
});

process.on("SIGINT", () => {
  shutdown("SIGINT").then(() => process.exit(0), () => process.exit(1));
});
