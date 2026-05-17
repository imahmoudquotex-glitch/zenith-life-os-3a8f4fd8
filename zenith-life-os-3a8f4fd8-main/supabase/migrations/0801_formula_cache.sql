-- Migration 0801: formula_cache + stale index
-- FIXED: UUID → TEXT ULID
BEGIN;

CREATE TABLE IF NOT EXISTS formula_cache (
    id TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    formula_id TEXT NOT NULL REFERENCES formula_definitions(id) ON DELETE CASCADE,
    row_id TEXT NOT NULL,
    value JSONB,
    is_stale BOOLEAN NOT NULL DEFAULT TRUE,
    computed_at TIMESTAMPTZ,
    UNIQUE(formula_id, row_id)
);

ALTER TABLE formula_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_cache FORCE ROW LEVEL SECURITY;

-- System manages cache, users can read their workspace's cache
CREATE POLICY formula_cache_workspace_read ON formula_cache
  FOR SELECT
  USING (workspace_id = public.current_workspace_id());

-- ALLOW: System context manages cache entries
CREATE POLICY formula_cache_system_write ON formula_cache
  FOR ALL
  -- ALLOW: system context needed for background recalc
  USING (public.is_system_context())
  WITH CHECK (public.is_system_context());

CREATE INDEX idx_formula_cache_workspace_id ON formula_cache(workspace_id);
CREATE INDEX idx_formula_cache_is_stale ON formula_cache(is_stale) WHERE is_stale = TRUE;

COMMIT;
