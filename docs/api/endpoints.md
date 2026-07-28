# API Endpoint Draft

All write endpoints must require either a project public key, server API key, admin session, or signed webhook depending on the caller.

Implemented Stage 2 server API keys are accepted as either:

- `Authorization: Bearer <api-key>`
- `x-api-key: <api-key>`

Current scopes:

| Scope | Allows |
| --- | --- |
| `campaigns:write` | Create draft/scheduled campaigns |
| `campaigns:send` | Queue a campaign for immediate delivery |

## SDK/Public

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/projects/:projectId/config` | Load public project config |
| `POST` | `/v1/subscriptions/upsert` | Create/update subscription by `endpoint_hash` |
| `DELETE` | `/v1/subscriptions` | Disable a subscription |
| `POST` | `/v1/subscriptions/heartbeat` | Update `last_seen_at`, permission, browser state |
| `POST` | `/v1/events` | Send SDK events |
| `POST` | `/v1/geo/update` | Save explicit last-known location |
| `DELETE` | `/v1/geo` | Remove geo data and revoke geo consent |

## Admin/API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/organizations` | Create organization |
| `POST` | `/v1/projects` | Create project |
| `GET` | `/v1/projects/:id` | Read project |
| `PATCH` | `/v1/projects/:id/pwa` | Update PWA config |
| `POST` | `/v1/projects/:id/vapid/rotate` | Rotate VAPID keys |
| `POST` | `/v1/assets` | Upload icon/image asset |
| `POST` | `/v1/campaigns` | Create draft campaign |
| `POST` | `/v1/campaigns/:id/send-now` | Queue immediate campaign |
| `POST` | `/v1/campaigns/:id/cancel` | Cancel campaign |
| `GET` | `/v1/campaigns/:id/stats` | Campaign accepted/failed/retried/clicked stats |
| `GET` | `/v1/subscribers` | Search subscribers |
| `GET` | `/v1/audit-log` | Audit log |

## Integrations

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/v1/webhooks/mindbox/push` | Mindbox custom action to queue a push |
| `POST` | `/v1/webhooks/:integration/events` | Generic signed inbound events |
| `POST` | `/v1/integrations/mindbox/test` | Verify credentials and mapping |

## Health

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/healthz` | Liveness |
| `GET` | `/readyz` | Readiness: database and Redis |
| `GET` | `/metrics` | Internal metrics endpoint |

## Stage 2 Implemented

| Method | Path | Auth | Status |
| --- | --- | --- | --- |
| `GET` | `/healthz` | Public | Implemented |
| `GET` | `/readyz` | Public | Implemented |
| `GET` | `/v1/projects/:projectId/config` | Public | Implemented |
| `POST` | `/v1/subscriptions/upsert` | Public SDK payload | Implemented |
| `POST` | `/v1/campaigns` | API key with `campaigns:write` | Implemented |
| `POST` | `/v1/campaigns/:campaignId/send-now` | API key with `campaigns:send` | Implemented |

`scheduled_at` on `POST /v1/campaigns` creates a scheduled campaign. The scheduler queues due campaigns automatically.
