-- 0408__captcha_attempts.sql — Wave W04
BEGIN;
CREATE TABLE IF NOT EXISTS captcha_attempts (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  ip          INET NOT NULL,
  action      TEXT NOT NULL,
  success     BOOLEAN NOT NULL,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_captcha_ip_action ON captcha_attempts(ip, action, verified_at DESC);
COMMIT;
