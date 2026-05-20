# Architecture Decision Records (Wave 02)

## ADR-0030: AI Quota Atomic RPCs
**Decision:** All AI token reservations, completions, and refunds must occur via atomic PL/pgSQL RPCs.
**Rationale:** Prevents double-spend and race conditions in concurrent requests.

## ADR-0031: Money Columns BIGINT Cents Only
**Decision:** All financial amounts must be stored as BIGINT in cents.
**Rationale:** Prevents floating point precision errors.

## ADR-0032: Webhook Nonces Table for Anti-Replay
**Decision:** Webhooks must store a unique nonce in a database table.
**Rationale:** Protects against replay attacks.

## ADR-0033: Server/Client Boundary Enforcement
**Decision:** Strict separation of server (`packages/server-env`) and client (`packages/client-env`) variables using Zod validation.
**Rationale:** Prevents leaking sensitive secrets to the client.

## ADR-0034: Repository Pattern Single SQL Ownership
**Decision:** SQL execution is strictly limited to `packages/repo`.
**Rationale:** Isolates DB logic, makes it easier to mock/test, and centralizes RLS context.

## ADR-0035: Result<T> Pattern
**Decision:** Use `Result<T, AppError>` instead of throwing errors for expected logic flows.
**Rationale:** Explicit error handling over implicit try-catch blocks.

## ADR-0036: Route Wrappers Mandatory
**Decision:** All route handlers must be wrapped with standard route wrappers (`withApiErrorHandling`, `withUserRoute`, `withWorkspaceRoute`).
**Rationale:** Ensures consistent error formatting and authorization checks.

## ADR-0037: Optimistic Concurrency via Version
**Decision:** Entities that may have concurrent updates will use a `version` integer field.
**Rationale:** Prevents lost updates without requiring long-held DB locks.

## ADR-0038: Required CI Checks + Release Freeze Rules
**Decision:** Code cannot be merged until CI passes typecheck, lint, unit tests, DB tests, and preflight security checks.
**Rationale:** Enforces code quality and security standards.

## ADR-0039: Audit Events Extended Fields
**Decision:** Extends `audit_events` to include structured IP, user agent, and request ID.
**Rationale:** Provides robust traceability for compliance and debugging.

## ADR-0040: AI Plan-Based Quota Limits
**Decision:** AI quota is based on a fixed token limit defined by the user's plan.
**Rationale:** Prevents abuse and simplifies cost modeling.
