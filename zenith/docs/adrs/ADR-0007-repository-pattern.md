# ADR-0007 — Repository Pattern

**Date:** 2026-05-14
**Status:** Accepted
**Deciders:** Owner

## Context

Raw SQL was scattered across route handlers and service files. This made queries untestable, created workspace isolation bugs, and prevented consistent audit logging.

## Decision

One repository file per domain table: `packages/repo/src/{table}.repo.ts`

## Rules

- **No `SELECT *`** — all columns must be explicit
- **No raw SQL in routes or services** — use repo functions only
- Repository receives `db: DrizzleClient` as first argument (injectable for tests)
- Repository returns typed rows — no `any`, no `unknown` without cast
- Service layer = repo calls + audit events + queue dispatch
- `check:no-sql-in-routes` CI enforces no SQL in `apps/web/src/app/api/**`

## File Structure

```
packages/repo/src/
├── workspaces.repo.ts    # workspace CRUD
├── users.repo.ts         # user profile ops
├── pages.repo.ts         # page tree ops
├── tasks.repo.ts         # task CRUD + filters
├── habits.repo.ts        # habit + streaks
├── expenses.repo.ts      # expenses + budgets
├── vault.repo.ts         # vault item metadata (NO plaintext)
├── ai-usage.repo.ts      # quota tracking
└── audit.repo.ts         # append-only audit events
```

## Example Pattern

```typescript
// tasks.repo.ts
export async function findTasksByWorkspace(
  db: DrizzleClient,
  workspaceId: string,
  filters: TaskFilters,
): Promise<Result<Task[]>> {
  // Drizzle query — explicit columns, workspace_id filter
}
```

## Rejected Alternatives

- **ActiveRecord pattern:** Tight coupling, hard to test without DB
- **Direct Supabase client in routes:** No testability, no injection
