-- Migration 0805: db_properties_formula_link
-- FIXED: UUID → TEXT (formula_definitions.id is TEXT ULID)

ALTER TABLE db_properties
ADD COLUMN formula_id TEXT REFERENCES formula_definitions(id) ON DELETE SET NULL;

CREATE INDEX idx_db_properties_formula_id ON db_properties(formula_id) WHERE formula_id IS NOT NULL;
