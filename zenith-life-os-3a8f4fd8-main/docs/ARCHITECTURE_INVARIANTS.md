# Architecture Invariants — Zenith Life OS

> **These invariants are NON-NEGOTIABLE. Any violation blocks CI and deployment.**

## I-001: ULID-Only Business IDs

All tables with business data use `TEXT PRIMARY KEY CHECK (public.is_ulid(id))`.
No `UUID`, no `gen_random_uuid()`, no `serial`.

## I-002: Workspace-Scoped RLS

Every table with user data has:
```sql
ALTER TABLE t ENABLE ROW LEVEL SECURITY;
ALTER TABLE t FORCE ROW LEVEL SECURITY;
```
All policies use `workspace_id = public.current_workspace_id()`.
No `auth.uid()` in policies. No `USING (true)`.

## I-003: Zero-Knowledge Vault

Vault plaintext never appears in:
- AI prompts (guard: `assertNoVaultPlaintext()`)
- Server logs (guard: CI script `check-no-vault-leak`)
- Client-side code (guard: vault data never in API responses without decrypt)
- localStorage/sessionStorage (guard: CI script `check-no-localstorage-secrets`)

## I-004: No eval/Function/Dynamic Import

The formula engine and all server code must never use:
- `eval()`
- `new Function()`
- Dynamic `import()` with user-controlled strings
- `Date.now()` or `Math.random()` in business logic (use injected Clock/RNG)

## I-005: Server-Side Formula Evaluation

Client sends expression string → server parses to AST → evaluates with typed operations.
AST never leaves the server. Client never sends AST.

## I-006: No Direct AI Provider Imports

All AI access goes through `@zenith/ai` gateway. Direct imports of `openai`, `@anthropic-ai/sdk`, etc. are banned by ESLint rule and CI gate.

## I-007: Deterministic Business Logic

All business logic uses:
- `Result<T>` pattern (no thrown errors in core logic)
- Injected `Clock` (no `new Date()` or `Date.now()`)
- Injected `IdGenerator` (no `crypto.randomUUID()` in business layer)
- `FormulaValue` discriminated union (no `any`)

## I-008: Monorepo Structure

```
├── apps/web/         # TanStack Start application
├── packages/shared/  # Shared types, Result, ApiEnvelope, IDs
├── packages/db/      # Database client, queries
├── packages/ai/      # AI gateway (sole AI entry point)
├── packages/crypto/  # Vault, encryption
├── packages/audit/   # Security event logging
├── packages/idempotency/ # Mutation deduplication
```

Root `package.json` is monorepo-only (turbo, tsx, typescript). No app dependencies at root.

## I-009: Security Headers

Every response includes:
- `Content-Security-Policy` with nonce
- `Strict-Transport-Security` with preload
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Resource-Policy: same-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`

## I-010: Donations-Only Monetization

No `subscriptions`, `plans`, `invoices`, `pricing_tiers` tables. See ADR-0008.
The `donations` table is the sole financial table.
