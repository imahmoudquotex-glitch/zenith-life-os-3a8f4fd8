-- Migration 0801: formula_cache + stale index

CREATE TABLE formula_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_id UUID NOT NULL REFERENCES formula_definitions(id) ON DELETE CASCADE,
    row_id UUID NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
    value JSONB,
    is_stale BOOLEAN NOT NULL DEFAULT TRUE,
    computed_at TIMESTAMPTZ,
    UNIQUE(formula_id, row_id)
);

ALTER TABLE formula_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_cache FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_formula_cache_workspace_id ON formula_cache(workspace_id);
CREATE INDEX idx_formula_cache_is_stale ON formula_cache(is_stale) WHERE is_stale = TRUE;
