import { loadConfig } from "./config.js";
import { createDatabase } from "./db.js";
import { createQueues } from "./queues.js";
import { buildServer } from "./server.js";

const config = loadConfig();
const database = createDatabase(config.databaseUrl);
const queues = createQueues(config.redisUrl);
const server = buildServer({ config, database, queues });

const shutdown = async (signal: string) => {
  server.log.info({ signal }, "shutting down api");
  await server.close();
  await queues.close();
  await database.close();
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM").then(() => process.exit(0), () => process.exit(1));
});

process.on("SIGINT", () => {
  shutdown("SIGINT").then(() => process.exit(0), () => process.exit(1));
});

await server.listen({ host: config.host, port: config.port });
