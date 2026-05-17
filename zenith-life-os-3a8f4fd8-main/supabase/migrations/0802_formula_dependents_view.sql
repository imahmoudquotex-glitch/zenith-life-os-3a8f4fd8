-- Migration 0802: formula_dependents tracking
-- FIXED: Replaced AST-based materialized view with proper dependency table
-- The old version relied on f.ast->'dependencies' which is no longer stored
BEGIN;

-- Drop old materialized view if exists
DROP MATERIALIZED VIEW IF EXISTS formula_dependents_view;

-- Proper dependency tracking table
CREATE TABLE IF NOT EXISTS formula_dependencies (
    id TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
    formula_id TEXT NOT NULL REFERENCES formula_definitions(id) ON DELETE CASCADE,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    dependent_property_id TEXT NOT NULL,
    UNIQUE (formula_id, dependent_property_id)
);

ALTER TABLE formula_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_dependencies FORCE ROW LEVEL SECURITY;

CREATE POLICY formula_deps_workspace_read ON formula_dependencies
  FOR SELECT
  USING (workspace_id = public.current_workspace_id());

-- ALLOW: system context manages dependency graph
CREATE POLICY formula_deps_system_write ON formula_dependencies
  FOR ALL
  -- ALLOW: system context for dependency tracking
  USING (public.is_system_context())
  WITH CHECK (public.is_system_context());

CREATE INDEX idx_formula_deps_formula ON formula_dependencies(formula_id);
CREATE INDEX idx_formula_deps_property ON formula_dependencies(dependent_property_id);
CREATE INDEX idx_formula_deps_workspace ON formula_dependencies(workspace_id);

COMMIT;
