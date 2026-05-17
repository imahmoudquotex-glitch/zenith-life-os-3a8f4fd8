BEGIN;

-- ============================================================
-- 0712: db_audit_trigger (property/row changes)
-- ============================================================
CREATE TABLE IF NOT EXISTS db_audit_log (
  id           TEXT PRIMARY KEY DEFAULT generate_ulid(),
  workspace_id TEXT NOT NULL,
  table_name   TEXT NOT NULL,
  row_id       TEXT NOT NULL,
  operation    TEXT NOT NULL CHECK (operation IN ('INSERT','UPDATE','DELETE')),
  old_data     JSONB,
  new_data     JSONB,
  changed_by   TEXT,
  changed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_db_audit_row ON db_audit_log(row_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_db_audit_workspace ON db_audit_log(workspace_id, changed_at DESC);

ALTER TABLE db_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_audit_log FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_audit_log' AND policyname='db_audit_isolation') THEN
    CREATE POLICY db_audit_isolation ON db_audit_log USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT ON db_audit_log TO app_user;

-- Audit function for db_rows
CREATE OR REPLACE FUNCTION db_rows_audit() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO db_audit_log (workspace_id, table_name, row_id, operation, new_data, changed_by)
    VALUES (NEW.workspace_id, TG_TABLE_NAME, NEW.id, 'INSERT', row_to_json(NEW)::jsonb, current_user_id());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO db_audit_log (workspace_id, table_name, row_id, operation, old_data, new_data, changed_by)
    VALUES (NEW.workspace_id, TG_TABLE_NAME, NEW.id, 'UPDATE', row_to_json(OLD)::jsonb, row_to_json(NEW)::jsonb, current_user_id());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO db_audit_log (workspace_id, table_name, row_id, operation, old_data, changed_by)
    VALUES (OLD.workspace_id, TG_TABLE_NAME, OLD.id, 'DELETE', row_to_json(OLD)::jsonb, current_user_id());
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_db_rows_audit
  AFTER INSERT OR UPDATE OR DELETE ON db_rows
  FOR EACH ROW EXECUTE FUNCTION db_rows_audit();

-- ============================================================
-- 0713: db_indexes_pack (GIN + partial + expression indexes)
-- ============================================================

-- GIN wildcard on properties
CREATE INDEX IF NOT EXISTS idx_db_rows_props_gin_ops
  ON db_rows USING GIN(properties jsonb_ops) WHERE NOT is_deleted;

-- Partial indexes for common property accesses
CREATE INDEX IF NOT EXISTS idx_db_rows_status
  ON db_rows((properties->>'status')) WHERE NOT is_deleted AND (properties->>'status') IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_db_rows_due_date
  ON db_rows(((properties->>'due_date')::DATE)) WHERE NOT is_deleted AND (properties->>'due_date') IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_db_rows_priority
  ON db_rows((properties->>'priority')) WHERE NOT is_deleted AND (properties->>'priority') IS NOT NULL;

-- ============================================================
-- 0714: db_constraints_pack
-- ============================================================

-- System DB deletion prevention
CREATE OR REPLACE FUNCTION prevent_system_db_delete() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.is_system AND NOT NEW.is_deleted = OLD.is_deleted THEN
    IF NEW.is_deleted THEN
      RAISE EXCEPTION 'system_database_cannot_be_deleted';
    END IF;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_prevent_system_db_delete
  BEFORE UPDATE ON databases
  FOR EACH ROW EXECUTE FUNCTION prevent_system_db_delete();

COMMIT;
