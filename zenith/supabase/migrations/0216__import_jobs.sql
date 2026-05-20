-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0216__import_jobs.sql
-- Wave:        W02 (0216–0315)
-- Description:  Import Jobs
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0216__import_jobs.sql
-- Wave: W02
-- Purpose: Data import jobs queue with status tracking and workspace isolation

BEGIN;
CREATE TABLE IF NOT EXISTS import_jobs (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id      TEXT NOT NULL REFERENCES users(id),
  source       TEXT NOT NULL DEFAULT 'unknown',
  status       TEXT NOT NULL DEFAULT 'pending',
  payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  result_json  JSONB,
  error_message TEXT,
  total_rows   INT,
  processed_rows INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  CONSTRAINT chk_import_jobs_status CHECK (status IN ('pending','running','done','failed'))
);

CREATE INDEX idx_import_jobs_workspace_status ON import_jobs(workspace_id, status, created_at DESC);
CREATE INDEX idx_import_jobs_user ON import_jobs(user_id, created_at DESC);

CREATE TRIGGER trg_import_jobs_before_update_set_updated_at
  BEFORE UPDATE ON import_jobs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_jobs FORCE ROW LEVEL SECURITY;
CREATE POLICY import_jobs_isolation ON import_jobs
  USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE ON import_jobs TO app_user;
COMMIT;
