-- Migration:    0312__conflict_resolutions
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Log for every offline sync conflict and how it was resolved
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS conflict_resolutions (
  id                  TEXT PRIMARY KEY,          -- ULID
  user_id             TEXT NOT NULL REFERENCES users(id),
  workspace_id        TEXT REFERENCES workspaces(id),
  entity_type         TEXT NOT NULL,             -- task | note | habit_checkin | expense | vault_item
  entity_id           TEXT NOT NULL,
  strategy            TEXT NOT NULL,             -- last_write_wins | server_wins | client_wins | show_conflict
  winner              TEXT NOT NULL,             -- client | server | merged
  client_version      INT,
  server_version      INT,
  client_updated_at   TIMESTAMPTZ,
  server_updated_at   TIMESTAMPTZ,
  details_json        JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolved_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_conflict_strategy CHECK (strategy IN ('last_write_wins', 'server_wins', 'client_wins', 'show_conflict')),
  CONSTRAINT chk_conflict_winner   CHECK (winner IN ('client', 'server', 'merged'))
);

CREATE INDEX idx_conflict_user_resolved ON conflict_resolutions(user_id, resolved_at DESC);
CREATE INDEX idx_conflict_entity        ON conflict_resolutions(entity_type, entity_id);
CREATE INDEX idx_conflict_workspace     ON conflict_resolutions(workspace_id, resolved_at DESC);

ALTER TABLE conflict_resolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflict_resolutions FORCE ROW LEVEL SECURITY;

CREATE POLICY conflict_resolutions_self ON conflict_resolutions
  USING (user_id = current_user_id());

GRANT SELECT, INSERT ON conflict_resolutions TO app_user;

COMMENT ON TABLE conflict_resolutions IS 'W03: Audit log of every offline sync conflict and its resolution strategy';

COMMIT;
