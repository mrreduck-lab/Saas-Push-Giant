# Stage 1 Status

## Added

- npm workspaces for `apps/*` and `packages/*`.
- `@pushgiant/shared` package with shared zod schemas and TypeScript types.
- `@pushgiant/api` Fastify service with health/readiness endpoints, public project config, subscription payload validation, subscription persistence, campaign persistence, and BullMQ enqueue.
- `@pushgiant/worker` BullMQ consumer skeleton with configurable concurrency.
- `@pushgiant/scheduler` process skeleton for scheduled campaign polling.
- PostgreSQL migration `0001_product_foundation.sql`.
- Demo seed for the Raschini tenant/project.
- Dockerfiles for API, worker, scheduler, and imported Next admin/demo app.
- Root `docker-compose.yml` with Caddy, admin, API, worker, scheduler, PostgreSQL, and Redis.
- Security bump for platform dependencies: Fastify 5, BullMQ 5.81, tsx 4.23, Next 14.2.35.

## Verified

- `npm install --cache /tmp/npm-cache-pushgiant`
- `npm run build:platform`
- `npm run db:migrate:dry`
- `npm run build`

## Still To Implement

- Docker clean-install test on a machine with Docker available.
- Residual `npm audit` high findings remain for Next/PostCSS; resolving them likely requires a Next major upgrade or replacing the imported demo/admin shell.

The removed items moved into Stage 2 and are tracked in [stage-2-status.md](stage-2-status.md).
