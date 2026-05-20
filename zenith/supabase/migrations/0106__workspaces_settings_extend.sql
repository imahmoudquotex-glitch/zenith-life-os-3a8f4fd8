-- File: 0106__workspaces_settings_extend.sql
-- Wave: 02
-- Description: Extend workspaces with settings columns
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS icon_kind TEXT CHECK (icon_kind IS NULL OR icon_kind IN ('emoji', 'lucide', 'url'));
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS icon_value TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS banner_url TEXT;
ALTER TABLE public.workspaces ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Africa/Cairo';

COMMENT ON COLUMN public.workspaces.icon_kind IS 'Type of workspace icon: emoji, lucide icon name, or custom URL';
COMMENT ON COLUMN public.workspaces.timezone IS 'IANA timezone for workspace-wide defaults';
COMMENT ON COLUMN public.workspaces.description IS 'Short description, max 500 chars enforced at app layer';

COMMIT;
