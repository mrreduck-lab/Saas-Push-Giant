# Security

## Non-Negotiables

- Never commit VAPID private keys, admin tokens, Redis credentials, webhook secrets, database dumps, or production customer data.
- Store secrets only in environment variables or deployment secret storage.
- Do not expose raw push endpoints, `p256dh`, or `auth` keys in logs.
- Do not print private VAPID keys in admin UI, diagnostics, or API responses.

## Required Controls

- Hash API keys at rest.
- Support project-scoped API keys and rotation.
- Enforce RBAC: `owner`, `admin`, `marketer`, `viewer`, `technical`.
- Apply CORS and Origin checks per project/domain.
- Use CSRF protection and secure cookies for the admin UI.
- Add request ID, audit log, and structured JSON logs.
- Rate-limit public SDK endpoints and admin/API endpoints separately.
- Sign webhooks with timestamped HMAC signatures.
- Validate uploaded images by MIME, size, dimensions, and safe fetch rules.
- Protect against SSRF when importing remote images.
- Keep payload size limits for campaigns and SDK events.
- Provide tenant data export and deletion workflows.

## Personal Data

For Russian clients, production personal data should be hosted on Russian infrastructure unless a specific legal setup says otherwise. The system must support on-premise deployment for clients with stricter requirements.

## Current Prototype Security Debt

- Single shared admin token.
- Single Redis set for all subscriptions.
- No tenant isolation.
- No queue, audit log, or campaign-level permission model.
- Next.js version needs security upgrade.

## Stage 2 Controls Implemented

- API keys are hashed at rest with a prefix lookup.
- Campaign creation and send-now enforce scoped API keys.
- Campaign API keys are organization/project scoped.
- Subscription endpoint, `p256dh`, `auth`, and VAPID private key values use AES-256-GCM envelopes.
- Delivery worker records attempts and disables dead subscriptions on provider `404`/`410`.

## Remaining Security Work

- Add key creation, rotation, and revocation endpoints/UI.
- Add project public token or domain/origin verification for SDK subscription upsert.
- Add rate limits to SDK and admin/API endpoints.
- Add admin sessions, CSRF protection, and RBAC enforcement.
- Add audit log writes for campaign and key operations.
- Replace or isolate the imported Next demo/admin shell to close residual Next/PostCSS audit findings.
