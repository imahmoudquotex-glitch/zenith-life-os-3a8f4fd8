# ADR-0005: Workspace-Scoped RLS

**Status:** Accepted  
**Date:** 2026-05-17  
**Decision-Makers:** Architecture Team

## Context

Multi-tenant data isolation requires that every database query is scoped to the user's active workspace. Traditional `auth.uid()` based RLS is insufficient because a user may belong to multiple workspaces.

## Decision

1. **RLS predicates use `current_workspace_id()`** not `auth.uid()`.
2. **Session variable**: `app.current_workspace_id` is set via `SET LOCAL` at the start of each request.
3. **Function**: `current_workspace_id()` reads from `current_setting('app.current_workspace_id', true)`.
4. **Membership check**: All RLS policies verify workspace membership via `users_workspaces` junction table.
5. **SECURITY DEFINER**: Critical functions (audit, idempotency) use `SECURITY DEFINER` with explicit workspace context.

## Invariants

- `I-002`: All RLS policies must reference `current_workspace_id()`, never `auth.uid()` directly.
- `I-009`: All tables with user data must have a `workspace_id` column.

## Consequences

- Every API request must set the workspace context before any queries
- Cross-workspace queries are impossible by design
- Workspace admin operations require elevated context
