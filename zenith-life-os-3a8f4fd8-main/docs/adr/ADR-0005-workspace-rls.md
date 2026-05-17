# ADR-0005: Workspace-Based RLS (not creator-based)

**Status:** Accepted
**Date:** 2026-05-17

## Context

Several early migrations used `auth.uid()::text` (creator-based) for RLS policies. This only allows the *creator* of a record to see it — breaking multi-member workspaces where teammates should see each other's data.

## Decision

All RLS policies MUST use `workspace_id = public.current_workspace_id()` (workspace-based isolation). The workspace_id is set via `SET LOCAL app.current_workspace_id = '...'` on each server request.

### Exceptions (documented with `-- ALLOW:` comment):
- `vault_items`: Uses `owner_user_id + workspace_id` (personal items within a workspace)
- System operations: Use `public.is_system_context()` for background jobs

## Consequences

- All team members in a workspace can view/edit shared data
- Vault items remain personal (owner-only)
- Creator-based policies are explicitly banned in CI
