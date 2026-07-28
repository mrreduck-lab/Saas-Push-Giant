# Saas Push Giant

Saas Push Giant is the product repository for the "PWA in 1 day" service: a portable SaaS/on-premise platform that turns an existing client website into a branded PWA with web push notifications, install-to-home-screen flow, admin tooling, analytics, and future mobile landing pages.

The current codebase was imported from the working Raschini PWA prototype:

- Source prototype: https://github.com/mrreduck-lab/raschini-site
- Product repository: https://github.com/mrreduck-lab/Saas-Push-Giant
- Baseline tag: `raschini-pwa-prototype`
- Baseline SHA: `7f435e0559dba0ecbd9183f4e9b83acd2cda7a6c`

The Raschini implementation must remain a demo tenant/theme and reference push contour, not the hardcoded product core.

## Current Prototype

The imported app is a Next.js 14 PWA prototype with:

- branded Raschini landing page;
- web app manifest and app icons;
- service worker at `public/sw.js`;
- client prompt in `app/components/PushPrompt.tsx`;
- subscription save endpoint at `app/api/push/subscribe/route.ts`;
- public VAPID key endpoint at `app/api/push/public-key/route.ts`;
- protected push sending endpoint at `app/api/push/send/route.ts`;
- protected diagnostics endpoint and page;
- Redis REST based subscription storage in `lib/push-store.ts`.

## Verified Baseline

```bash
NPM_CONFIG_CACHE=/tmp/npm-cache npm install
NPM_CONFIG_CACHE=/tmp/npm-cache npm run build
```

Result: production build passes.

Important warning: Next.js has been upgraded to `14.2.35`, but `npm audit` still reports a high-severity advisory in the Next/PostCSS chain. The next hardening decision is either a Next major upgrade or isolating/replacing the imported demo admin surface.

## Product Direction

The target system is split into independent parts:

- Push Platform Backend: API, worker, scheduler, PostgreSQL, Redis/BullMQ, OpenAPI.
- Web Admin: organizations, projects, PWA settings, campaigns, subscribers, stats, integrations.
- Client SDK/Widget: service worker registration, subscription upsert, install guidance, events.
- WordPress Plugin: setup wizard, SDK injection, manifest/service worker support, WooCommerce events.
- Bitrix Module: admin setup, SDK injection, user/order events, diagnostics.

See [ARCHITECTURE.md](ARCHITECTURE.md), [RUNBOOK.md](RUNBOOK.md), [SECURITY.md](SECURITY.md), and `docs/`.

## Stage 1 Foundation

The first product foundation scaffold now lives in:

- `apps/api` - Fastify API service.
- `apps/worker` - BullMQ delivery worker.
- `apps/scheduler` - scheduled campaign process.
- `packages/shared` - shared schemas and TypeScript types.
- `migrations` - PostgreSQL schema migrations.

Stage 1 status is tracked in [docs/stage-1-status.md](docs/stage-1-status.md).

## Stage 2 Delivery Core

The second product layer adds:

- API-key auth for campaign creation and send-now.
- Project/organization scoped API-key checks.
- AES-GCM envelope encryption for stored push endpoint/key material.
- Delivery worker with `web-push`, batch records, delivery attempts, and `404/410` subscription disable handling.
- Scheduler polling for due scheduled campaigns.
- Deploy workflow migration step before service startup.

Stage 2 status is tracked in [docs/stage-2-status.md](docs/stage-2-status.md).

## Development Rules

- Do not change `raschini-site`; all product work happens here.
- Do not commit VAPID private keys, admin tokens, Redis credentials, customer data, or production dumps.
- Keep commits small and verifiable.
- Before major stages, run build/tests and later Docker clean-install checks.
- Keep the product portable: our VPS and customer VPS must use the same business logic and Docker package.
