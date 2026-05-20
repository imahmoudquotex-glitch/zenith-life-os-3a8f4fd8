-- 0405__auth_lockouts.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS auth_lockouts (
  id            TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  key           TEXT NOT NULL UNIQUE,
  attempt_count INT  NOT NULL DEFAULT 0,
  locked_until  TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_auth_lockouts_key ON auth_lockouts(key);
COMMIT;
