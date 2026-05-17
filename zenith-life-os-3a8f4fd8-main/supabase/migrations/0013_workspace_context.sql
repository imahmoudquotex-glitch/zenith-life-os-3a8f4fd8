-- Migration 0013: Workspace context helpers (RLS)
-- These functions are used by ALL RLS policies for tenant isolation.
-- Reviewer issue #11, #19: workspace-based isolation, not creator-based.
BEGIN;

-- Returns the current workspace ID set on the PG connection
CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.current_workspace_id', true);
$$;

-- Returns the current user ID set on the PG connection
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.current_user_id', true);
$$;

-- Returns whether the current connection is a system/service role
CREATE OR REPLACE FUNCTION public.is_system_context()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.is_system', true) = 'true';
$$;

-- Checks if the current user is an active member of a workspace
CREATE OR REPLACE FUNCTION public.is_workspace_member(ws_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users_workspaces uw
    WHERE uw.workspace_id = ws_id
      AND uw.user_id = public.current_user_id()
      AND uw.status = 'active'
  );
$$;

COMMENT ON FUNCTION public.current_workspace_id IS 'Returns app.current_workspace_id from PG connection settings';
COMMENT ON FUNCTION public.current_user_id IS 'Returns app.current_user_id from PG connection settings';
COMMENT ON FUNCTION public.is_system_context IS 'Returns true if running under system/service role';
COMMENT ON FUNCTION public.is_workspace_member IS 'Checks active workspace membership for current user';

-- Now add proper RLS policies to users table
CREATE POLICY users_self_read ON public.users
  FOR SELECT
  USING (id = public.current_user_id());

CREATE POLICY users_self_update ON public.users
  FOR UPDATE
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- Workspace RLS: see your own memberships
CREATE POLICY uw_own_memberships ON public.users_workspaces
  FOR SELECT
  USING (
    user_id = public.current_user_id()
    OR workspace_id = public.current_workspace_id()
  );

-- Workspace RLS: only see workspaces you belong to
CREATE POLICY workspaces_member_read ON public.workspaces
  FOR SELECT
  USING (public.is_workspace_member(id));

COMMIT;
