-- Migration 0800: formula_definitions + RLS + FORCE + GIN
-- FIXED: UUID → TEXT ULID, removed stored AST (reviewer issue #36)
BEGIN;

CREATE TABLE IF NOT EXISTS formula_definitions (
    id TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    property_id TEXT NOT NULL,
    expression TEXT NOT NULL CHECK (length(expression) BETWEEN 1 AND 2000),
    return_type TEXT NOT NULL CHECK (return_type IN ('number','text','boolean','date','array')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key TEXT UNIQUE
);

ALTER TABLE formula_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_definitions FORCE ROW LEVEL SECURITY;

CREATE POLICY formula_defs_workspace_read ON formula_definitions
  FOR SELECT
  USING (workspace_id = public.current_workspace_id());

CREATE POLICY formula_defs_workspace_write ON formula_definitions
  FOR INSERT
  WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY formula_defs_workspace_update ON formula_definitions
  FOR UPDATE
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

CREATE POLICY formula_defs_workspace_delete ON formula_definitions
  FOR DELETE
  USING (workspace_id = public.current_workspace_id());

CREATE INDEX idx_formula_definitions_workspace_id ON formula_definitions(workspace_id);
CREATE INDEX idx_formula_definitions_property ON formula_definitions(property_id);

CREATE TRIGGER trg_formula_defs_updated_at
  BEFORE UPDATE ON formula_definitions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
