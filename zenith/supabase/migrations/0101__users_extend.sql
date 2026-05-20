-- File: 0101__users_extend.sql
-- Wave: 02
-- Description: Extend users with profile fields
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Africa/Cairo';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS default_workspace_id TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS marketing_emails_opt_in BOOLEAN NOT NULL DEFAULT FALSE;

-- FK to workspaces (deferred so it doesn't block the trigger in 0100)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_users_default_workspace'
  ) THEN
    ALTER TABLE public.users
      ADD CONSTRAINT fk_users_default_workspace
      FOREIGN KEY (default_workspace_id) REFERENCES public.workspaces(id)
      ON DELETE SET NULL;
  END IF;
END $$;

-- Index for last_seen (analytics)
CREATE INDEX IF NOT EXISTS idx_users_last_seen
  ON public.users (last_seen_at DESC NULLS LAST)
  WHERE NOT is_deleted;

COMMENT ON COLUMN public.users.bio IS 'User bio, max 500 chars enforced at app layer';
COMMENT ON COLUMN public.users.timezone IS 'IANA timezone identifier';
COMMENT ON COLUMN public.users.default_workspace_id IS 'Workspace shown on login redirect';

COMMIT;
