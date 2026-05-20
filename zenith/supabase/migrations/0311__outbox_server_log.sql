-- Migration:    0311__outbox_server_log
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Server-side idempotency + audit log for offline outbox sync
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS outbox_server_log (
  id                TEXT PRIMARY KEY,        -- = client-generated Idempotency-Key (ULID)
  user_id           TEXT NOT NULL REFERENCES users(id),
  workspace_id      TEXT REFERENCES workspaces(id),
  mutation          TEXT NOT NULL,           -- e.g. 'tasks.update' | 'notes.create'
  request_hash      BYTEA NOT NULL,          -- SHA-256 of request body for dedup
  response_envelope JSONB,                   -- cached response envelope
  status            TEXT NOT NULL DEFAULT 'received',
  received_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at      TIMESTAMPTZ,
  CONSTRAINT chk_outbox_status CHECK (status IN ('received', 'completed', 'failed', 'duplicate'))
);

CREATE INDEX idx_outbox_user_received
  ON outbox_server_log(user_id, received_at DESC);

CREATE INDEX idx_outbox_workspace_status
  ON outbox_server_log(workspace_id, status, received_at DESC);

ALTER TABLE outbox_server_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbox_server_log FORCE ROW LEVEL SECURITY;

CREATE POLICY outbox_server_log_self ON outbox_server_log
  USING (user_id = current_user_id());

GRANT SELECT, INSERT, UPDATE ON outbox_server_log TO app_user;

COMMENT ON TABLE outbox_server_log IS 'W03: Server-side log for offline sync requests — idempotency + audit';
COMMENT ON COLUMN outbox_server_log.id IS 'W03: Same as Idempotency-Key header from client outbox';
COMMENT ON COLUMN outbox_server_log.request_hash IS 'W03: SHA-256 of body for dedup detection';

COMMIT;
