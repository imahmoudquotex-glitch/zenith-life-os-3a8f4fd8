-- Migration:    0307__push_subscriptions
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Web Push VAPID subscription store
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id            TEXT PRIMARY KEY,            -- ULID
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id  TEXT REFERENCES workspaces(id),
  endpoint      TEXT NOT NULL,               -- VAPID push endpoint URL (stored as SHA-256 hash externally)
  p256dh        TEXT NOT NULL,               -- Client public key
  auth_key      TEXT NOT NULL,               -- Client auth secret
  user_agent    TEXT,
  device_id     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at    TIMESTAMPTZ,
  UNIQUE (user_id, endpoint)
);

CREATE INDEX idx_push_subscriptions_user
  ON push_subscriptions(user_id)
  WHERE revoked_at IS NULL;

CREATE INDEX idx_push_subscriptions_workspace
  ON push_subscriptions(workspace_id)
  WHERE revoked_at IS NULL;

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY push_subscriptions_self ON push_subscriptions
  USING (user_id = current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON push_subscriptions TO app_user;

COMMENT ON TABLE push_subscriptions IS 'W03: VAPID push subscription store. Actual send logic in Wave 19';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'W03: Push endpoint — no PII, only subscription URL';

COMMIT;
