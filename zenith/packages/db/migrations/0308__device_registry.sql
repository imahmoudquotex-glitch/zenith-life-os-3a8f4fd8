-- 0308__device_registry.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS device_registry (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  name            TEXT,
  user_agent      TEXT,
  platform        TEXT,
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at      TIMESTAMPTZ,
  trust_level     TEXT NOT NULL DEFAULT 'unknown',
  CONSTRAINT chk_trust CHECK (trust_level IN ('trusted','known','unknown','revoked'))
);
CREATE INDEX idx_device_registry_user ON device_registry(user_id) WHERE revoked_at IS NULL;
ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registry FORCE ROW LEVEL SECURITY;
CREATE POLICY device_registry_self ON device_registry USING (user_id = current_user_id());
GRANT SELECT, INSERT, UPDATE ON device_registry TO app_user;
COMMIT;
