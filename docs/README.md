# Push Giant Documentation Index

This directory contains the operational and delivery documentation for Push Giant.

## Current production source of truth

- [Production infrastructure](production-infrastructure.md) — live VPS, Docker Compose services, domains, DNS, Nginx, TLS, environment placement, verification commands, deployment prerequisites, and open operational risks. Last verified after the successful public HTTPS launch on 2026-07-31.

## Server history and placement policy

- [Beget server inventory](server-inventory.md) — initial shared-server inventory, existing applications, product-isolation policy, and original Push Giant placement plan. This file is historical where it conflicts with the production infrastructure document.

## Delivery status

- [Stage 1 status](stage-1-status.md) — product foundation.
- [Stage 2 status](stage-2-status.md) — delivery core.

## Documentation precedence

For the currently deployed production environment, use this order:

1. `docs/production-infrastructure.md`;
2. current deployment configuration under `deploy/`;
3. root `RUNBOOK.md` and `ARCHITECTURE.md`;
4. historical planning and stage documents.

No production secrets, private keys, customer data, or database dumps may be committed to this repository.
