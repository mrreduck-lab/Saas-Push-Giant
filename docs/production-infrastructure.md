# Push Giant Production Infrastructure

Last verified: 2026-08-06

Status: **live production infrastructure**

This document records the deployed Push Giant infrastructure after the first successful public launch. It is the operational source of truth for the current server placement, runtime topology, domains, TLS, and deployment prerequisites. Secrets and secret values are intentionally excluded.

## Production Endpoint Summary

| Endpoint | Purpose | Upstream |
|---|---|---|
| `https://pushgiant.ru` | Public site | Admin/web container on `127.0.0.1:3101` |
| `https://www.pushgiant.ru` | Public site alias | Admin/web container on `127.0.0.1:3101` |
| `https://app.pushgiant.ru` | SaaS cabinet | Admin/web container on `127.0.0.1:3101` |
| `https://api.pushgiant.ru` | Public API | API container on `127.0.0.1:3100` |

The API currently returns `404` on `/` because no root route is implemented. This confirms request delivery to the API and is not considered a service failure.

## Server

| Parameter | Value |
|---|---|
| Provider | Beget VPS |
| Hostname | `mkqhdalcdn` |
| Public IPv4 | `159.194.228.44` |
| OS | Ubuntu 24.04.4 LTS |
| Docker Engine | 29.1.3 |
| Docker Compose | 2.40.3 |
| Public reverse proxy | system Nginx 1.24.0 |
| Deployment user | `deploy` |

A host restart was reported as required after operating-system updates. Restart must be scheduled separately and followed by a full service verification.

## Filesystem Layout

Current production layout:

```text
/srv/apps/pushgiant/
├── current -> /srv/apps/pushgiant/repo
├── repo/                         # Git checkout, branch main
│   ├── .env -> ../shared/.env
│   ├── deploy/
│   └── ...
└── shared/
    └── .env                      # production secrets, mode 0600
```

Repository:

```text
https://github.com/mrreduck-lab/Saas-Push-Giant
branch: main
```

The repository checkout is owned by `deploy:deploy`. Git may require a `safe.directory` exception when inspected as `root`, but production deployment must use the restricted `deploy` account.

## Runtime Topology

Push Giant is the first isolated Docker Compose application on this VPS.

Active Compose services:

```text
admin
push-api
push-worker
push-scheduler
postgres
redis
```

Observed successful state after launch:

- `admin`: started, Next.js 14.2.35;
- `push-api`: started;
- `push-worker`: started;
- `push-scheduler`: started;
- `postgres`: healthy;
- `redis`: healthy.

Network flow:

```text
Internet
   |
   v
system Nginx :80/:443
   |------------------------------|
   v                              v
127.0.0.1:3101                127.0.0.1:3100
admin / Next.js               push-api
   |                              |
   |------------------------------|
                  |
                  v
          private Docker network
             |             |
             v             v
         PostgreSQL       Redis
```

PostgreSQL and Redis do not publish public host ports. They are reachable only inside the Push Giant Compose network.

## Local Bindings

| Binding | Service | Exposure |
|---|---|---|
| `127.0.0.1:3101` | Admin/web | localhost only, proxied by Nginx |
| `127.0.0.1:3100` | Push API | localhost only, proxied by Nginx |
| container `5432/tcp` | PostgreSQL 16 | Docker network only |
| container `6379/tcp` | Redis 7 | Docker network only |

No Push Giant service binds directly to public ports 80 or 443. This prevents collisions with the system Nginx and existing applications.

## Docker Compose

Production Compose file:

```text
/srv/apps/pushgiant/repo/deploy/docker-compose.target.yml
```

Required invocation pattern:

```bash
cd /srv/apps/pushgiant/repo

docker compose \
  --env-file /srv/apps/pushgiant/shared/.env \
  -f deploy/docker-compose.target.yml \
  ps
```

Full build and start:

```bash
docker compose \
  --env-file /srv/apps/pushgiant/shared/.env \
  -f deploy/docker-compose.target.yml \
  up -d --build
```

The explicit `--env-file` argument is required for reliable Compose interpolation because the Compose file is located under `deploy/` while the production environment file is stored outside the repository working tree.

## Production Environment

Production environment file:

```text
/srv/apps/pushgiant/shared/.env
```

Repository symlink:

```text
/srv/apps/pushgiant/repo/.env -> /srv/apps/pushgiant/shared/.env
```

Security requirements:

- owner: `deploy:deploy`;
- mode: `0600`;
- never committed to Git;
- never printed in logs, chat, CI output, or issue comments;
- backed up only through an encrypted secret-management process.

Verified required secret material exists:

- `POSTGRES_PASSWORD`;
- `DATA_ENCRYPTION_KEY`.

Both were generated with cryptographically secure random values. Their values are intentionally not recorded in GitHub.

Runtime mode:

```text
NODE_ENV=production
```

## DNS

Authoritative DNS is managed in Beget.

