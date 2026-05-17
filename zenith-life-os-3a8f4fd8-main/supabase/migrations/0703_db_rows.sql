BEGIN;

-- ============================================================
-- 0703: db_rows table + GIN index + RLS + FORCE
-- ============================================================
CREATE TABLE IF NOT EXISTS db_rows (
  id                      TEXT PRIMARY KEY,
  database_id             TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
  workspace_id            TEXT NOT NULL REFERENCES workspaces(id),
  page_id                 TEXT REFERENCES pages(id),
  properties              JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(properties) = 'object'),
  position                DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_deleted              BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at              TIMESTAMPTZ,
  created_by_user_id      TEXT NOT NULL REFERENCES users(id),
  last_edited_by_user_id  TEXT NOT NULL REFERENCES users(id),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  version                 INT NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_db_rows_database_position ON db_rows(database_id, position) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_db_rows_props_gin ON db_rows USING GIN(properties);
CREATE INDEX IF NOT EXISTS idx_db_rows_workspace ON db_rows(workspace_id) WHERE NOT is_deleted;

ALTER TABLE db_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_rows FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_rows' AND policyname='db_rows_isolation') THEN
    CREATE POLICY db_rows_isolation ON db_rows USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_rows TO app_user;

CREATE OR REPLACE TRIGGER trg_db_rows_updated_at
  BEFORE UPDATE ON db_rows
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Soft delete cascade from database
CREATE OR REPLACE FUNCTION soft_delete_database_rows() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_deleted AND NOT OLD.is_deleted THEN
    UPDATE db_rows SET is_deleted = TRUE, deleted_at = now()
    WHERE database_id = NEW.id AND NOT is_deleted;
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_databases_soft_delete_rows
  AFTER UPDATE OF is_deleted ON databases
  FOR EACH ROW EXECUTE FUNCTION soft_delete_database_rows();

COMMIT;
