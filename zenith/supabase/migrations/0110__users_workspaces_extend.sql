-- File: 0110__users_workspaces_extend.sql
-- Wave: 02
-- Description: Extend users_workspaces with invitation and activity metadata
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

ALTER TABLE public.users_workspaces ADD COLUMN IF NOT EXISTS invited_at TIMESTAMPTZ;
ALTER TABLE public.users_workspaces ADD COLUMN IF NOT EXISTS last_active_at TIMESTAMPTZ;

-- Auto-update trigger (add if missing from Wave 00)
DROP TRIGGER IF EXISTS trg_users_workspaces_update_set_updated_at ON public.users_workspaces;

-- Add updated_at column if missing
ALTER TABLE public.users_workspaces ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TRIGGER trg_users_workspaces_update_set_updated_at
  BEFORE UPDATE ON public.users_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON COLUMN public.users_workspaces.invited_at IS 'When the user was invited (NULL if direct join)';
COMMENT ON COLUMN public.users_workspaces.last_active_at IS 'Last activity timestamp for workspace analytics';

COMMIT;
