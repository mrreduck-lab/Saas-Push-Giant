# Next Commit Plan

Last updated: 2026-08-06  
Status: approved and implemented in Sprint 1 Commit 1

## Commit Goal

Build the correct public PWA test use case:

> marketing page -> install and test CTA -> registration/demo cabinet -> Home Screen guide -> installed PWA -> consent text -> browser permission -> one-shot self push -> reset test subscription.

## Why This Commit

This is the strongest near-term proof of value. A future client should feel the product on their own phone before discussing WordPress, Bitrix, CRM, or pricing.

## Scope

Files changed:

- `app/page.tsx`
- `app/marketing.css`
- `app/dashboard/page.tsx`

Implementation tasks:

1. Add a compact PWA explanation block to the marketing page.
2. Make the primary CTA "Install and test" route to the demo flow.
3. Add iOS/Android Home Screen instructions in a scannable section.
4. Make copy explicit: iPhone push works only from installed PWA.
5. In the dashboard/test card, label the current project as "Push Giant test project".
6. Add a placeholder card for "Client production project" so the user understands the future two-project model.
7. Show consent explanation before `Notification.requestPermission()`.
8. Keep one-shot test isolation: only `pg_test_*`, no reusable audience.
9. Verify typecheck/build.

## Out Of Scope

- real auth;
- paid billing;
- WordPress setup wizard;
- Bitrix module;
- real project switcher backed by sessions;
- campaign editor redesign;
- server schema changes unless a small field is strictly required.

## Acceptance Criteria

- User can understand PWA value from the first page without reading docs.
- Test CTA points to a clear phone-first flow.
- Dashboard blocks test send unless the app is opened as installed PWA.
- User sees separate concepts: "test Push Giant" and "connect my site".
- Production footer marker still shows deployed `main`.
- `npm run typecheck` passes.
- `npm run build` passes.

## Approval Phrase

Implementation was started after approval:

`Подтверждаю Sprint 1 Commit 1: делай install-and-test PWA usecase`

## Sprint 1 Commit 2

Status: implemented

Goal: turn the placeholder two-project model into a real lightweight project selector.

- keep `Push Giant test` as a server-owned safe demo project;
- persist a client trial project after registration;
- route dashboard context by selected project;
- keep one-shot test traffic separate from real subscribers.

Implementation notes:

- `/register` stores the trial project in local browser storage after Core API creates it.
- `/dashboard?project=production` opens the saved client trial project when present.
- Dashboard overview, subscribers, and campaign send can use the selected trial project credentials.
- The one-shot PWA self-test remains on the server-owned demo project.