Required production records:

| Name | Type | Value |
|---|---|---|
| `pushgiant.ru` | A | `159.194.228.44` |
| `www.pushgiant.ru` | A | `159.194.228.44` |
| `app.pushgiant.ru` | A | `159.194.228.44` |
| `api.pushgiant.ru` | A | `159.194.228.44` |

The previous A record `5.101.152.161` was removed. Multiple A records for the same production hostname must not be introduced unless an explicit load-balancing design is approved.

Beget-generated MX, SPF, `autoconfig`, and `autodiscover` records were left unchanged because they do not interfere with the web application.

## Nginx

System Nginx remains the only public HTTP/HTTPS entry point.

Active virtual host:

```text
/etc/nginx/sites-available/pushgiant
/etc/nginx/sites-enabled/pushgiant -> /etc/nginx/sites-available/pushgiant
```

Routing:

```text
pushgiant.ru       -> http://127.0.0.1:3101
www.pushgiant.ru   -> http://127.0.0.1:3101
app.pushgiant.ru   -> http://127.0.0.1:3101
api.pushgiant.ru   -> http://127.0.0.1:3100
```

Configuration validation and reload:

```bash
nginx -t && systemctl reload nginx
```

Existing Nginx sites for Calories and Vuzbuz were not modified.

## TLS and HTTPS

TLS is issued and installed by Certbot / Let's Encrypt for:

```text
pushgiant.ru
www.pushgiant.ru
app.pushgiant.ru
api.pushgiant.ru
```

HTTPS was successfully enabled on all four names on 2026-07-31.

Certbot integration:

```text
certbot --nginx
```

Certificate renewal is handled by the installed Certbot systemd timer. Renewal must be tested periodically with:

```bash
certbot renew --dry-run
```

HTTP traffic should redirect to HTTPS. Nginx configuration must always pass `nginx -t` before reload.

## Verification Commands

### Containers

```bash
cd /srv/apps/pushgiant/repo

docker compose \
  --env-file /srv/apps/pushgiant/shared/.env \
  -f deploy/docker-compose.target.yml \
  ps
```

### Local web path

```bash
curl -I -H "Host: app.pushgiant.ru" http://127.0.0.1
```

Expected result: `HTTP/1.1 200 OK` with Next.js headers.

### Public HTTPS

```bash
curl -I https://pushgiant.ru
curl -I https://app.pushgiant.ru
curl -i https://api.pushgiant.ru/
```

Expected results:

- public site: HTTP `200`;
- app: HTTP `200`;
- API root: HTTP `404` is currently acceptable until a root or health route is implemented;
- TLS validation succeeds for all domains.

### Nginx

```bash
nginx -t
systemctl status nginx --no-pager
```

### Certificate timer

```bash
systemctl status certbot.timer --no-pager
certbot certificates
```

## Deployment Workflow

Repository workflow:

```text
.github/workflows/deploy.yml
```

Target deployment path:

```text
/srv/apps/pushgiant/repo
```

Expected GitHub configuration:

Repository secrets:

```text
DEPLOY_HOST=159.194.228.44
DEPLOY_USER=deploy
DEPLOY_PORT=22
DEPLOY_PATH=/srv/apps/pushgiant/repo
DEPLOY_SSH_KEY=<private deployment key>
```

Repository variable:

```text
DEPLOY_ENABLED=true
```

The SSH private key must never be stored in the repository. The corresponding public key must be restricted to the `deploy` account on the server.

Current status: the production server and application are live; GitHub Actions automatic deployment from `main` has been verified end to end. The public footer shows the deployed short `main` SHA so the live site can be compared with GitHub.

## Backup and Recovery Status

Current application data is stored in isolated Docker volumes for PostgreSQL and Redis.

Required before pilot data is considered production-safe:

1. automated daily logical PostgreSQL backup;
2. encrypted external backup destination outside this VPS;
3. documented restore test;
4. retention policy;
5. backup monitoring and failure alerting.

GitHub preserves source-code history but does not preserve production database contents, Redis persistence, or the production `.env` file.

## Operational Risks and Open Items

1. Automated PostgreSQL backup and restore verification remain to be implemented.
2. Container CPU and memory limits are not yet documented or enforced.
3. The host reported that an OS restart is required.
4. Release rollback and retention remain to be validated with the Docker-based deployment model.
5. External uptime monitoring is not yet configured.
6. Production smoke checks currently verify web/API readiness, but not real device push delivery.

## Definition of Infrastructure Complete

The first infrastructure milestone is considered achieved because:

- all six Compose services start successfully;
- PostgreSQL and Redis report healthy state;
- Admin is publicly reachable through Nginx;
- API is reachable through its public hostname;
- all four production DNS names point to the VPS;
- Let's Encrypt certificates are installed;
- HTTPS works publicly.

The next infrastructure milestone is **backup and recovery validation**, followed by external monitoring and rollback validation.
