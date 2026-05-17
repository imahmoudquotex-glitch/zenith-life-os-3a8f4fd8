-- Migration 0804: formula_audit_trigger

CREATE OR REPLACE FUNCTION trigger_formula_definitions_audit()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- If expression or AST changed, invalidate cache
    IF TG_OP = 'UPDATE' AND (OLD.expression IS DISTINCT FROM NEW.expression OR OLD.ast IS DISTINCT FROM NEW.ast) THEN
        UPDATE formula_cache
        SET is_stale = TRUE
        WHERE formula_id = NEW.id;
        
        -- Insert a recalc job for all rows of this formula
        INSERT INTO recalc_jobs (workspace_id, formula_id, status)
        VALUES (NEW.workspace_id, NEW.id, 'pending');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER formula_definitions_audit_trigger
BEFORE UPDATE ON formula_definitions
FOR EACH ROW
EXECUTE FUNCTION trigger_formula_definitions_audit();
