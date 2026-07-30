# Beget Server Inventory and Push Giant Placement

Last verified: 2026-07-30 08:27 MSK

This document records the current state of the shared Beget VPS and the placement rules for Push Giant. It is based on a read-only server inventory executed under `root` on 2026-07-30.

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
- Docker is installed but currently has no application containers, volumes, or Compose projects.

## Current Products

### Calories AI Diary

| Parameter | Value |
|---|---|
| systemd unit | `calories-ai-diary.service` |
| Status during inspection | active, running |
| Local port | `127.0.0.1:3001` |
| Public domains | `caloriesdiary.com`, `www.caloriesdiary.com` |
| Reverse proxy | system Nginx -> `http://127.0.0.1:3001` |

### Vuzbuz

| Parameter | Value |
|---|---|
| systemd unit | `vuzbuz.service` |
| Status during inspection | active, running |
| Local port | `127.0.0.1:3000` |
| Public domains | `vuzbuz.ru`, `www.vuzbuz.ru` |
| Reverse proxy | system Nginx -> `http://127.0.0.1:3000` |

### AGI Media Engine

| Parameter | Value |
|---|---|
| PM2 process | `agi-media-engine` |
| Status during inspection | online |
| Memory during inspection | about 64 MB |
| Legacy systemd unit | `agi-media-engine.service` exists but is disabled |
| Public port/domain | not identified in the first inventory pass |

## Shared Server Services

### Nginx

System Nginx listens publicly on:

- `0.0.0.0:80` and `[::]:80`;
- `0.0.0.0:443` and `[::]:443`.

Known reverse-proxy mappings:

```text
caloriesdiary.com  -> 127.0.0.1:3001
vuzbuz.ru          -> 127.0.0.1:3000
```

### PostgreSQL

System PostgreSQL 16 is active and listens only on:

```text
127.0.0.1:5432
```

Push Giant must not share a database, database user, schema, credentials, or backup path with another product.

### Docker

Installed version during inspection:

```text
Docker 29.1.3
```

At the time of inspection there were:

- no running containers;
- no stopped application containers;
- no Docker Compose projects;
- no Docker volumes;
- only the default `bridge`, `host`, and `none` networks.

This makes Push Giant a suitable first isolated Docker Compose application on this server.

## Current Listening Ports

| Port | Binding | Purpose |
|---:|---|---|
| 22 | public | SSH |
| 80 | public | Nginx HTTP |
| 443 | public | Nginx HTTPS |
| 3000 | local/application | Vuzbuz |
| 3001 | local/application | Calories AI Diary |
| 5432 | `127.0.0.1` | system PostgreSQL 16 |

Ports for Push Giant must be chosen outside the existing application bindings.

Proposed local bindings:

```text
127.0.0.1:3100  Push Giant API
127.0.0.1:3101  Push Giant web/dashboard
```

These are planned values and must be rechecked immediately before deployment.

## Existing Filesystem

Observed top-level usage:

```text
/srv/apps      about 3.8 GB
/srv/backups   about 1.7 MB
/var/www/html  about 8 KB
```

The exact release/current directory layout of existing applications had not yet been captured in the first inventory pass. It must be documented before changing shared deployment tooling.

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

Shared host-level components may be limited to:

- Linux;
- SSH;
- firewall;
- Docker Engine;
- system Nginx or another reverse proxy;
- host monitoring;
- certificate automation.

Product data services must not be treated as shared infrastructure unless a specific architecture decision explicitly allows it.

## Push Giant Target Placement

Push Giant will be deployed as an isolated Docker Compose project.

Planned server structure:

```text
/srv/apps/pushgiant/
├── repo/
├── shared/
│   └── .env
├── backups/
│   ├── postgres/
│   └── redis/
├── logs/
├── scripts/
│   ├── deploy.sh
│   ├── backup.sh
│   ├── restore.sh
│   └── healthcheck.sh
└── current -> repo
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
3. a PostgreSQL backup;
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

## Items Still to Verify

Before deployment, capture and document:

- actual directory tree below `/srv/apps`;
- systemd unit contents for Calories AI Diary and Vuzbuz;
- current release/current symlink conventions;
- deploy users and SSH restrictions;
- GitHub Actions patterns used by existing products;
- exact AGI Media Engine working directory and runtime path;
- existing PostgreSQL databases and ownership without exposing secrets;
- SSL certificate management method, because Certbot was not found in the first inspection;
- firewall configuration;
- available ports immediately before Push Giant launch;
- backup jobs and external backup destination.

## Change Safety

No existing product service, Nginx virtual host, PostgreSQL database, port binding, or deployment path may be modified as part of Push Giant deployment until the remaining inventory is complete and a rollback procedure is documented.
