export type ApiConfig = {
  env: string;
  host: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  corsOrigins: string[];
};

export function loadConfig(): ApiConfig {
  return {
    env: process.env.NODE_ENV ?? "development",
    host: process.env.API_HOST ?? "0.0.0.0",
    port: Number(process.env.API_PORT ?? 3100),
    databaseUrl: process.env.DATABASE_URL ?? "postgres://pushgiant:pushgiant@localhost:5432/pushgiant",
    redisUrl: process.env.REDIS_URL ?? "redis://localhost:6379",
    corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  };
}
