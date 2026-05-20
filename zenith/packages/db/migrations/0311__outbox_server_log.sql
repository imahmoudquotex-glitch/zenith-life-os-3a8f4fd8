-- 0311__outbox_server_log.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS outbox_server_log (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL REFERENCES users(id),
  workspace_id    TEXT REFERENCES workspaces(id),
  mutation        TEXT NOT NULL,
  request_hash    BYTEA NOT NULL,
  response_envelope JSONB,
  status          TEXT NOT NULL DEFAULT 'received',
  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT chk_outbox_status CHECK (status IN ('received','completed','failed','duplicate'))
);
CREATE INDEX idx_outbox_user_received ON outbox_server_log(user_id, received_at DESC);
ALTER TABLE outbox_server_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_server_log FORCE ROW LEVEL SECURITY;
CREATE POLICY outbox_server_log_self ON outbox_server_log USING (user_id = current_user_id());
GRANT SELECT, INSERT, UPDATE ON outbox_server_log TO app_user;
COMMIT;
