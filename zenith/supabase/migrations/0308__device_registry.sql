-- Migration:    0308__device_registry
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Registered device list for session management
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS device_registry (
  id            TEXT PRIMARY KEY,            -- ULID
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name          TEXT,
  user_agent    TEXT,
  platform      TEXT,
  fingerprint   TEXT,                        -- Hashed device fingerprint (not raw)
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  trust_level   TEXT NOT NULL DEFAULT 'unknown',
  CONSTRAINT chk_trust CHECK (trust_level IN ('trusted', 'known', 'unknown', 'revoked'))
);

CREATE INDEX idx_device_registry_user
  ON device_registry(user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_device_registry_fingerprint
  ON device_registry(fingerprint)
  WHERE revoked_at IS NULL;

ALTER TABLE device_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_registry FORCE ROW LEVEL SECURITY;

CREATE POLICY device_registry_self ON device_registry
  USING (user_id = current_user_id());

GRANT SELECT, INSERT, UPDATE ON device_registry TO app_user;

COMMENT ON TABLE device_registry IS 'W03: Registered devices for session management UI';

COMMIT;
