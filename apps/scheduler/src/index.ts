const intervalMs = Number(process.env.SCHEDULER_INTERVAL_MS ?? 60_000);

console.log(JSON.stringify({
  level: "info",
  message: "scheduler started",
  intervalMs
}));

const tick = () => {
  console.log(JSON.stringify({
    level: "info",
    message: "scheduler tick",
    at: new Date().toISOString()
  }));
};

const timer = setInterval(tick, intervalMs);
timer.unref();

const shutdown = (signal: string) => {
  console.log(JSON.stringify({ level: "info", message: "shutting down scheduler", signal }));
  clearInterval(timer);
};

process.on("SIGTERM", () => {
  shutdown("SIGTERM");
  process.exit(0);
});

process.on("SIGINT", () => {
  shutdown("SIGINT");
  process.exit(0);
});
