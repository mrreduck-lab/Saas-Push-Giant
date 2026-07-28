# Runbook

## Current Prototype

Install dependencies:

```bash
NPM_CONFIG_CACHE=/tmp/npm-cache npm install
```

Build:

```bash
NPM_CONFIG_CACHE=/tmp/npm-cache npm run build
```

Required runtime variables are listed in `.env.example`.

## Diagnostics

- Browser and server push diagnostics: `/debug-push`
- Protected diagnostics endpoint: `/api/push/debug`
- Protected send endpoint: `/api/push/send`

The prototype uses an admin token via `x-admin-token`.

## Push Failure Handling In Prototype

- `404` and `410`: remove subscription from storage.
- Other failures: report in API response.
- Delivery is parallelized and bounded by request timeout.

## Production Runbook Targets

Stage 1 must add:

- Docker Compose clean install.
- API, worker, scheduler healthchecks.
- PostgreSQL migrations.
- Redis queue checks.
- Backup and restore scripts.
- Worker graceful shutdown.
- Queue depth and lag metrics.
- Incident checklist for stuck campaigns.

## First VPS Deployment Notes

Create a separate project on the same VPS used for AI Calories, but keep:

- separate directory;
- separate environment file;
- separate database/schema;
- separate Redis namespace or DB;
- separate reverse-proxy hostnames;
- separate backup path;
- no shared secrets.

Do not deploy until the Docker package exists and clean-install verification passes.
