-- Migration:    0310__rate_limit_lockouts
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Account/IP level lockouts after repeated failures
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS rate_limit_lockouts (
  id            TEXT PRIMARY KEY,            -- ULID
  key           TEXT NOT NULL,               -- 'login:email:foo@bar.com' | 'login:ip:1.2.3.4'
  locked_until  TIMESTAMPTZ NOT NULL,
  attempts      INT NOT NULL DEFAULT 0,
  reason        TEXT NOT NULL,               -- 'too_many_login_failures' | 'too_many_api_requests'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (key)
);

CREATE INDEX idx_rl_lockouts_key   ON rate_limit_lockouts(key);
CREATE INDEX idx_rl_lockouts_until ON rate_limit_lockouts(locked_until);

-- Service role only — no direct app_user access
REVOKE ALL ON rate_limit_lockouts FROM PUBLIC;
REVOKE ALL ON rate_limit_lockouts FROM app_user;

COMMENT ON TABLE rate_limit_lockouts IS 'W03: Account/IP lockouts after too many failures. Service role only';
COMMENT ON COLUMN rate_limit_lockouts.key IS 'W03: Composite key pattern: type:identifier (email/ip never mixed)';

COMMIT;
