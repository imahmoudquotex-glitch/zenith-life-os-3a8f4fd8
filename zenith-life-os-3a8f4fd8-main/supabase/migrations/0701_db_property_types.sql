BEGIN;

-- ============================================================
-- 0701: db_property_types_enum
-- ============================================================
DO $$ BEGIN
  CREATE TYPE db_property_type AS ENUM (
    'title', 'text', 'number', 'select', 'multi_select', 'status',
    'date', 'datetime', 'person', 'file', 'checkbox', 'url',
    'email', 'phone', 'formula', 'relation', 'rollup',
    'created_at', 'updated_at', 'created_by', 'last_edited_by',
    'place', 'auto_increment_id'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 0702: db_properties table
-- ============================================================
CREATE TABLE IF NOT EXISTS db_properties (
  id             TEXT PRIMARY KEY,
  database_id    TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
  workspace_id   TEXT NOT NULL REFERENCES workspaces(id),
  name           TEXT NOT NULL,
  type           TEXT NOT NULL,
  config         JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(config) = 'object'),
  position       DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_primary     BOOLEAN NOT NULL DEFAULT FALSE,
  is_hidden      BOOLEAN NOT NULL DEFAULT FALSE,
  is_system      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_property_name CHECK (length(name) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS idx_db_properties_database ON db_properties(database_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS uq_db_properties_primary ON db_properties(database_id) WHERE is_primary = TRUE;

ALTER TABLE db_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_properties FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_properties' AND policyname='db_properties_isolation') THEN
    CREATE POLICY db_properties_isolation ON db_properties USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_properties TO app_user;

CREATE OR REPLACE TRIGGER trg_db_properties_updated_at
  BEFORE UPDATE ON db_properties
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
