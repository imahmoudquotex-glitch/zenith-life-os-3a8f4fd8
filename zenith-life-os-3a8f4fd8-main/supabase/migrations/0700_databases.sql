BEGIN;

-- ============================================================
-- 0700: databases table + RLS + FORCE + indexes
-- ============================================================
CREATE TABLE IF NOT EXISTS databases (
  id                   TEXT PRIMARY KEY,
  workspace_id         TEXT NOT NULL REFERENCES workspaces(id),
  inline_block_id      TEXT REFERENCES blocks(id) ON DELETE SET NULL,
  title                TEXT NOT NULL DEFAULT 'Untitled',
  icon_kind            TEXT,
  icon_value           TEXT,
  cover_url            TEXT,
  description          TEXT,
  is_system            BOOLEAN NOT NULL DEFAULT FALSE,
  default_template_id  TEXT,
  is_deleted           BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at           TIMESTAMPTZ,
  created_by_user_id   TEXT NOT NULL REFERENCES users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_databases_title CHECK (length(title) BETWEEN 1 AND 500)
);

CREATE INDEX IF NOT EXISTS idx_databases_workspace ON databases(workspace_id) WHERE NOT is_deleted;
CREATE INDEX IF NOT EXISTS idx_databases_inline ON databases(inline_block_id) WHERE inline_block_id IS NOT NULL;

ALTER TABLE databases ENABLE ROW LEVEL SECURITY;
ALTER TABLE databases FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='databases' AND policyname='databases_isolation') THEN
    CREATE POLICY databases_isolation ON databases USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON databases TO app_user;

CREATE OR REPLACE TRIGGER trg_databases_set_updated_at
  BEFORE UPDATE ON databases
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;
