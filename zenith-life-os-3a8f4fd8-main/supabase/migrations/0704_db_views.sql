BEGIN;

-- ============================================================
-- 0704: db_view_types_enum
-- ============================================================
DO $$ BEGIN
  CREATE TYPE db_view_type AS ENUM ('table','board','gallery','calendar','timeline','list','gantt');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 0705: db_views table + config JSONB
-- ============================================================
CREATE TABLE IF NOT EXISTS db_views (
  id           TEXT PRIMARY KEY,
  database_id  TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  name         TEXT NOT NULL DEFAULT 'Default View',
  type         TEXT NOT NULL DEFAULT 'table',
  config       JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(config) = 'object'),
  -- config: { filters, sorts, groupBy, hiddenProps, columnWidths, rowHeight }
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked    BOOLEAN NOT NULL DEFAULT FALSE, -- for system DBs
  position     DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_view_name CHECK (length(name) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS idx_db_views_database ON db_views(database_id, position);
CREATE UNIQUE INDEX IF NOT EXISTS uq_db_views_default ON db_views(database_id) WHERE is_default = TRUE;

ALTER TABLE db_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_views FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_views' AND policyname='db_views_isolation') THEN
    CREATE POLICY db_views_isolation ON db_views USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_views TO app_user;

CREATE OR REPLACE TRIGGER trg_db_views_updated_at
  BEFORE UPDATE ON db_views
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- 0718: db_view_defaults RPC
-- ============================================================
CREATE OR REPLACE FUNCTION get_default_view(p_database_id TEXT)
RETURNS db_views LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT * FROM db_views
  WHERE database_id = p_database_id AND is_default = TRUE
  LIMIT 1;
$$;

COMMIT;
