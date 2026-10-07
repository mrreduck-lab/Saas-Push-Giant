# Three User Paths + Owner Admin Sprint

Updated: 2026-10-08
Branch: `feature/three-user-paths-admin`

## Goal
Implement the three product journeys approved in the product diagram.

## Paths

### PATH-1 — Test through Push Giant
- [x] Dedicated test experience that does not require the customer's own site.
- [x] Browser subscribes to the Push Giant test project.
- [x] User can send a push from the same test cabinet to the test subscription.
- [x] Clear permission/subscription/send/delivery states.

### PATH-2 — Test through customer's own site/app
- [x] Trial registration and customer project provisioning exist.
- [x] Customer dashboard exists.
- [x] WordPress/browser SDK connection path exists.
- [x] First subscriber, project test push and campaign flow exist.
- [x] Make the customer cabinet visually explicit as a separate path from Push Giant test mode.
- [x] Keep site/app connection, subscribers, test push, campaigns and delivery results together.

### PATH-3 — Push Giant owner admin
- [x] Replace the current /admin placeholder with an owner dashboard.
- [x] Show registrations/users.
- [x] Show organizations/projects and registered domains.
- [x] Show subscriber counts and campaign/delivery activity.
- [x] Show recent registrations and recent projects.
- [x] Protect owner API with admin secret/token.

## Acceptance
- [x] CI passes.
- [x] Production deploy passes.
- [x] Production smoke covers /admin and the test path in addition to existing customer dashboard/API/SDK checks.
- [x] Provide production links for manual acceptance.

## Work log
### 2026-10-08 · implementation
- PATH-1: added `/test-push` as a hosted test application. It loads trial credentials from the existing browser context, requests browser notification permission, registers an isolated test subscription and sends a push back to that test subscription from the same screen.
- PATH-2: customer dashboard is explicitly labelled as the customer's own site/app path and links back to hosted test and owner admin.
- PATH-3: replaced the `/admin` placeholder with a protected owner dashboard. Added protected aggregate API for users, organizations, projects, domains, active subscriptions, campaigns and sent deliveries.
- Admin data requires `PUSH_ADMIN_TOKEN`; client project API keys cannot access it.
- Acceptance checkboxes are implementation targets; CI/production items must be reverted if verification fails.


### 2026-10-08
- Audited current main after Commercial MVP deployment.
- Confirmed /admin is only a placeholder redirect-style page; owner registration/project overview is not implemented yet.
- Confirmed customer dashboard already contains most of PATH-2.
- Confirmed one-shot test infrastructure exists and can be promoted into a clear PATH-1 UI.
