-- 0306__vault_master_key_meta.sql
-- Wave: W03
BEGIN;
CREATE TABLE IF NOT EXISTS vault_master_key_meta (
  user_id       TEXT PRIMARY KEY REFERENCES users(id),
  kdf           TEXT NOT NULL DEFAULT 'argon2id',
  kdf_params    JSONB NOT NULL,
  salt          BYTEA NOT NULL,
  verifier      BYTEA NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at    TIMESTAMPTZ,
  CONSTRAINT chk_kdf CHECK (kdf IN ('argon2id'))
);
ALTER TABLE vault_master_key_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_master_key_meta FORCE ROW LEVEL SECURITY;
CREATE POLICY vault_master_key_meta_self ON vault_master_key_meta USING (user_id = current_user_id());
GRANT SELECT, INSERT, UPDATE ON vault_master_key_meta TO app_user;
COMMIT;
