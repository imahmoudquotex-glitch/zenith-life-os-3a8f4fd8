# ADR-0003: Error Handling — Result Pattern

## Status

Accepted

## Context

Business logic used `throw new Error(...)` throughout. This makes error handling
unpredictable, hard to test, and loses type information about what went wrong.

## Decision

All business logic returns `Result<T, AppError>` instead of throwing.

```typescript
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```

- `throw` is only allowed at **boundaries** (route handlers, middleware)
- All repos, services, and domain logic return `Result`
- Error codes come from `@zenith/shared/errors/registry`
- API envelope converts `Result` to `{ ok, data/error }` responses

## Consequences

- Every function signature is explicit about failure modes
- Type checker enforces error handling at call sites
- Testing is cleaner — no try/catch needed
- Slight verbosity increase (acceptable tradeoff)

## Security Impact

- No uncaught exceptions leaking internal details to clients
- All errors have structured codes — no raw strings
