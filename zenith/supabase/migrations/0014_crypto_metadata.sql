-- File: 0014__crypto_metadata.sql
-- Wave: 01
-- Description: Encryption algorithm registry and key version tracking
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

-- Encryption algorithms enum
DO $$ BEGIN
  CREATE TYPE public.encryption_algo AS ENUM (
    'xchacha20-poly1305',
    'x25519-sealed-box'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Key versions for rotation
CREATE TABLE IF NOT EXISTS public.key_versions (
  id          TEXT PRIMARY KEY CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id),
  version     INT NOT NULL DEFAULT 1,
  algorithm   public.encryption_algo NOT NULL DEFAULT 'xchacha20-poly1305',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  rotated_at  TIMESTAMPTZ,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (workspace_id, version)
);

ALTER TABLE public.key_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY key_versions_isolation ON public.key_versions
  USING (workspace_id = current_setting('app.current_workspace_id', true));

COMMIT;
