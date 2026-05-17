BEGIN;

-- ============================================================
-- 0706: db_relations table
-- ============================================================
CREATE TABLE IF NOT EXISTS db_relations (
  id                 TEXT PRIMARY KEY,
  workspace_id       TEXT NOT NULL REFERENCES workspaces(id),
  property_id        TEXT NOT NULL REFERENCES db_properties(id) ON DELETE CASCADE,
  target_database_id TEXT NOT NULL REFERENCES databases(id),
  synced_property_id TEXT REFERENCES db_properties(id),
  limit_to           INT, -- max linked rows, NULL = unlimited
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE db_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_relations FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_relations' AND policyname='db_relations_isolation') THEN
    CREATE POLICY db_relations_isolation ON db_relations USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_relations TO app_user;

-- ============================================================
-- 0707: db_relation_values + same-workspace cross-block trigger
-- ============================================================
CREATE TABLE IF NOT EXISTS db_relation_values (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES workspaces(id),
  property_id   TEXT NOT NULL REFERENCES db_properties(id) ON DELETE CASCADE,
  source_row_id TEXT NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
  target_row_id TEXT NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, source_row_id, target_row_id)
);

CREATE INDEX IF NOT EXISTS idx_db_relation_values_source ON db_relation_values(source_row_id, property_id);
CREATE INDEX IF NOT EXISTS idx_db_relation_values_target ON db_relation_values(target_row_id, property_id);

ALTER TABLE db_relation_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_relation_values FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_relation_values' AND policyname='db_relation_values_isolation') THEN
    CREATE POLICY db_relation_values_isolation ON db_relation_values USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_relation_values TO app_user;

-- Cross-workspace relation prevention trigger
CREATE OR REPLACE FUNCTION assert_relation_same_workspace() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_src TEXT; v_tgt TEXT;
BEGIN
  SELECT workspace_id INTO v_src FROM db_rows WHERE id = NEW.source_row_id;
  SELECT workspace_id INTO v_tgt FROM db_rows WHERE id = NEW.target_row_id;
  IF v_src IS DISTINCT FROM v_tgt THEN
    RAISE EXCEPTION 'cross_workspace_relation_blocked';
  END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE TRIGGER trg_db_relation_same_ws
  BEFORE INSERT OR UPDATE ON db_relation_values
  FOR EACH ROW EXECUTE FUNCTION assert_relation_same_workspace();

COMMIT;
