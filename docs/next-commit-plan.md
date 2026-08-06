# Next Commit Plan

Last updated: 2026-08-06  
Status: proposed, awaiting approval

## Commit Goal

Build the correct public PWA test use case:

> marketing page -> install and test CTA -> registration/demo cabinet -> Home Screen guide -> installed PWA -> consent text -> browser permission -> one-shot self push -> reset test subscription.

## Why This Commit

This is the strongest near-term proof of value. A future client should feel the product on their own phone before discussing WordPress, Bitrix, CRM, or pricing.

## Scope

Files likely to change:

- `app/page.tsx`
- `app/globals.css` or page-scoped CSS
- `app/dashboard/page.tsx`
- possibly `app/register/page.tsx`
- possibly `app/product-data.ts`

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

To start implementation, approve:

`Подтверждаю Sprint 1 Commit 1: делай install-and-test PWA usecase`

