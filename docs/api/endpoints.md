# API Endpoint Draft

All write endpoints must require either a project public key, server API key, admin session, or signed webhook depending on the caller.

## SDK/Public

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/v1/projects/:projectId/config` | Load public project config |
| `GET` | `/v1/projects/:projectId/vapid-public-key` | Load public VAPID key |
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
| `POST` | `/v1/campaigns/:id/schedule` | Schedule campaign |
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
