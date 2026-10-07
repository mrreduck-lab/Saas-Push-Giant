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
- [x] Make connection instructions customer-safe and project-specific.
- [x] Expose only the credentials/configuration actually required by the integration.
- [x] Keep WordPress as the first supported guided path.
- [x] Add a clear connection/diagnostic result.

### CMVP-03 — First subscriber
- [x] Make subscriber arrival visible in onboarding.
- [x] Provide an explicit waiting/empty state before the first subscription.
- [x] Confirm that a real active subscription advances onboarding.

### CMVP-04 — Test push
- [x] Make test push the next action after an active subscriber exists.
- [x] Surface success/failure clearly.
- [x] Prevent misleading success when no deliverable subscriber exists.

### CMVP-05 — First campaign
- [x] Provide the minimum create-and-send campaign path.
- [x] Default to a safe active-subscriber audience.
- [x] Show campaign/delivery status after send.

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

### 2026-10-07 · CMVP-02–05 implementation
- CMVP-02: SDK heartbeat now reports the live site origin; matching registered domains are automatically marked verified and the dashboard shows a project-specific WordPress connection diagnostic.
- CMVP-03: subscriber state is visible with an explicit waiting state, manual refresh and 15-second automatic refresh; onboarding advances only on an active push subscription.
- CMVP-04: production project can send one test notification to the latest active subscriber; the action is disabled when there is no deliverable active subscription and surfaces provider success/failure.
- CMVP-05: campaign send remains the minimum create+queue path and the dashboard now reads back recent campaign status with sent/failed batch counters.
- Verification and production acceptance are still pending; checkboxes above describe implementation state, not production acceptance.
- Hardened customer-domain operation: API CORS reflects customer origins, while subscription/heartbeat/event/geo writes validate the Origin against the project's registered domain. The isolated `pushgiant_test` one-shot path remains server-mediated.
- Production deploy smoke now checks public web, dashboard, API health/readiness and the browser SDK.

## Pilot limitations
- First guided integration is WordPress / browser SDK.
- Site verification requires a heartbeat from the exact host registered during trial; public SDK writes are rejected when the browser Origin does not match that registered host.
- Test push targets the most recently seen active subscription; per-subscriber selection is deferred.
- Campaign audience is the current default active-subscriber delivery path; advanced segment builder is deferred.
- Trial credentials currently live in the browser's local trial context; full server-side account session hardening is a follow-up before broad self-serve launch.

## Iteration budget
- CMVP-01: 1 implementation iteration + production deploy.
- CMVP-02: 8 implementation/hardening iterations so far (limit 20).
- CMVP-03: 1 implementation iteration so far (limit 20).
- CMVP-04: 2 implementation iterations so far (limit 20).
- CMVP-05: 2 implementation iterations so far (limit 20).
- CMVP-06: 2 verification/hardening iterations so far (limit 20).

## Logging rule

Every meaningful implementation commit in this sprint must update this file: mark completed tasks, add the commit/result to the Work log, and record blockers/known limitations.