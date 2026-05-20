-- Migration:    0306__vault_master_key_meta
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Store KDF params + verifier for vault passphrase (NO plaintext ever)
-- Created:      2026-05-16

BEGIN;

CREATE TABLE IF NOT EXISTS vault_master_key_meta (
  user_id       TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  kdf           TEXT NOT NULL DEFAULT 'argon2id',
  kdf_params    JSONB NOT NULL,   -- {memory: 65536, iterations: 3, parallelism: 1, saltLen: 16, keyLen: 32}
  salt          BYTEA NOT NULL,   -- 16+ bytes random salt
  verifier      BYTEA NOT NULL,   -- SHA-256(masterKey || salt) for passphrase verification — NOT the key itself
  key_version   BIGINT NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at    TIMESTAMPTZ,
  CONSTRAINT chk_kdf CHECK (kdf IN ('argon2id')),
  CONSTRAINT chk_salt_len CHECK (length(salt) >= 16)
);

ALTER TABLE vault_master_key_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_master_key_meta FORCE ROW LEVEL SECURITY;

CREATE POLICY vault_master_key_meta_self ON vault_master_key_meta
  USING (user_id = current_user_id());

GRANT SELECT, INSERT, UPDATE ON vault_master_key_meta TO app_user;

COMMENT ON TABLE  vault_master_key_meta IS 'W03: KDF params for vault passphrase derivation. Never stores master key or plaintext';
COMMENT ON COLUMN vault_master_key_meta.verifier IS 'W03: Hash to verify correct passphrase — NOT the encryption key';
COMMENT ON COLUMN vault_master_key_meta.kdf_params IS 'W03: {memory:65536, iterations:3, parallelism:1}';

COMMIT;
