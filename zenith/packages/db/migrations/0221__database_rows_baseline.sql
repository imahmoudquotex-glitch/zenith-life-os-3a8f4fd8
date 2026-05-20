-- Wave: W02
BEGIN;
CREATE TABLE IF NOT EXISTS database_rows (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  page_id         TEXT REFERENCES pages(id),
  schema_key      TEXT NOT NULL DEFAULT 'default',
  properties_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  last_edited_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_database_rows_workspace_schema ON database_rows(workspace_id, schema_key) WHERE is_deleted = false;
CREATE INDEX idx_database_rows_page ON database_rows(page_id) WHERE is_deleted = false;
CREATE TRIGGER trg_database_rows_before_update_set_updated_at BEFORE UPDATE ON database_rows FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE database_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_rows FORCE ROW LEVEL SECURITY;
CREATE POLICY database_rows_isolation ON database_rows USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON database_rows TO app_user;
COMMIT;