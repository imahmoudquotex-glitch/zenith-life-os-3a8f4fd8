-- 0209__ai_usage.sql
-- Wave: W02
-- Purpose: AI quota tables — daily usage ledger + event log with atomic RPC control

BEGIN;
CREATE TABLE IF NOT EXISTS ai_usage (
  user_id    TEXT NOT NULL REFERENCES users(id),
  day_local  DATE NOT NULL,
  count      INT  NOT NULL DEFAULT 0,
  last_kind  TEXT,
  last_used_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, day_local)
);

ALTER TABLE ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_self ON ai_usage FOR SELECT USING (user_id = current_user_id());
GRANT SELECT ON ai_usage TO app_user;

CREATE TABLE IF NOT EXISTS ai_usage_events (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  day_local    DATE NOT NULL,
  kind         TEXT NOT NULL,
  mode         TEXT NOT NULL,
  request_id   TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'reserved',
  provider     TEXT,
  model        TEXT,
  input_tokens INT,
  output_tokens INT,
  cost_cents   BIGINT,
  error_code   TEXT,
  metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, request_id),
  CONSTRAINT chk_ai_usage_events_status CHECK (status IN ('reserved','completed','failed','refunded'))
);

CREATE INDEX idx_ai_usage_events_user_day ON ai_usage_events(user_id, day_local DESC);
CREATE INDEX idx_ai_usage_events_workspace ON ai_usage_events(workspace_id, created_at DESC);

ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_events FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_events_self ON ai_usage_events FOR SELECT USING (user_id = current_user_id());
GRANT SELECT ON ai_usage_events TO app_user;
COMMIT;
