-- Wave: W02
BEGIN;
CREATE TABLE IF NOT EXISTS canvas_nodes (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  page_id         TEXT REFERENCES pages(id),
  kind            TEXT NOT NULL,
  x               DOUBLE PRECISION NOT NULL DEFAULT 0,
  y               DOUBLE PRECISION NOT NULL DEFAULT 0,
  width           DOUBLE PRECISION NOT NULL DEFAULT 240,
  height          DOUBLE PRECISION NOT NULL DEFAULT 160,
  data_json       JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_by_user_id TEXT NOT NULL REFERENCES users(id),
  last_edited_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT chk_canvas_nodes_kind CHECK (kind IN ('page','note','task','database','external','group'))
);
CREATE INDEX idx_canvas_nodes_workspace_page ON canvas_nodes(workspace_id, page_id) WHERE is_deleted = false;
CREATE TRIGGER trg_canvas_nodes_before_update_set_updated_at BEFORE UPDATE ON canvas_nodes FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE canvas_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_nodes FORCE ROW LEVEL SECURITY;
CREATE POLICY canvas_nodes_isolation ON canvas_nodes USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON canvas_nodes TO app_user;
COMMIT;