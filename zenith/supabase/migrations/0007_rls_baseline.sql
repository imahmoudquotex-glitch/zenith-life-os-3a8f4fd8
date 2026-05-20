-- File: 0007__rls_baseline.sql
-- Wave: 01
-- Description: RLS baseline — role, helper functions, policies for core tables
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

-- ─── App Role ──────────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user NOLOGIN;
  END IF;
END $$;

-- ─── Helper Functions ──────────────────────────────────
CREATE OR REPLACE FUNCTION public.current_workspace_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.workspace_id', TRUE);
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT
LANGUAGE sql
STABLE
AS $$
  SELECT current_setting('app.user_id', TRUE);
$$;

-- ─── Workspaces RLS ────────────────────────────────────
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspaces_isolation ON public.workspaces;
CREATE POLICY workspaces_isolation ON public.workspaces
  FOR ALL
  USING (
    id IN (
      SELECT workspace_id FROM public.users_workspaces
      WHERE user_id = public.current_user_id()
        AND NOT is_deleted
    )
  )
  WITH CHECK (
    id IN (
      SELECT workspace_id FROM public.users_workspaces
      WHERE user_id = public.current_user_id()
        AND NOT is_deleted
    )
  );

-- ─── Users RLS ─────────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_self_access ON public.users;
CREATE POLICY users_self_access ON public.users
  FOR ALL
  USING (id = public.current_user_id())
  WITH CHECK (id = public.current_user_id());

-- ─── Users_Workspaces RLS ──────────────────────────────
ALTER TABLE public.users_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_workspaces FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_workspaces_isolation ON public.users_workspaces;
CREATE POLICY users_workspaces_isolation ON public.users_workspaces
  FOR ALL
  USING (
    workspace_id = public.current_workspace_id()
    OR user_id = public.current_user_id()
  )
  WITH CHECK (
    workspace_id = public.current_workspace_id()
  );

-- ─── GRANTs ────────────────────────────────────────────
GRANT SELECT, INSERT, UPDATE ON public.workspaces TO app_user;
GRANT SELECT, INSERT, UPDATE ON public.users TO app_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users_workspaces TO app_user;

COMMIT;
