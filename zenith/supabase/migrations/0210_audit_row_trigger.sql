-- File: 0210__audit_row_trigger.sql
-- Wave: 03
-- Description: Generic delta-only audit trigger for tenant tables
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

-- Generic row-level audit trigger (delta-only for UPDATE, full for INSERT/DELETE)
CREATE OR REPLACE FUNCTION public.audit_row_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_diff JSONB;
  v_workspace_id TEXT;
BEGIN
  -- Extract workspace_id from the row
  v_workspace_id := CASE TG_OP
    WHEN 'DELETE' THEN OLD.workspace_id::TEXT
    ELSE NEW.workspace_id::TEXT
  END;

  -- For UPDATE: compute delta (only changed fields)
  IF TG_OP = 'UPDATE' THEN
    SELECT jsonb_object_agg(key, value) INTO v_diff
    FROM jsonb_each(to_jsonb(NEW))
    WHERE to_jsonb(OLD)->key IS DISTINCT FROM value
      AND key NOT IN ('updated_at', 'version'); -- exclude noise fields
  END IF;

  INSERT INTO public.audit_events(
    id, workspace_id, actor_type, actor_id,
    action, resource_type, resource_id,
    diff_json, created_at
  ) VALUES (
    public.generate_ulid(),
    v_workspace_id,
    'system',
    COALESCE(current_setting('app.current_user_id', true), 'system'),
    TG_TABLE_NAME || '.' || lower(TG_OP),
    TG_TABLE_NAME,
    CASE TG_OP WHEN 'DELETE' THEN OLD.id ELSE NEW.id END,
    v_diff,
    now()
  );

  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
EXCEPTION WHEN OTHERS THEN
  -- Audit failure must NOT block the operation
  RETURN CASE TG_OP WHEN 'DELETE' THEN OLD ELSE NEW END;
END $$;

-- Apply audit trigger to high-sensitivity tables
CREATE OR REPLACE TRIGGER trg_audit_tasks
  AFTER INSERT OR UPDATE OR DELETE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

CREATE OR REPLACE TRIGGER trg_audit_vault_items
  AFTER INSERT OR UPDATE OR DELETE ON public.vault_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

CREATE OR REPLACE TRIGGER trg_audit_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_row_change();

COMMIT;
