-- Migration:    0302__csp_reports
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  CSP violation reports table
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS csp_reports (
  id                    TEXT PRIMARY KEY,               -- ULID from app
  received_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id               TEXT REFERENCES users(id),
  workspace_id          TEXT REFERENCES workspaces(id),
  document_uri          TEXT,
  referrer              TEXT,
  blocked_uri           TEXT,
  violated_directive    TEXT,
  effective_directive   TEXT,
  original_policy       TEXT,
  disposition           TEXT CHECK (disposition IN ('enforce', 'report')),
  status_code           INT,
  user_agent            TEXT,
  ip                    INET
);

CREATE INDEX idx_csp_reports_received_at  ON csp_reports(received_at DESC);
CREATE INDEX idx_csp_reports_violated     ON csp_reports(violated_directive, received_at DESC);
CREATE INDEX idx_csp_reports_blocked      ON csp_reports(blocked_uri, received_at DESC);

ALTER TABLE csp_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE csp_reports FORCE ROW LEVEL SECURITY;

-- Only owner can see their reports; admin uses service role
CREATE POLICY csp_reports_self ON csp_reports
  FOR SELECT USING (user_id = current_user_id());

-- Insert only via service role (middleware), not directly from app_user
GRANT SELECT ON csp_reports TO app_user;

COMMENT ON TABLE csp_reports IS 'W03: CSP violation reports collected from browser';

COMMIT;
