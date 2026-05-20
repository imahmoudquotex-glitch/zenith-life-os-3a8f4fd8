# ADR-0006 — Result<T> Pattern

**Date:** 2026-05-14
**Status:** Accepted
**Deciders:** Owner

## Context

Error handling in service and repository layers was inconsistent — some functions threw, some returned `null`, some returned `{ data, error }`. This made call-sites unpredictable and caused swallowed errors in routes.

## Decision

All service and repository functions **MUST** return `Result<T>` or throw a typed `AppError`.

```typescript
// packages/shared/src/result.ts
type Ok<T>  = { ok: true;  value: T }
type Err<E> = { ok: false; error: E }
type Result<T, E = AppError> = Ok<T> | Err<E>

function ok<T>(value: T): Ok<T>    { return { ok: true, value } }
function err<E>(error: E): Err<E>  { return { ok: false, error } }
```

## Rules

- No raw `try/catch` in route handlers — use `withApiErrorHandling` wrapper
- `AppError` has `.toEnvelope()` → `{ code, message, details }`
- HTTP status derived from `AppError.httpStatus` (never hardcoded `500`)
- Repository functions: return `Result<Row>` — never `Row | null`
- Service functions: return `Result<T>` — never throw directly to caller
- `check:routes-envelope` CI script enforces this on all 22+ API routes

## Response Shape (always)

```json
// Success
{ "ok": true,  "data": {...}, "meta": { "requestId": "...", "ts": "..." } }

// Error
{ "ok": false, "error": { "code": "...", "message": "..." }, "meta": { "requestId": "..." } }
```

## Rejected Alternatives

- **throw everywhere:** Uncaught errors silently return 500 with no context
- **null returns:** Ambiguous — null means "not found" or "error"?
- **fp-ts Either:** Too much ceremony for the team's current skillset
