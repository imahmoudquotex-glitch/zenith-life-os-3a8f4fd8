-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0301_sessions.sql
-- Wave:        W03 (0301–0400)
-- Description: Sessions
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W03: 0301_sessions.sql
-- Encrypted session storage (vault-level)
-- Wave: W03 (0300-0399)

CREATE TABLE IF NOT EXISTS encrypted_sessions (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  user_id         TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  ciphertext      TEXT        NOT NULL,     -- XChaCha20-Poly1305 encrypted blob
  nonce           TEXT        NOT NULL,     -- base64 24-byte nonce
  key_version     INTEGER     NOT NULL DEFAULT 1,
  ua              TEXT,                     -- user-agent (fingerprint only, not stored plaintext)
  ip_hash         TEXT,                     -- SHA-256 of IP (not raw IP)
  expires_at      TIMESTAMPTZ NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS encrypted_sessions_user_idx ON encrypted_sessions (user_id);
CREATE INDEX IF NOT EXISTS encrypted_sessions_expiry_idx ON encrypted_sessions (expires_at);

-- Sessions are personal — no workspace-level sharing
ALTER TABLE encrypted_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE encrypted_sessions FORCE ROW LEVEL SECURITY;
CREATE POLICY "encrypted_sessions_owner_only"
  ON encrypted_sessions FOR ALL
  USING (user_id = auth.uid()::text);



COMMIT;
