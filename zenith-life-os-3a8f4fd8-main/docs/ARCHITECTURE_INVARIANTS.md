# Architecture Invariants — Zenith Life OS

> These invariants MUST be true at ALL times. CI gates enforce them.
> Violating any invariant blocks the PR from merging.

## I-01: Monorepo Structure
- Root has `pnpm-workspace.yaml`
- Apps live under `apps/`
- Shared code lives under `packages/`
- No code at root `/src/` level

## I-02: Stack Purity
- TanStack Start only (no Next.js, no Remix, no SvelteKit)
- No `next/server`, `NextRequest`, `NextResponse` imports
- Cloudflare Workers deployment target

## I-03: ULID TEXT IDs
- All business tables use `id TEXT PRIMARY KEY CHECK (public.is_ulid(id))`
- No UUID PRIMARY KEY on business tables
- No SERIAL/BIGSERIAL
- Supabase auth.users UUID mapped via `users.auth_uid`

## I-04: RLS FORCE
- Every table with user data has `ENABLE ROW LEVEL SECURITY`
- Every table with user data has `FORCE ROW LEVEL SECURITY`
- No `USING (true)` without explicit `-- ALLOW:` comment
- Workspace isolation via `current_workspace_id()` function

## I-05: Result Pattern
- Business logic returns `Result<T, AppError>`
- `throw` only at boundaries (route handlers)
- Error codes from `@zenith/shared/errors/registry`
- API envelope: `{ ok, data }` or `{ ok, error }`

## I-06: Clock Abstraction
- No `new Date()` in business logic
- All time via `Clock` interface from `@zenith/shared/time`
- Tests use `fixedClock()`

## I-07: Server-Side Auth
- No auth tokens in localStorage/sessionStorage
- httpOnly + Secure + SameSite=Lax cookies
- CSRF token validated on mutations
- Session rotation on signin/refresh

## I-08: AI Gateway
- No direct `openai`/`anthropic` imports outside `packages/ai`
- CI script blocks violations
- Vault plaintext never reaches AI prompts

## I-09: Donations Only
- No subscriptions, no billing, no paywalls
- `donations` table exists
- No feature gating by payment tier

## I-10: Wave Freezing
- Each wave frozen with `git tag w0X-frozen`
- No `.md` files as freeze markers
- Tag must exist before next wave starts

## I-11: No eval/Function
- No `eval()`, `new Function()`, `import()` dynamic execution
- Formula engine uses recursive descent parsing
- CI script scans for violations

## I-12: Idempotency
- Every mutation endpoint requires `Idempotency-Key` header
- `api_idempotency` table stores processed keys (24h TTL)
- Duplicate requests return cached response
