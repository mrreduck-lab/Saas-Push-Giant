# Production Autodeploy Status

Last test initiated: 2026-07-31

This file records controlled production autodeploy verification events.

## Test 1

- Trigger: push to `main`
- Expected workflow: `.github/workflows/deploy.yml`
- Expected target: `/srv/apps/pushgiant/repo`
- Expected services: `admin`, `push-api`, `push-worker`, `push-scheduler`, `postgres`, `redis`
- Expected local health check: `http://127.0.0.1:3101/`
- Expected public endpoint after deploy: `https://pushgiant.ru`

Result: pending GitHub Actions execution and verification.
