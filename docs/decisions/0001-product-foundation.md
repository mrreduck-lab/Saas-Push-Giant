# Decision 0001: Product Foundation

## Decision

Build Saas Push Giant as a portable Node.js/TypeScript platform with PostgreSQL as durable storage and Redis/BullMQ for background jobs.

## Rationale

- PostgreSQL gives reliable tenant isolation, reporting, migrations, and backups.
- Redis/BullMQ gives durable campaign queues, controlled concurrency, retries, and worker scaling.
- Node.js keeps implementation close to the browser SDK/service worker domain.
- Docker Compose supports both shared SaaS infrastructure and customer on-premise installs.

## Consequences

- The imported Next.js app becomes a demo/admin/reference layer, not the delivery core.
- Push delivery moves out of request/response routes into workers.
- Upstash/Vercel-specific assumptions must be removed from the core.
