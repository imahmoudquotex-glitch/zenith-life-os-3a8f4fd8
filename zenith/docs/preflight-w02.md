# Pre-flight W02

## Required Inputs
- **Supabase Project URL**: `https://wuakmlzlbgaidirhohoa.supabase.co` (Retrieved automatically)
- **Supabase Keys**: Retrieved and saved to `.env.local`
- **DATABASE_URL**: Missing! (Needs DB password for migrations)
- **w01-frozen**: Verified and confirmed.

## Optional Inputs (STUB MODE)
- **Donations Provider**: Running without provider (STUB MODE)
- **Resend/Postmark**: Running without provider (STUB MODE)
- **Sentry DSN**: Running without provider (STUB MODE)
- **Axiom Token**: Running without provider (STUB MODE)
- **Upstash Redis**: Running without provider (STUB MODE - using DB fallback)
- **OpenAI/Anthropic**: Running without provider (STUB MODE - wrapper will return mock)
- **n8n / MERACL**: No external webhooks configured

## Status
All basic parameters collected.
**BLOCKED** on actual remote migrations because `DATABASE_URL` is missing. Will generate the schema and run tests against a local instance if provided, or await DB connection string.
