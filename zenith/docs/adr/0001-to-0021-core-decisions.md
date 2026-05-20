# ADR-0001: Record Architecture Decisions
## Status: Accepted
## Context: We need a lightweight way to document architectural decisions.
## Decision: Use MADR format in `docs/adr/`. Numbered sequentially.
## Consequences: All significant decisions are traceable and reviewable.

---
# ADR-0002: ULID TEXT App-Generated IDs
## Status: Accepted
## Context: Need sortable, unique, collision-resistant IDs without DB dependency.
## Decision: All PKs are `TEXT` containing ULIDs generated in the application layer. UUID/SERIAL/BIGSERIAL banned for business tables.
## Consequences: IDs are sortable by time, globally unique, and don't require DB roundtrip.

---
# ADR-0003: Migration Naming `NNNN__slug.sql`
## Status: Accepted
## Context: Need deterministic ordering and clear identification of migrations.
## Decision: `NNNN__<slug>.sql` format. Header with metadata. `IF NOT EXISTS` + `BEGIN/COMMIT`.
## Consequences: Migrations are idempotent and self-documenting.

---
# ADR-0004: Single Postgres + workspace_id + RLS
## Status: Accepted
## Context: Multi-tenant isolation without per-tenant databases.
## Decision: Single Postgres with `workspace_id TEXT NOT NULL` on every tenant table. RLS + FORCE RLS enforced. `current_workspace_id()` set per request.
## Consequences: Strong isolation at DB level. Cross-workspace JOINs impossible without explicit bypass.

---
# ADR-0005: Soft Delete with `is_deleted` + `deleted_at`
## Status: Accepted
## Context: Data recovery and audit trail requirements.
## Decision: Soft delete via `is_deleted BOOLEAN DEFAULT false` + `deleted_at TIMESTAMPTZ`. Partial index on `is_deleted = false`.
## Consequences: Data is recoverable. Queries must filter by `is_deleted`.

---
# ADR-0006: Money as `*_cents BIGINT`
## Status: Accepted
## Context: Floating-point arithmetic causes rounding errors in financial calculations.
## Decision: All monetary values stored as `*_cents BIGINT`. Display via `Intl.NumberFormat`. `parseFloat` banned for money.
## Consequences: Exact arithmetic. No rounding surprises.

---
# ADR-0007: Idempotency-Key Required on Mutations
## Status: Accepted
## Context: Network retries can cause duplicate operations.
## Decision: POST/PATCH/PUT/DELETE require `Idempotency-Key` header. Hash = `sha256(method+path+sortedBody)`. Replay returns cached response.
## Consequences: Safe retries. Dedup at API layer.

---
# ADR-0008: API Envelope `{ok, data, error, meta}`
## Status: Accepted
## Context: Need consistent API response format.
## Decision: All responses wrapped in `{ok: boolean, data?, error?, meta: {requestId, timestamp}}`.
## Consequences: Clients always know the shape. Errors are structured.

---
# ADR-0009: Cursor Pagination Only
## Status: Accepted
## Context: Offset pagination is O(n) and breaks with concurrent writes.
## Decision: Only cursor-based pagination. Opaque base64url cursors with version.
## Consequences: Consistent performance regardless of page depth.

---
# ADR-0010: TypeScript Strict + No `any`
## Status: Accepted
## Context: Type safety prevents entire categories of bugs.
## Decision: `strict: true` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + ESLint `no-explicit-any`.
## Consequences: More verbose code but fewer runtime errors.

---
# ADR-0011: Vault Forbidden in AI
## Status: Accepted
## Context: Zero-knowledge vault means server/AI never sees plaintext.
## Decision: Vault content banned in AI prompts, analytics, audit logs, server logs, SSR, Sentry, IndexedDB, localStorage.
## Consequences: AI cannot help with vault content. Users must explicitly decrypt client-side.

---
# ADR-0012: `runAIWithQuota` Only Entrypoint
## Status: Accepted
## Context: AI usage must be tracked, rate-limited, and safety-checked.
## Decision: Single function `runAIWithQuota` in `packages/ai`. ESLint blocks direct provider imports elsewhere.
## Consequences: All AI usage goes through one gateway with quota, audit, and safety checks.

---
# ADR-0013: Audit Append-Only
## Status: Accepted
## Context: Audit trail integrity requires immutability.
## Decision: `audit_events` table has no UPDATE/DELETE grants. Append-only. Sensitive fields are sanitized before writing.
## Consequences: Trustworthy audit trail.

---
# ADR-0014: Feature Flags DB + Edge Config
## Status: Accepted
## Context: Need runtime feature toggling without deploys.
## Decision: Flags in DB with TTL 30s cache. Edge Config for critical path. NOTIFY/LISTEN for real-time.
## Consequences: Feature rollouts without deploys.

---
# ADR-0015: UTC TIMESTAMPTZ
## Status: Accepted
## Context: Time zone bugs are a top-5 production issue.
## Decision: All timestamps as `TIMESTAMPTZ` stored in UTC. Clock abstraction in app layer. `new Date()` banned in business logic.
## Consequences: No timezone bugs. Testable time logic.

---
# ADR-0016: Result Pattern
## Status: Accepted
## Context: Throw/catch is invisible in type signatures and hard to compose.
## Decision: `Result<T, E> = Ok<T> | Err<E>` for business logic. Exceptions only for truly exceptional cases.
## Consequences: Errors are visible in types. Composition via map/flatMap.

---
# ADR-0017: ESM Only
## Status: Accepted
## Context: CJS/ESM interop causes subtle bugs.
## Decision: `"type": "module"` everywhere. `verbatimModuleSyntax` enabled.
## Consequences: Clean module system. No dual-package hazard.

---
# ADR-0018: pnpm Workspaces + Optional Turborepo
## Status: Accepted
## Context: Monorepo needs package management and task orchestration.
## Decision: pnpm workspaces as foundation. Turborepo optional for caching.
## Consequences: Fast installs, strict dependency isolation.

---
# ADR-0019: Conventional Commits
## Status: Accepted
## Context: Need structured commit history for changelogs and automation.
## Decision: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`, `test:`, `ci:` prefixes required.
## Consequences: Automated changelog. Clear commit intent.

---
# ADR-0020: Squash-Merge Only
## Status: Accepted
## Context: Linear history is easier to bisect and understand.
## Decision: All PRs squash-merged to main. Linear history enforced.
## Consequences: Clean git log. Each commit = one logical change.

---
# ADR-0021: Tech Stack Baseline
## Status: Accepted
## Context: Need to freeze tech choices to prevent analysis paralysis.
## Decision: Next.js App Router + Postgres/Supabase + Supabase Auth + BullMQ/Redis + Upstash + Resend + Sentry/Axiom + Vercel + next-intl + Vitest/Playwright/pgTAP + pnpm.
## Consequences: No framework shopping. Focus on building.
