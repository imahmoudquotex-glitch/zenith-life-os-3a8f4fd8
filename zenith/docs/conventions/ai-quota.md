# AI Quota Conventions

- AI quota reservations are strictly executed via PL/pgSQL atomic RPCs (`reserve_ai_usage`, `complete_ai_usage`, `refund_ai_usage`).
- AI quotas are tied to the user's plan.
- Use `Idempotency-Key` for all reservation requests to prevent double spending.
