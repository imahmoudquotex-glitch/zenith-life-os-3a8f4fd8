-- Migration:    0304__sessions_extend
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Extend sessions table for device tracking + revocation
-- Created:      2026-05-16

BEGIN;

ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS device_fingerprint TEXT,
  ADD COLUMN IF NOT EXISTS last_seen_ip        INET,
  ADD COLUMN IF NOT EXISTS revoked_at          TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS revoke_reason       TEXT;

CREATE INDEX IF NOT EXISTS idx_sessions_user_revoked
  ON sessions(user_id, revoked_at)
  WHERE revoked_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_sessions_last_seen
  ON sessions(last_seen_ip, created_at DESC)
  WHERE revoked_at IS NULL;

COMMENT ON COLUMN sessions.device_fingerprint IS 'W03: Hashed user-agent + accept-language fingerprint';
COMMENT ON COLUMN sessions.last_seen_ip       IS 'W03: Last IP that used this session (for new-device alerts)';
COMMENT ON COLUMN sessions.revoked_at         IS 'W03: Set on password change or manual revoke';
COMMENT ON COLUMN sessions.revoke_reason      IS 'W03: password_change | user_revoked | admin_revoked';

COMMIT;
