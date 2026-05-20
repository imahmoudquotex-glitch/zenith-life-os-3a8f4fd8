-- Migration:    0305__vault_envelope_extend
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Add E2E encryption fields to vault_items
-- Created:      2026-05-16

BEGIN;

ALTER TABLE vault_items
  ADD COLUMN IF NOT EXISTS algo             TEXT NOT NULL DEFAULT 'AES-GCM-256',
  ADD COLUMN IF NOT EXISTS iv               BYTEA,
  ADD COLUMN IF NOT EXISTS auth_tag         BYTEA,
  ADD COLUMN IF NOT EXISTS wrapped_item_key BYTEA,
  ADD COLUMN IF NOT EXISTS aad              TEXT,
  ADD COLUMN IF NOT EXISTS key_version      BIGINT NOT NULL DEFAULT 1;

ALTER TABLE vault_items
  ADD CONSTRAINT chk_vault_algo CHECK (algo IN ('AES-GCM-256'));

CREATE INDEX IF NOT EXISTS idx_vault_items_key_version
  ON vault_items(workspace_id, key_version);

COMMENT ON COLUMN vault_items.algo             IS 'W03: Encryption algorithm — only AES-GCM-256 allowed';
COMMENT ON COLUMN vault_items.iv               IS 'W03: AES-GCM IV (12 bytes random)';
COMMENT ON COLUMN vault_items.auth_tag         IS 'W03: AES-GCM authentication tag (16 bytes)';
COMMENT ON COLUMN vault_items.wrapped_item_key IS 'W03: Per-item key wrapped with master key via AES-GCM';
COMMENT ON COLUMN vault_items.aad              IS 'W03: AEAD additional data: workspace_id|user_id|item_id';
COMMENT ON COLUMN vault_items.key_version      IS 'W03: Master key version for rotation support';

COMMIT;
