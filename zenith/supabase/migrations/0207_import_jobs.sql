-- File: 0207__import_jobs.sql
-- Wave: 03
-- Description: Import jobs queue for CSV/data import tracking
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.import_jobs (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id           TEXT NOT NULL REFERENCES public.users(id),
  import_type       TEXT NOT NULL CHECK (import_type IN ('csv_tasks','csv_notes','csv_expenses','csv_habits','csv_generic')),
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending','processing','completed','failed','cancelled')),
  file_name         TEXT NOT NULL,
  file_size_bytes   INT,
  total_rows        INT,
  processed_rows    INT NOT NULL DEFAULT 0,
  failed_rows       INT NOT NULL DEFAULT 0,
  error_log         JSONB NOT NULL DEFAULT '[]'::jsonb,
  result_summary    JSONB,
  idempotency_key   TEXT NOT NULL,
  started_at        TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, idempotency_key)
);

CREATE INDEX idx_import_jobs_workspace ON public.import_jobs(workspace_id, created_at DESC);
CREATE INDEX idx_import_jobs_status ON public.import_jobs(status, created_at) WHERE status IN ('pending','processing');

ALTER TABLE public.import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_jobs FORCE ROW LEVEL SECURITY;
CREATE POLICY import_jobs_workspace_isolation ON public.import_jobs
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE ON public.import_jobs TO app_user;
CREATE TRIGGER trg_import_jobs_updated_at BEFORE UPDATE ON public.import_jobs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
