# Three User Paths + Owner Admin Sprint

Updated: 2026-10-08
Branch: `feature/three-user-paths-admin`

## Goal
Implement the three product journeys approved in the product diagram.

## Paths

### PATH-1 — Test through Push Giant
- [ ] Dedicated test experience that does not require the customer's own site.
- [ ] Browser subscribes to the Push Giant test project.
- [ ] User can send a push from the same test cabinet to the test subscription.
- [ ] Clear permission/subscription/send/delivery states.

### PATH-2 — Test through customer's own site/app
- [x] Trial registration and customer project provisioning exist.
- [x] Customer dashboard exists.
- [x] WordPress/browser SDK connection path exists.
- [x] First subscriber, project test push and campaign flow exist.
- [ ] Make the customer cabinet visually explicit as a separate path from Push Giant test mode.
- [ ] Keep site/app connection, subscribers, test push, campaigns and delivery results together.

### PATH-3 — Push Giant owner admin
- [ ] Replace the current /admin placeholder with an owner dashboard.
- [ ] Show registrations/users.
- [ ] Show organizations/projects and registered domains.
- [ ] Show subscriber counts and campaign/delivery activity.
- [ ] Show recent registrations and recent projects.
- [ ] Protect owner API with admin secret/token.

## Acceptance
- [ ] CI passes.
- [ ] Production deploy passes.
- [ ] Production smoke covers /admin and the test path in addition to existing customer dashboard/API/SDK checks.
- [ ] Provide production links for manual acceptance.

## Work log
### 2026-10-08
- Audited current main after Commercial MVP deployment.
- Confirmed /admin is only a placeholder redirect-style page; owner registration/project overview is not implemented yet.
- Confirmed customer dashboard already contains most of PATH-2.
- Confirmed one-shot test infrastructure exists and can be promoted into a clear PATH-1 UI.
