-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0208__vault_items_extend.sql
-- Wave:        W02 (0208–0307)
-- Description:  Vault Items Extend
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0208__vault_items_extend.sql
-- Wave: W02
-- Purpose: Extend vault_items with ZKE encryption fields — no plaintext storage ever

BEGIN;
ALTER TABLE vault_items
  ADD COLUMN IF NOT EXISTS wrapped_iek BYTEA,
  ADD COLUMN IF NOT EXISTS nonce BYTEA,
  ADD COLUMN IF NOT EXISTS aead_tag BYTEA,
  ADD COLUMN IF NOT EXISTS encryption_algo TEXT NOT NULL DEFAULT 'xchacha20poly1305',
  ADD COLUMN IF NOT EXISTS kdf_params JSONB NOT NULL DEFAULT '{"alg":"argon2id","t":3,"m":65536,"p":4}'::jsonb,
  ADD COLUMN IF NOT EXISTS key_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS aad_context JSONB NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_vault_items_key_version ON vault_items(workspace_id, key_version);

-- Remove any plaintext columns if they exist (ZKE enforcement)
ALTER TABLE vault_items DROP COLUMN IF EXISTS content_text;
ALTER TABLE vault_items DROP COLUMN IF EXISTS plaintext;
COMMIT;
