# Proposed Product Additions

## Packaging

Add an onboarding checklist per client:

- domain verified;
- manifest reachable;
- service worker scope valid;
- iOS install instruction checked;
- Android install prompt checked;
- test subscription created;
- test campaign accepted;
- rollback path documented.

## Commercial Positioning

Sell the first version as "branded PWA + push channel in 1 day", not as a full native-app replacement. This keeps promises crisp and avoids overclaiming background geofence behavior on iOS.

## Admin UX

Add a campaign safety preview before sending:

- target segment;
- estimated subscriber count;
- platform limitations;
- image fallback;
- final URL;
- scheduled time and timezone.

## Compliance

Add per-project consent text versioning. Subscription, geo, and CRM identifier sync should store which consent version was accepted.

## Integrations

Mindbox should be designed as two adapters:

- inbound custom action: Mindbox starts a push campaign;
- outbound events: Push Giant sends subscription/click/install events back.

This keeps the core valuable even without Mindbox.
