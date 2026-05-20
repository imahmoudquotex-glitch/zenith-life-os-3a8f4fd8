-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0130_jobs.sql
-- Wave:        W01 (0130–0229)
-- Description: Jobs
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W01: 0130_jobs.sql
-- Background jobs table for worker lease coordination
-- Wave: W01 (0100-0199)

CREATE TABLE IF NOT EXISTS jobs (
  id            TEXT        NOT NULL DEFAULT gen_ulid(),
  job_type      TEXT        NOT NULL,
  payload       JSONB       NOT NULL DEFAULT '{}',
  status        TEXT        NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending','running','completed','failed','dead')),
  priority      INTEGER     NOT NULL DEFAULT 0,
  attempts      INTEGER     NOT NULL DEFAULT 0,
  max_attempts  INTEGER     NOT NULL DEFAULT 3,
  worker_id     TEXT,
  lease_expires_at TIMESTAMPTZ,
  next_run_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,
  last_error    TEXT,
  workspace_id  TEXT        REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS jobs_pending_idx
  ON jobs (status, priority DESC, next_run_at ASC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS jobs_workspace_idx ON jobs (workspace_id);
CREATE INDEX IF NOT EXISTS jobs_lease_expiry_idx ON jobs (lease_expires_at) WHERE status = 'running';

SELECT create_updated_at_trigger('jobs');

-- RLS
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs FORCE ROW LEVEL SECURITY;
CREATE POLICY "jobs_workspace_isolation"
  ON jobs FOR ALL
  USING (workspace_id = current_workspace_id() OR workspace_id IS NULL);


COMMIT;
