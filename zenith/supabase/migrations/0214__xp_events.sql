-- 0214__xp_events.sql
-- Wave: W02
-- Purpose: Experience points event ledger for gamification layer (Wave 20+)

BEGIN;
CREATE TABLE IF NOT EXISTS xp_events (
  id           TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id      TEXT NOT NULL REFERENCES users(id),
  delta        INT NOT NULL,
  reason       TEXT NOT NULL,
  source_type  TEXT NOT NULL DEFAULT 'system',
  source_id    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_workspace_user ON xp_events(workspace_id, user_id, created_at DESC);

ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events FORCE ROW LEVEL SECURITY;
CREATE POLICY xp_events_isolation ON xp_events
  USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT ON xp_events TO app_user;
COMMIT;
