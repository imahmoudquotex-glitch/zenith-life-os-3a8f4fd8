-- 0310__rate_limit_lockouts.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS rate_limit_lockouts (
  id              TEXT PRIMARY KEY,
  key             TEXT NOT NULL,
  locked_until    TIMESTAMPTZ NOT NULL,
  reason          TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key)
);
CREATE INDEX idx_rl_lockouts_until ON rate_limit_lockouts(locked_until);
REVOKE ALL ON rate_limit_lockouts FROM PUBLIC;
REVOKE ALL ON rate_limit_lockouts FROM app_user;
COMMIT;
