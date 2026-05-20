-- 0400__oauth_state_tokens.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS oauth_state_tokens (
  id           TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  state        TEXT NOT NULL UNIQUE,
  nonce        TEXT,
  pkce_verifier TEXT,
  provider     TEXT NOT NULL,
  redirect_to  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '10 minutes'),
  consumed_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_oauth_state_expires ON oauth_state_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_oauth_state_state ON oauth_state_tokens(state) WHERE consumed_at IS NULL;
COMMIT;
