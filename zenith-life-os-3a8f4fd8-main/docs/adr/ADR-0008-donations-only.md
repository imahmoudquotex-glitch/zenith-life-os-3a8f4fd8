# ADR-0008: Donations-Only Monetization Model

## Status

Accepted

## Context

Zenith Life OS is an open-source personal productivity system. The project must define a clear, immutable monetization policy to prevent scope creep toward SaaS billing, subscriptions, or feature gating.

## Decision

Zenith Life OS uses a **100% donations-only** monetization model:

- **Supported providers**: Stripe, LemonSqueezy, PayPal.
- **Supporter badge**: Cosmetic only — no feature unlocks, no data advantages.
- **No premium features**: Every feature is available to every user, forever.
- **No data monetization**: User data is never sold, shared, or used for advertising.
- **No billing tables**: No `subscriptions`, `plans`, `invoices`, or `pricing_tiers` tables.
- **Infrastructure**: `donations` table tracks all contributions with provider reference and status.

## Consequences

- The database schema includes `public.donations` but never `subscriptions` or `billing`.
- Webhook handlers validate provider signatures (Stripe signature, LemonSqueezy HMAC).
- The `/donate` page is the only payment-related UI surface.
- CI gate `check-no-billing-tables.ts` fails if any migration creates `subscriptions`, `plans`, or `invoices`.

## Security Impact

- Webhook endpoints must verify provider signatures.
- Donation amounts are stored as `NUMERIC(20,4)` to prevent floating-point drift.
- Currency codes are validated against ISO 4217 (`^[A-Z]{3}$`).
