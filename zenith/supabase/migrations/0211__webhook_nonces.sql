-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0211__webhook_nonces.sql
-- Wave:        W02 (0211–0310)
-- Description:  Webhook Nonces
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0211__webhook_nonces.sql
-- Wave: W02
-- Purpose: Webhook nonce store for anti-replay attack prevention
-- Access: service role ONLY — app_user has NO access

BEGIN;
CREATE TABLE IF NOT EXISTS webhook_nonces (
  source     TEXT NOT NULL,
  nonce      TEXT NOT NULL,
  seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, nonce)
);

CREATE INDEX idx_webhook_nonces_seen_at ON webhook_nonces(seen_at);

-- Strictly service-role only — never accessible from app_user
REVOKE ALL ON webhook_nonces FROM PUBLIC;
REVOKE ALL ON webhook_nonces FROM app_user;
COMMIT;
