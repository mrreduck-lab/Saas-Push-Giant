# Beget Server Inventory and Push Giant Placement

Last verified: 2026-07-30 08:39 MSK

This document records the current state of the shared Beget VPS and the placement rules for Push Giant. It is based on read-only server inventory executed under `root` on 2026-07-30.

## Server

| Parameter | Value |
|---|---|
| Provider | Beget VPS |
| Hostname | `mkqhdalcdn` |
| Public IPv4 | `159.194.228.44` |
| OS | Ubuntu 24.04.4 LTS |
| Kernel | Linux 6.8.0-134-generic x86_64 |
| Root disk | 38 GB total, about 11 GB used, about 28 GB available |
| RAM | 3.8 GiB total, about 3.0 GiB available during inspection |
| Swap | 2.0 GiB |

A server restart was required at the time of inspection because operating-system updates had been installed.

## Current Runtime Model

The server currently uses a mixed runtime model:

- system Nginx as the public reverse proxy;
- systemd for Calories AI Diary and Vuzbuz;
- PM2 for AGI Media Engine;
- system PostgreSQL 16;
- Docker 29.1.3 is installed but currently has no application containers, volumes, or Compose projects.

## Filesystem Layout

Observed application layout:

```text
/srv/apps/
├── agi-media-engine/
│   ├── current -> one release under releases/
│   ├── releases/
│   └── shared/
├── calories/
│   ├── current -> one release under releases/
│   ├── releases/
│   └── shared/
└── vuzbuz/
    ├── current -> one release under releases/
    ├── releases/
    └── shared/
```

Ownership of all three application directories:

```text
user:  deploy
group: deploy
mode:  drwxr-x---
```

Observed disk usage:

| Path | Approximate size |
|---|---:|
| `/srv/apps/calories` | 2.7 GB |
| `/srv/apps/agi-media-engine` | 777 MB |
| `/srv/apps/vuzbuz` | 400 MB |
| `/srv/apps` total | 3.8 GB |
| `/srv/backups` | 1.7 MB |

The existing products use immutable release directories and a `current` symlink. New deployments should preserve this operational pattern unless Docker Compose fully owns the product lifecycle.

## Current Products

### Calories AI Diary

| Parameter | Value |
|---|---|
| Application directory | `/srv/apps/calories` |
| Current runtime path | `/srv/apps/calories/current` |
| Active release during inspection | `/srv/apps/calories/releases/e4d2cefedf57d66fd4fb31a1be4b3439f965514b` |
| systemd unit | `calories-ai-diary.service` |
| Runtime user/group | `deploy:deploy` |
| Working directory | `/srv/apps/calories/current` |
| Start command | `/usr/bin/npm start` |
| Runtime | Next.js server v15.5.20 |
| Local port | `127.0.0.1:3001` |
| Public domains | `caloriesdiary.com`, `www.caloriesdiary.com` |
| Reverse proxy | system Nginx -> `http://127.0.0.1:3001` |
| Restart policy | `Restart=always`, `RestartSec=3` |

Systemd hardening currently includes `NoNewPrivileges=true` and `PrivateTmp=true`.

### Vuzbuz

| Parameter | Value |
|---|---|
| Application directory | `/srv/apps/vuzbuz` |
| Current runtime path | `/srv/apps/vuzbuz/current` |
| Active release during inspection | `/srv/apps/vuzbuz/releases/2bdf38839c6c85c327ddf52c3a8a52c4eb7abc77` |
| systemd unit | `vuzbuz.service` |
| Runtime user/group | `deploy:deploy` |
| Working directory | `/srv/apps/vuzbuz/current` |
| Start command | `/usr/bin/npm run preview -- --host 127.0.0.1 --port 3000` |
| Runtime | Vite preview server |
| Local port | `127.0.0.1:3000` |
| Public domains | `vuzbuz.ru`, `www.vuzbuz.ru` |
| Reverse proxy | system Nginx -> `http://127.0.0.1:3000` |
| Restart policy | `Restart=always`, `RestartSec=3` |

Systemd hardening currently includes `NoNewPrivileges=true` and `PrivateTmp=true`.

### AGI Media Engine

| Parameter | Value |
|---|---|
| Application directory | `/srv/apps/agi-media-engine` |
| Current runtime path | `/srv/apps/agi-media-engine/current` |
| Release layout | multiple timestamped releases under `/srv/apps/agi-media-engine/releases` |
| Active process manager | PM2 |
| PM2 process | `agi-media-engine` |
| PM2 owner | `root` |
| PM2 home | `/root/.pm2` |
| PM2 working directory | `/srv/apps/agi-media-engine/current` |
| PM2 command | `/usr/bin/npm start` |
| Node.js version | 20.20.2 |
| Status during inspection | online |
| Uptime during inspection | about 3 days |
| Memory during first inspection | about 64 MB |
| Public port/domain | none identified |
| Legacy systemd unit | `agi-media-engine.service` exists but is disabled |

The disabled systemd unit is configured to run as `deploy:deploy` from `/srv/apps/agi-media-engine/current`, while the active PM2 process is owned by `root`. This is an inconsistency and should not be copied into Push Giant. Push Giant processes must not be managed by root-level PM2.

## Shared Server Services

### Nginx

System Nginx listens publicly on ports 80 and 443.

Known mappings:

```text
caloriesdiary.com  -> 127.0.0.1:3001
vuzbuz.ru          -> 127.0.0.1:3000
```

Configuration files:

```text
/etc/nginx/sites-available/caloriesdiary.com
/etc/nginx/sites-enabled/caloriesdiary.com
/etc/nginx/sites-available/vuzbuz
/etc/nginx/sites-enabled/vuzbuz
```

