-- 0406__webauthn_credentials.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  id              TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id         TEXT NOT NULL REFERENCES users(id),
  credential_id   BYTEA NOT NULL UNIQUE,
  public_key      BYTEA NOT NULL,
  sign_count      INT NOT NULL DEFAULT 0,
  transports      TEXT[] NOT NULL DEFAULT '{}',
  device_type     TEXT NOT NULL DEFAULT 'platform',
  backed_up       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_webauthn_user ON webauthn_credentials(user_id);
COMMIT;
