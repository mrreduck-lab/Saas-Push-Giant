# Raschini Migration Plan

Goal: move Raschini from the prototype direct Next/Vercel push flow to Saas Push Giant without downtime.

## Phase 1: Inventory

- Record current VAPID public key fingerprint.
- Record current domain and service worker scope.
- Count active subscriptions in current Redis REST storage.
- Export current subscription set into a secure local file outside git.
- Confirm current push send works on iPhone and desktop.

## Phase 2: Tenant Setup

- Create `Raschini` organization.
- Create `raschini-site` project.
- Configure domains and PWA branding.
- Import or rotate VAPID credentials based on compatibility decision.
- Seed Raschini demo theme only as tenant data, not as product defaults.

## Phase 3: Dual Write

- Update Raschini site SDK/Prompt to upsert subscriptions into the new API.
- Keep old subscription save active temporarily.
- Heartbeat on each PWA/site open to refresh current endpoint.
- Compare old/new active subscription counts.

## Phase 4: Shadow Send

- Create campaigns in new backend in dry-run/test-provider mode.
- Verify batching, queue, retries, and invalid endpoint behavior without user-visible sends.
- Send internal test push to a controlled segment.

## Phase 5: Cutover

- Switch admin send path from old Next route to new campaign API.
- Keep old route disabled but deployable for rollback.
- Monitor accepted/failed/retried/clicked counts.

## Phase 6: Cleanup

- Stop dual write after the agreed observation period.
- Archive old Redis set securely.
- Remove direct Vercel/Upstash dependency from Raschini integration.

## Rollback

- Restore old env variables.
- Re-enable old `/api/push/send` path.
- Keep old Redis data untouched until the new backend is stable.

## Main Risk

If domain, service worker scope, or VAPID keys change incorrectly, existing browser subscriptions may not be reusable and users may need to re-open the PWA/site to refresh subscriptions.
