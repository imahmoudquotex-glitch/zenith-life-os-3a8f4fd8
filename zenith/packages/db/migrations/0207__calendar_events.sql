BEGIN;
CREATE TABLE IF NOT EXISTS calendar_events (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  title           TEXT NOT NULL DEFAULT '',
  description     TEXT,
  starts_at       TIMESTAMPTZ NOT NULL,
  ends_at         TIMESTAMPTZ NOT NULL,
  timezone        TEXT NOT NULL DEFAULT 'UTC',
  all_day         BOOLEAN NOT NULL DEFAULT false,
  location        TEXT,
  rrule           TEXT,
  source          TEXT NOT NULL DEFAULT 'internal',
  external_id     TEXT,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_calendar_events_ends_after_starts CHECK (ends_at >= starts_at)
);
CREATE INDEX idx_calendar_events_workspace_range ON calendar_events(workspace_id, starts_at, ends_at) WHERE is_deleted = false;
CREATE TRIGGER trg_calendar_events_before_update_set_updated_at BEFORE UPDATE ON calendar_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events FORCE ROW LEVEL SECURITY;
CREATE POLICY calendar_events_isolation ON calendar_events USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON calendar_events TO app_user;
COMMIT;