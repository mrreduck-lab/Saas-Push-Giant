# Push Giant Project Status

Last updated: 2026-08-06  
Production marker observed before this update: `main fca206a`

## Executive Summary

Push Giant has moved from a Raschini PWA prototype into a deployed SaaS foundation. The production site, API, worker, scheduler, PostgreSQL, Redis, GitHub Actions deploy, and one-shot PWA test flow are now in place.

The product is not yet a clean self-serve commercial MVP. The next work should focus on the first buyer demo path: marketing page -> install PWA -> permission -> one-shot test push -> dashboard -> real client project setup.

## Done

| Area | Status |
| --- | --- |
| Repository split | Product repo exists at `mrreduck-lab/Saas-Push-Giant`; Raschini remains a demo/reference, not the core |
| Production infrastructure | Beget VPS, Nginx, TLS, Docker Compose, PostgreSQL, Redis, API, admin/web are live |
| Autodeploy | GitHub Actions deploy from `main` has been verified with successful production deploys |
| Deploy marker | Footer shows deployed short `main` SHA so production freshness is visible |
| API foundation | Fastify API, migrations, repositories, health/ready endpoints |
| Delivery core | BullMQ queue, worker, scheduler, delivery attempts, 404/410 cleanup |
| Security baseline | API key hashing, project-scoped checks, encrypted subscription and VAPID private material |
| Dashboard | Live overview, subscribers table, send-now form, PWA/test blocks |
| One-shot PWA test | Temporary `pg_test_*` subscription, standalone PWA gate, send one push, reset subscription |
| Demo VAPID | Demo seed generates real VAPID credentials when placeholder is found |
| WordPress | ZIP download and plugin foundation are present |
| Docs | Architecture, runbook, infrastructure, stage status files exist |

## Partially Done

| Area | Current Gap |
| --- | --- |
| Marketing page | Product positioning exists, but install-and-test use case is not yet the main CTA flow |
| Registration | Trial page exists, but auth/session and real user ownership are not finished |
| Project model | Demo project exists; UI does not yet expose "test project" vs "client production project" clearly |
| SDK | Core package exists; heartbeat, click/open events, install events, consent versioning need completion |
| Campaigns | Send-now works; campaign editor, preview, safety checks, stats, scheduling UI are missing |
| Segmentation | Data model direction exists; no production segment builder yet |
| WordPress plugin | ZIP exists; setup wizard, diagnostics, WooCommerce events need hardening |
| Bitrix | Marketing page exists; module implementation is not done |
| Integrations | Mindbox/RetailCRM are designed, not production-ready |
| Ops | Backups, restore test, uptime monitoring, rollback runbook, load tests remain open |

## Risks

1. The current dashboard is still a pilot interface, not a real multi-tenant admin.
2. Subscription upsert still needs public project token or origin/domain validation before open commercial use.
3. Push delivery acceptance is not the same as notification display; product copy and analytics must stay honest.
4. iOS push requires installed PWA mode; the demo flow must block browser-tab testing.
5. Production data is not pilot-safe until backup and restore are verified.
6. Existing local worktrees may contain unrelated dirty changes; production changes should continue from clean `origin/main`.

## Next Decision

Approve Sprint 1, Commit 1:

> Build the public install-and-test PWA use case on the marketing site and connect it to the existing dashboard self-test flow.

