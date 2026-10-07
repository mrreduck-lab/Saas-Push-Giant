# Commercial MVP Sprint

Updated: 2026-10-07
Branch: `feature/commercial-mvp`
Goal: make the first external customer path work end-to-end before UX polish and Wallet.

## Definition of done

A new customer can complete this path without developer intervention:

`trial registration -> project -> site connection -> first subscriber -> test push -> first campaign -> delivery result`

Production merge happens only after build/checks pass. Production deploy remains from `main` only.

## Already implemented / verified baseline

- [x] Trial registration flow exists.
- [x] Trial provisioning creates organization/project credentials.
- [x] Project context/API-key based platform calls exist.
- [x] Dashboard already exposes project selection/context.
- [x] Subscribers API/UI exists.
- [x] Campaign API/UI exists.
- [x] Test push flow exists.
- [x] Delivery worker and scheduler exist.
- [x] Web Push/PWA contour exists.
- [x] WordPress plugin ZIP is available from the product UI.
- [x] Production Docker/autodeploy contour exists.

These items are baseline capabilities, not new work in this sprint.

## Sprint tasks

### CMVP-01 — Single onboarding state
- [x] Turn the existing capabilities into one ordered onboarding checklist in the customer dashboard.
- [x] Persist/derive completion state from real project data rather than cosmetic flags.
- [x] Show the next required action.

### CMVP-02 — Site connection
- [ ] Make connection instructions customer-safe and project-specific.
- [ ] Expose only the credentials/configuration actually required by the integration.
- [ ] Keep WordPress as the first supported guided path.
- [ ] Add a clear connection/diagnostic result.

### CMVP-03 — First subscriber
- [ ] Make subscriber arrival visible in onboarding.
- [ ] Provide an explicit waiting/empty state before the first subscription.
- [ ] Confirm that a real active subscription advances onboarding.

### CMVP-04 — Test push
- [ ] Make test push the next action after an active subscriber exists.
- [ ] Surface success/failure clearly.
- [ ] Prevent misleading success when no deliverable subscriber exists.

### CMVP-05 — First campaign
- [ ] Provide the minimum create-and-send campaign path.
- [ ] Default to a safe active-subscriber audience.
- [ ] Show campaign/delivery status after send.

### CMVP-06 — Pilot readiness
- [ ] Verify the complete flow with a fresh trial account.
- [ ] Run production build/checks.
- [ ] Document known limitations for the first 3–5 pilot customers.
- [ ] Merge to `main` only after verification.

## Explicitly outside this sprint

- Visual redesign / UX polish beyond blockers to completing onboarding.
- Apple Wallet / Google Wallet.
- RetailCRM, 1C and OSMI migration.
- Billing automation beyond what is necessary to run the pilot.
- Broad integration catalogue beyond the first guided connection path.

## Next sprint

Dedicated UX/design review: walk the product as a new customer, test clarity of copy, navigation, visual hierarchy and conversion friction, then polish before/alongside the first external pilots.

## Work log

### 2026-10-07
- Created `feature/commercial-mvp` from the current `main`.
- Audited current dashboard, trial provisioning, platform API surface and WordPress download.
- Confirmed that the major push primitives already exist; the sprint is primarily about closing the customer journey rather than rebuilding delivery.
- Added this sprint tracker as the source of truth for planned and completed Commercial MVP work.
- CMVP-01 implemented: dashboard now has a six-step Commercial MVP onboarding checklist, derives progress from trial/project/site/subscriber/send data, and highlights the next required action. Commit: `0a2861a`.

## Logging rule

Every meaningful implementation commit in this sprint must update this file: mark completed tasks, add the commit/result to the Work log, and record blockers/known limitations.