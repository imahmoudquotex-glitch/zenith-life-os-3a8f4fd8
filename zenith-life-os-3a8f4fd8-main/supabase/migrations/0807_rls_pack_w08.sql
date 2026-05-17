-- Migration 0807: RLS Pack W08 (Formula Engine)
-- FIXED: workspace_members → users_workspaces, no USING(true)
BEGIN;

-- recalc_jobs
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recalc_jobs' AND policyname='recalc_jobs_workspace_read') THEN
    CREATE POLICY recalc_jobs_workspace_read ON recalc_jobs
      FOR SELECT
      USING (workspace_id = public.current_workspace_id());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='recalc_jobs' AND policyname='recalc_jobs_system_write') THEN
    CREATE POLICY recalc_jobs_system_write ON recalc_jobs
      FOR ALL
      -- ALLOW: system context needed for background recalc jobs
      USING (public.is_system_context())
      WITH CHECK (public.is_system_context());
  END IF;
END $$;

COMMIT;
