BEGIN;
CREATE TABLE IF NOT EXISTS webhook_nonces (
  source     TEXT NOT NULL,
  nonce      TEXT NOT NULL,
  seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, nonce)
);
CREATE INDEX idx_webhook_nonces_seen_at ON webhook_nonces(seen_at);
-- ممنوع access من app_user — service role only
REVOKE ALL ON webhook_nonces FROM PUBLIC;
REVOKE ALL ON webhook_nonces FROM app_user;
COMMIT;