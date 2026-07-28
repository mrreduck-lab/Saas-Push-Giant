# Stage 2 Status

## Added

- API-key authentication for campaign management endpoints.
- Project/organization scoped API-key checks.
- API-key hashing with stored prefix lookup; raw keys are not stored.
- AES-256-GCM envelope encryption for subscription endpoint, `p256dh`, `auth`, and VAPID private key material.
- Backward-compatible decrypt fallback for old development base64 envelopes.
- `@pushgiant/worker` delivery execution through `web-push`.
- Delivery attempt persistence in `delivery_attempts`.
- Subscription failure handling with automatic disable on provider `404` or `410`.
- Campaign batch records with sent/failed counters.
- `@pushgiant/scheduler` due scheduled campaign polling and BullMQ enqueue.
- Migration `0002_delivery_execution.sql`.
- Deploy workflow now runs migrations before starting the full stack.

## Implemented API Surface

| Endpoint | Auth |
| --- | --- |
| `GET /healthz` | Public |
| `GET /readyz` | Public |
| `GET /v1/projects/:projectId/config` | Public |
| `POST /v1/subscriptions/upsert` | Public SDK payload |
| `POST /v1/campaigns` | API key with `campaigns:write` |
| `POST /v1/campaigns/:campaignId/send-now` | API key with `campaigns:send` |

## Required Runtime Variables

- `DATABASE_URL`
- `REDIS_URL`
- `DATA_ENCRYPTION_KEY`
- `WORKER_CONCURRENCY`
- `WEB_PUSH_SEND_CONCURRENCY`
- `CAMPAIGN_BATCH_SIZE`
- `SCHEDULER_INTERVAL_MS`
- `SCHEDULER_CAMPAIGN_LIMIT`

`DATA_ENCRYPTION_KEY` should be a 32-byte base64 value or a 64-character hex value in production.

## Verified

- `npm install --cache /tmp/npm-cache-pushgiant`
- `npm run build:platform`
- `npm run db:migrate:dry`
- `npm run build`

## Still To Implement

- Public SDK project token or origin/domain validation for subscription upsert.
- API endpoints to revoke subscriptions, record SDK events, heartbeat, geo consent, and clicks.
- Campaign stats endpoint.
- Admin UI for organizations, projects, API keys, campaigns, subscribers, and stats.
- VAPID key rotation endpoint and safe key-generation workflow.
- Delivery retry policy tuned by provider status and rate limits.
- Automated integration tests with fake Web Push provider.
- Docker clean-install test on a machine with Docker available.
