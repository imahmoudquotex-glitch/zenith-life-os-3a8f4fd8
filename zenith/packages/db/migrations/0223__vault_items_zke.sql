ALTER TABLE vault_items
  ADD COLUMN IF NOT EXISTS wrapped_iek BYTEA NOT NULL,
  ADD COLUMN IF NOT EXISTS nonce BYTEA NOT NULL,
  ADD COLUMN IF NOT EXISTS aead_tag BYTEA NOT NULL,
  ADD COLUMN IF NOT EXISTS encryption_algo TEXT NOT NULL DEFAULT 'xchacha20poly1305',
  ADD COLUMN IF NOT EXISTS kdf_params JSONB NOT NULL DEFAULT '{"alg":"argon2id","t":3,"m":65536,"p":4}'::jsonb,
  ADD COLUMN IF NOT EXISTS key_version INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS aad_context JSONB NOT NULL DEFAULT '{}'::jsonb;
CREATE INDEX idx_vault_items_key_version ON vault_items(workspace_id, key_version);
-- ممنوع plaintext column نهائياً
ALTER TABLE vault_items DROP COLUMN IF EXISTS content_text;
ALTER TABLE vault_items DROP COLUMN IF EXISTS plaintext;