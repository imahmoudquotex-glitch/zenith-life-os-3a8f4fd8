-- Migration 0803: recalc_jobs + RLS
-- FIXED: UUID → TEXT ULID
BEGIN;

CREATE TABLE IF NOT EXISTS recalc_jobs (
    id TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_id TEXT NOT NULL REFERENCES formula_definitions(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed')),
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE recalc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalc_jobs FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_recalc_jobs_workspace ON recalc_jobs(workspace_id);
CREATE INDEX idx_recalc_jobs_status ON recalc_jobs(status) WHERE status = 'pending';

COMMIT;
