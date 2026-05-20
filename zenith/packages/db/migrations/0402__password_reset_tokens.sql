-- 0402__password_reset_tokens.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  BYTEA NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '60 minutes'),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  consumed_at TIMESTAMPTZ,
  invalidated_at TIMESTAMPTZ,
  UNIQUE (token_hash)
);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_user ON password_reset_tokens(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_expires ON password_reset_tokens(expires_at) WHERE consumed_at IS NULL;
COMMIT;
