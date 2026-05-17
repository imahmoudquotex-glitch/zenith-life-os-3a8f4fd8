-- Migration 0803: recalc_jobs (DB fallback)

CREATE TYPE formula_job_status AS ENUM ('pending', 'processing', 'completed', 'failed');

CREATE TABLE recalc_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_id UUID NOT NULL REFERENCES formula_definitions(id) ON DELETE CASCADE,
    row_id UUID REFERENCES db_rows(id) ON DELETE CASCADE, -- if null, recalc all rows for formula
    status formula_job_status NOT NULL DEFAULT 'pending',
    error TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

ALTER TABLE recalc_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recalc_jobs FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_recalc_jobs_status ON recalc_jobs(status) WHERE status = 'pending';
CREATE INDEX idx_recalc_jobs_workspace_id ON recalc_jobs(workspace_id);
