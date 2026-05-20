-- 0303__csrf_tokens.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS csrf_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id),
  token_hash  BYTEA NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_csrf_tokens_user ON csrf_tokens(user_id, expires_at);
ALTER TABLE csrf_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE csrf_tokens FORCE ROW LEVEL SECURITY;
CREATE POLICY csrf_tokens_self ON csrf_tokens USING (user_id = current_user_id());
GRANT SELECT, INSERT, DELETE ON csrf_tokens TO app_user;
COMMIT;
