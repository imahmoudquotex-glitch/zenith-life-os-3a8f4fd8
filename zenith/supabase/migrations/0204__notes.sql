-- 0204__notes.sql
-- Wave: W02
-- Purpose: Notes + version history tables with full-text search and RLS isolation

BEGIN;
CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  page_id         TEXT REFERENCES pages(id),
  title           TEXT NOT NULL DEFAULT '',
  content_md      TEXT NOT NULL DEFAULT '',
  search_tsv      tsvector,
  pinned          BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_notes_workspace_pinned ON notes(workspace_id, pinned) WHERE is_deleted = false;
CREATE INDEX idx_notes_workspace_updated ON notes(workspace_id, updated_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_notes_search ON notes USING GIN(search_tsv);

CREATE TABLE IF NOT EXISTS note_versions (
  id              TEXT PRIMARY KEY,
  note_id         TEXT NOT NULL REFERENCES notes(id),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  content_md      TEXT NOT NULL,
  edited_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_note_versions_note ON note_versions(note_id, created_at DESC);

CREATE TRIGGER trg_notes_before_update_set_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes FORCE ROW LEVEL SECURITY;
CREATE POLICY notes_isolation ON notes USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO app_user;

ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY note_versions_isolation ON note_versions USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT ON note_versions TO app_user;
COMMIT;
