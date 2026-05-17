-- Migration 0802: formula_dependents_view (matview)

CREATE MATERIALIZED VIEW formula_dependents_view AS
SELECT 
    f.id AS formula_id,
    f.workspace_id,
    dep.value->>'property_id' AS dependent_property_id
FROM formula_definitions f,
jsonb_array_elements(f.ast->'dependencies') AS dep;

CREATE UNIQUE INDEX idx_formula_dependents_view_unique ON formula_dependents_view(formula_id, dependent_property_id);
CREATE INDEX idx_formula_dependents_view_property ON formula_dependents_view(dependent_property_id);
