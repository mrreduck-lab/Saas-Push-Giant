# Deploy

Deployment target:

- one Docker package for SaaS and on-premise;
- PostgreSQL as durable database;
- Redis/BullMQ for queues;
- host Nginx reverse proxy;
- backup and restore scripts;
- health and readiness checks.

`docker-compose.target.yml` is the production blueprint used by the GitHub Actions deploy workflow.

## GitHub Secrets

Required for `.github/workflows/deploy.yml`:

- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_SSH_KEY`
- `DEPLOY_PATH`
- `DEPLOY_PORT` optional, defaults to `22`

Set repository variable `DEPLOY_ENABLED=true` only after the server folder and `.env` are ready.

## Server Folder

Recommended layout:

```text
/srv/apps/pushgiant/
  repo or current checkout
  .env
```

`DEPLOY_PATH` should point to the checkout folder that contains `package.json` and `deploy/docker-compose.target.yml`.

## First Run

```bash
docker compose -f deploy/docker-compose.target.yml up -d postgres redis
docker compose -f deploy/docker-compose.target.yml run --rm push-api npm run migrate -w @pushgiant/api
docker compose -f deploy/docker-compose.target.yml up -d --build
```

The GitHub deploy workflow runs the same migration step before starting the full stack.
