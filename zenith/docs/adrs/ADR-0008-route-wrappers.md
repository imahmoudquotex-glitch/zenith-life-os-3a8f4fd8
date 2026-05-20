# ADR-0008 — Route Wrappers Mandatory

**Date:** 2026-05-14
**Status:** Accepted
**Deciders:** Owner

## Context

API route handlers had inconsistent response shapes, missing idempotency keys, missing request IDs, and inconsistent error serialization. This made client-side error handling fragile.

## Decision

All API routes **MUST** use `withEnvelope` + `withIdempotency` wrappers from `@zenith/route`.

## Mandatory Response Envelope

```json
// Success
{
  "ok": true,
  "data": { ... },
  "meta": {
    "requestId": "01HWXYZ...",
    "ts": "2026-05-14T10:00:00.000Z"
  }
}

// Error
{
  "ok": false,
  "error": {
    "code": "WORKSPACE_NOT_FOUND",
    "message": "Workspace not found",
    "details": {}
  },
  "meta": {
    "requestId": "01HWXYZ...",
    "ts": "2026-05-14T10:00:00.000Z"
  }
}
```

## Usage Pattern

```typescript
// apps/web/src/app/api/tasks/route.ts
import { withEnvelope, withIdempotency } from '@zenith/route'

export const POST = withEnvelope(
  withIdempotency(async (req, ctx) => {
    // handler body — throw AppError on failure
    return { taskId: '...' }
  })
)
```

## Rules

- Every mutation route (POST/PUT/PATCH/DELETE) MUST have `withIdempotency`
- Every route (including GET) MUST have `withEnvelope`
- `requestId` = ULID generated per request
- `check:routes-envelope` CI enforces compliance on all 22+ route files
- `check:idempotency` CI enforces idempotency on all mutation routes

## Rejected Alternatives

- **Per-route try/catch:** Inconsistent error shapes, easy to miss
- **Global error middleware (Express style):** Not compatible with Next.js App Router
