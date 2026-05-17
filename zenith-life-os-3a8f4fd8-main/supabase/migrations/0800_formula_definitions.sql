-- Migration 0800: formula_definitions + RLS + FORCE + GIN

CREATE TABLE formula_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    expression TEXT NOT NULL,
    ast JSONB NOT NULL,
    return_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    idempotency_key TEXT UNIQUE
);

ALTER TABLE formula_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE formula_definitions FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_formula_definitions_workspace_id ON formula_definitions(workspace_id);
CREATE INDEX idx_formula_definitions_ast_gin ON formula_definitions USING GIN (ast);
