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

Set repository variable `DEPLOY_ENABLED=true` only after the server folder and shared `.env` are ready.

## Server Folder

Recommended layout:

```text
/srv/apps/pushgiant/
  repo/
  .env -> /srv/apps/pushgiant/shared/.env
  shared/
    .env
```

`DEPLOY_PATH` should point to the checkout folder that contains `package.json` and `deploy/docker-compose.target.yml`, for example `/srv/apps/pushgiant/repo`.

The production deploy workflow resolves `../.env` to an absolute `PUSHGIANT_ENV_FILE` path, then passes the same file to Docker Compose and to every app container. This keeps secrets outside the git checkout and prevents Compose interpolation from using a different `.env` file than the app runtime.

The admin dashboard reads live API data through server-side proxy routes. Set these values in the production `.env`:

- `PUSHGIANT_API_URL`, usually `http://push-api:3100` inside Docker;
- `PUSHGIANT_PROJECT_ID`, the pilot project UUID;
- `PUSHGIANT_API_KEY`, an API key with `analytics:read`, `subscribers:read`, `campaigns:write`, and `campaigns:send`.

## First Run

```bash
docker compose --env-file ../.env -p pushgiant -f deploy/docker-compose.target.yml up -d postgres redis
docker compose --env-file ../.env -p pushgiant -f deploy/docker-compose.target.yml run --rm push-api npm run migrate -w @pushgiant/api
docker compose --env-file ../.env -p pushgiant -f deploy/docker-compose.target.yml up -d --build
```

The GitHub deploy workflow runs the same migration step before starting the full stack.
