# Deploy

Deployment target:

- one Docker package for SaaS and on-premise;
- PostgreSQL as durable database;
- Redis/BullMQ for queues;
- Caddy or Nginx reverse proxy;
- backup and restore scripts;
- health and readiness checks.

`docker-compose.target.yml` is a blueprint, not a runnable Stage 0 compose file. A runnable compose must be added during Stage 1 when `apps/api`, `apps/worker`, and `apps/scheduler` exist.
