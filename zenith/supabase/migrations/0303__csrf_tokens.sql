-- Migration:    0303__csrf_tokens
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Optional rotating CSRF token store
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS csrf_tokens (
  id          TEXT PRIMARY KEY,         -- ULID
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  BYTEA NOT NULL,           -- SHA-256 of the token (never plaintext)
  issued_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  revoked_at  TIMESTAMPTZ,
  CONSTRAINT chk_csrf_expiry CHECK (expires_at > issued_at)
);

CREATE INDEX idx_csrf_tokens_user       ON csrf_tokens(user_id, expires_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX idx_csrf_tokens_expires    ON csrf_tokens(expires_at) WHERE revoked_at IS NULL;

ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE csrf_tokens FORCE ROW LEVEL SECURITY;

-- Users can only see their own tokens via service role
CREATE POLICY csrf_tokens_self ON csrf_tokens
  FOR ALL USING (user_id = current_user_id());

GRANT SELECT, INSERT, UPDATE ON csrf_tokens TO app_user;

COMMENT ON TABLE csrf_tokens IS 'W03: Optional server-side CSRF token rotation store';

COMMIT;
