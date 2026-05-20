-- 0309__security_events.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS security_events (
  id              TEXT PRIMARY KEY,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity        TEXT NOT NULL,
  kind            TEXT NOT NULL,
  user_id         TEXT REFERENCES users(id),
  workspace_id    TEXT REFERENCES workspaces(id),
  ip              INET,
  user_agent      TEXT,
  request_id      TEXT,
  metadata        JSONB NOT NULL DEFAULT '{}'::jsonb,
  CONSTRAINT chk_security_severity CHECK (severity IN ('info','warn','high','critical'))
);
CREATE INDEX idx_security_events_occurred ON security_events(occurred_at DESC);
CREATE INDEX idx_security_events_kind ON security_events(kind, occurred_at DESC);
CREATE INDEX idx_security_events_user ON security_events(user_id, occurred_at DESC);
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events FORCE ROW LEVEL SECURITY;
CREATE POLICY security_events_admin ON security_events FOR SELECT USING (false);
GRANT INSERT ON security_events TO app_user;
COMMIT;
