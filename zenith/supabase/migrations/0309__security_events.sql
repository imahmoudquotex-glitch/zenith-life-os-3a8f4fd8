-- Migration:    0309__security_events
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Priority security events (login failures, lockouts, signature mismatches)
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS security_events (
  id            TEXT PRIMARY KEY,            -- ULID
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  severity      TEXT NOT NULL,
  kind          TEXT NOT NULL,               -- login.failed | webhook.rejected | csrf.rejected | redirect.blocked | vault.wrong_passphrase
  user_id       TEXT REFERENCES users(id),
  workspace_id  TEXT REFERENCES workspaces(id),
  ip            INET,
  user_agent    TEXT,
  request_id    TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,  -- NO secrets, NO PII (redacted before insert)
  CONSTRAINT chk_security_severity CHECK (severity IN ('info', 'warn', 'high', 'critical'))
);

CREATE INDEX idx_security_events_occurred  ON security_events(occurred_at DESC);
CREATE INDEX idx_security_events_kind      ON security_events(kind, occurred_at DESC);
CREATE INDEX idx_security_events_user      ON security_events(user_id, occurred_at DESC) WHERE user_id IS NOT NULL;
CREATE INDEX idx_security_events_severity  ON security_events(severity, occurred_at DESC);

ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_events FORCE ROW LEVEL SECURITY;

-- Admin reads via service role only; users cannot read security events
CREATE POLICY security_events_admin ON security_events FOR SELECT USING (false);

-- app_user can INSERT security events (e.g., login failures)
GRANT INSERT ON security_events TO app_user;

COMMENT ON TABLE security_events IS 'W03: Security-specific events (login failures, CSRF, HMAC rejections). Admin-only via service role';
COMMENT ON COLUMN security_events.metadata IS 'W03: Redacted metadata only — no secrets or PII';

COMMIT;
