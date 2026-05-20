-- Migration:    0300__security_extensions
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Enable pgcrypto extension + domain types for hashes
-- Created:      2026-05-16

BEGIN;

-- Ensure pgcrypto is available for digest() / gen_salt()
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Custom domain for SHA-256 hex strings (64 chars)
DO $$ BEGIN
  CREATE DOMAIN public.sha256_hex AS TEXT
    CONSTRAINT chk_sha256_hex CHECK (VALUE ~ '^[0-9a-f]{64}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Verify digest() works
DO $$
DECLARE v_test BYTEA;
BEGIN
  v_test := digest('test', 'sha256');
  IF length(v_test) != 32 THEN
    RAISE EXCEPTION 'pgcrypto digest not working correctly';
  END IF;
END $$;

COMMIT;
