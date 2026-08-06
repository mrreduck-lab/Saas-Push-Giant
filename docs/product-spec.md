# Push Giant Product Spec

Status: living specification  
Last updated: 2026-08-06  
Current deployed main at time of update: `fca206a`

## Product Thesis

Push Giant is a SaaS platform that lets a business turn an existing website into a branded PWA with Web Push, install-to-home-screen onboarding, a client dashboard, analytics, and CMS integration without rebuilding the original site.

The first commercial promise is deliberately narrow:

> PWA and push channel for an existing website in one working day.

Future stages can add Wallet, native app generation, CRM automation, AI segmentation, and advanced mobile landing pages, but they must not slow down the first paid launch path.

## MVP User Path

The first shippable MVP is the path a site owner can complete in 15-20 minutes:

1. Register for trial.
2. Create organization and project automatically.
3. Add website domain and PWA branding.
4. Install WordPress plugin or universal SDK.
5. Open the test page from a phone.
6. Add PWA to Home Screen.
7. Open installed PWA from the icon.
8. Accept the notification consent text and browser permission.
9. Send a one-shot test push to the same device.
10. See the subscriber and delivery status in the dashboard.
11. Create the first real campaign for the client project.

## PWA Test Use Case

The correct demo flow is:

1. Marketing page explains briefly what PWA is and why it matters for business.
2. CTA: install and test.
3. User registers or enters the demo cabinet.
4. Page shows iOS/Android install guidance similar in clarity to `web.max.ru`.
5. User adds Push Giant to Home Screen.
6. User opens Push Giant from the installed icon.
7. The app shows a consent explanation before the native notification prompt.
8. Browser shows the standard permission popup.
9. Dashboard sends a one-shot push to this device.
10. Temporary `pg_test_*` subscription is disabled server-side and unsubscribed browser-side.

This is realistic without heavy architecture work because the production code already has a one-shot test endpoint and a PWA standalone gate. The remaining work is mainly UX routing, copy, and separating the demo project from the future real client project.

## Project Model

Each account should have at least two project contexts:

| Project | Purpose | Subscription Rules |
| --- | --- | --- |
| Push Giant test project | Safe demo that proves PWA push works on the current phone | Uses temporary `pg_test_*` subscription and resets after test |
| Client production project | Real project for the client's website | Keeps real subscribers, API keys, PWA config, campaigns, stats |

The test project must never be mixed with the production audience. A test push must not create a reusable marketing segment unless a future explicit QA segment is approved.

## Current MVP Scope

Included:

- marketing site;
- registration/trial shell;
- dashboard shell connected to live API;
- Web Push API, worker, scheduler;
- PostgreSQL and Redis/BullMQ;
- project-scoped VAPID credentials;
- encrypted push endpoint/key storage;
- subscription upsert;
- campaign create and send-now;
- one-shot PWA self-test;
- WordPress ZIP download and plugin foundation;
- production Docker deploy through GitHub Actions.

Not included yet:

- real auth/session model;
- self-serve project switching;
- full billing;
- full campaign editor;
- reusable segments UI;
- SDK event tracking for install/open/click/heartbeat;
- WordPress setup wizard diagnostics;
- Bitrix module;
- RetailCRM/Mindbox production connectors;
- backup and restore verification;
- load testing and external monitoring.

## Non-Goals For MVP

- Native iOS/Android app replacement.
- Background geofence tracking on iOS.
- Apple Wallet / Google Wallet loyalty cards.
- AI segmentation and campaign generation.
- Full CDP.

These can stay in the roadmap, but the first release should sell a simple and credible result: installed PWA plus a working push channel.

