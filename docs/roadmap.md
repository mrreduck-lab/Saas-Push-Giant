# Push Giant Roadmap

Last updated: 2026-08-06

## Sprint 0 - Production Foundation

Status: mostly complete.

Goal: make Push Giant deployable and observable enough to continue product work through GitHub.

Completed:

- isolated production Docker stack;
- public HTTPS for `pushgiant.ru`, `www`, `app`, `api`;
- GitHub Actions autodeploy from `main`;
- visible deployed `main` marker in footer;
- API, worker, scheduler, Postgres, Redis;
- demo seed and project-scoped VAPID;
- one-shot PWA test push endpoint and dashboard UI.

Remaining:

- external uptime monitoring;
- automated database backups;
- restore test;
- rollback procedure validation.

## Sprint 1 - Buyer Demo And PWA Test

Status: in progress; Commit 1 implements the install-and-test public flow.

Goal: make the first screen explain the product and let a future client test a real PWA push on their phone.

Deliverables:

- marketing-page section: what PWA is, why business needs it, what Push Giant adds;
- primary CTA: "Install and test";
- install guide for iOS/Android with clear Home Screen steps;
- route from marketing page to demo/test cabinet;
- consent explanation before browser permission prompt;
- clear block when user is not in installed PWA mode;
- dashboard distinction between Push Giant test project and client production project;
- smoke check that production page contains the current deploy marker.

Definition of done:

- iPhone user understands that Safari tab is not enough;
- Android user can still follow the same installed-PWA flow;
- test push uses temporary `pg_test_*` subscription only;
- real campaign audience remains untouched;
- `npm run typecheck` and `npm run build` pass.

## Sprint 2 - Self-Serve Trial And Project Setup

Goal: make a client create a real project after the demo without manual database work.

Deliverables:

- registration flow creates organization, owner, project, API key, PWA config, VAPID credentials;
- project switcher: test project vs production project;
- domain entry and verification checklist;
- first-run onboarding checklist;
- API key display/copy with safe masking;
- trial limits: 14 days or 100 pushes.

## Sprint 3 - WordPress Install To First Subscriber

Goal: make WordPress the first paid integration path.

Deliverables:

- plugin setup wizard;
- API key validation;
- manifest route validation;
- service worker scope diagnostics;
- SDK injection toggle;
- test subscription from plugin admin;
- WooCommerce events foundation: view product, add to cart, order.

## Sprint 4 - Campaign Safety And Analytics

Goal: make the first real campaign safe enough for a business user.

Deliverables:

- campaign composer;
- segment/count preview;
- send safety confirmation;
- scheduled send UI;
- sent/failed/open metrics;
- click/open event capture;
- campaign history table.

## Sprint 5 - Reliability And Commercial Readiness

Goal: make pilot data and paid operations safe.

Deliverables:

- automated PostgreSQL backups;
- restore test;
- uptime monitoring;
- deployment rollback runbook;
- fake Web Push integration tests;
- basic load test;
- billing plan gates and invoices/manual payment support.

## Later Stages

| Stage | Scope |
| --- | --- |
| Stage 2 automation | Welcome, abandoned cart, birthday, reminders, RSS push |
| Stage 3 Wallet | Apple Wallet, Google Wallet, loyalty cards, coupons, OSMI connector |
| Stage 4 App builder | Android/iOS generation, APNs, FCM, unified app dashboard |
| Stage 5 Marketing automation | CDP, timeline, AI segmentation, AI recommendations, AI push generation |
