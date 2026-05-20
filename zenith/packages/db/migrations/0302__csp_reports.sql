-- 0302__csp_reports.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS csp_reports (
  id              TEXT PRIMARY KEY,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id         TEXT REFERENCES users(id),
  document_uri    TEXT,
  referrer        TEXT,
  blocked_uri     TEXT,
  violated_directive TEXT,
  effective_directive TEXT,
  original_policy TEXT,
  disposition     TEXT,
  status_code     INT,
  user_agent      TEXT,
  ip              INET
);
CREATE INDEX idx_csp_reports_received_at ON csp_reports(received_at DESC);
CREATE INDEX idx_csp_reports_violated ON csp_reports(violated_directive, received_at DESC);
ALTER TABLE csp_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE csp_reports FORCE ROW LEVEL SECURITY;
CREATE POLICY csp_reports_self ON csp_reports FOR SELECT USING (user_id = current_user_id());
GRANT SELECT, INSERT ON csp_reports TO app_user;
COMMIT;