TLS files are stored manually under:

```text
/etc/nginx/tls/caloriesdiary.com/
/etc/nginx/tls/vuzbuz.ru/
```

Certbot was not installed during inspection. Certificate issuance and renewal automation are not yet documented and must be verified before adding Push Giant domains.

### PostgreSQL

System PostgreSQL 16 is active and listens only on:

```text
127.0.0.1:5432
```

The only non-template database detected during inspection was:

```text
postgres
```

No application database was found in the system PostgreSQL instance. Push Giant will not use this shared PostgreSQL service. It will receive its own PostgreSQL container, database, credentials, volume, backup, and restore procedure.

### Docker

Installed version:

```text
Docker 29.1.3
```

At the time of inspection there were:

- no running or stopped application containers;
- no Docker Compose projects;
- no named Docker volumes;
- only the default `bridge`, `host`, and `none` networks.

Push Giant can therefore become the first isolated Docker Compose application on this server without colliding with an existing Compose project.

## Current Listening Ports

| Port | Binding | Purpose |
|---:|---|---|
| 22 | public | SSH |
| 80 | public | Nginx HTTP |
| 443 | public | Nginx HTTPS |
| 3000 | `127.0.0.1` | Vuzbuz |
| 3001 | application binding | Calories AI Diary |
| 5432 | `127.0.0.1` | system PostgreSQL 16 |

Planned local bindings for Push Giant:

```text
127.0.0.1:3100  Push Giant API
127.0.0.1:3101  Push Giant web/dashboard
```

These ports must be rechecked immediately before deployment.

## Deployment User

A dedicated Unix user exists:

```text
user:  deploy
uid:   1000
home:  /home/deploy
shell: /bin/bash
```

Calories and Vuzbuz systemd services run as `deploy`. Push Giant deployment automation should also operate through a restricted non-root deployment identity. Root should be limited to host-level administration.

## Product Isolation Policy

Every application on this server must remain independently deployable and independently movable to another server.

Each product must have:

1. its own GitHub repository;
2. its own `/srv/apps/<project>` directory;
3. its own production environment file;
4. its own runtime services or Docker Compose project;
5. its own database and database credentials;
6. its own Redis instance or isolated Redis deployment;
7. its own Docker network and volumes when Docker is used;
8. its own backup and restore scripts;
9. its own backup directory;
10. its own health endpoints;
11. its own deploy workflow and restricted deploy scope;
12. no shared application secrets;
13. a documented migration procedure to a clean server.

Shared host-level components may be limited to Linux, SSH, firewall, Docker Engine, system Nginx, host monitoring, and certificate automation.

## Push Giant Target Placement

Push Giant will be deployed as an isolated Docker Compose project.

Planned server structure:

```text
/srv/apps/pushgiant/
├── current -> release or repo checkout
├── releases/
├── shared/
│   └── .env
├── backups/
│   ├── postgres/
│   └── redis/
├── logs/
└── scripts/
    ├── deploy.sh
    ├── backup.sh
    ├── restore.sh
    └── healthcheck.sh
```

Planned Compose services:

```text
pushgiant-web
pushgiant-api
pushgiant-worker
pushgiant-scheduler
pushgiant-postgres
pushgiant-redis
```

Planned Docker resources:

```text
network: pushgiant_network
volume:  pushgiant_postgres_data
volume:  pushgiant_redis_data
```

PostgreSQL and Redis must not publish public ports. They must be reachable only inside the Push Giant Docker network.

## Planned Domains

```text
pushgiant.ru
www.pushgiant.ru
app.pushgiant.ru
api.pushgiant.ru
```

All public traffic will terminate at the existing system Nginx and be proxied to local Push Giant ports.

## Portability Requirement

The complete Push Giant product must be restorable on a new server using:

1. a fresh clone of this repository;
2. the production environment file transferred through a secure channel;
3. a logical PostgreSQL backup;
4. required Redis persistence only if needed by the queue recovery policy;
5. Docker Engine and Docker Compose;
6. `docker compose up -d` after database restoration;
7. Nginx configuration and DNS switch.

The normal migration path must not require extracting Push Giant records from a database shared with another product.

## Backup Principle

Database migration and disaster recovery should use logical PostgreSQL backups as the primary portable format:

```bash
pg_dump -Fc pushgiant > pushgiant.dump
pg_restore -d pushgiant pushgiant.dump
```

Docker volume snapshots may be used as an additional recovery method, but they must not be the only documented migration mechanism.

## Risks and Findings

1. AGI Media Engine is currently managed by root-level PM2 despite having a disabled non-root systemd unit. This should be corrected in the AGI project, not during Push Giant deployment.
2. Certificate renewal automation is unknown because Certbot is absent and TLS files are manually referenced from `/etc/nginx/tls`.
3. No application-level backup timers or root cron jobs were detected.
4. Existing release directories include full `node_modules` trees and consume most of `/srv/apps`; release retention must be controlled.
5. The server reports that a restart is required after operating-system updates.

## Items Still to Verify Before Push Giant Deployment

- exact `current` symlink target for AGI Media Engine;
- GitHub Actions deployment scripts and release retention rules used by current products;
- firewall configuration;
- TLS issuance and renewal mechanism;
- external backup destination;
- exact free ports immediately before launch;
- memory and disk limits for each Push Giant container;
- rollback procedure for the first production deployment.

## Change Safety

No existing product service, Nginx virtual host, PostgreSQL database, port binding, TLS file, deployment path, or process manager may be modified as part of Push Giant deployment without an explicit rollback procedure.