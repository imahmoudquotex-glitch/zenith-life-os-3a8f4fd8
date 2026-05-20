-- File: 0004__workspaces.sql
-- Wave: 01
-- Description: Core workspaces table — multi-tenant root entity
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.workspaces (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  slug          CITEXT NOT NULL,
  name          TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  plan          TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free')),
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_workspaces_slug UNIQUE (slug),
  CONSTRAINT chk_workspaces_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'),
  CONSTRAINT chk_workspaces_owner_ulid CHECK (public.is_ulid(owner_user_id))
);

-- Partial index for active workspaces
CREATE INDEX IF NOT EXISTS idx_workspaces_slug_active
  ON public.workspaces (slug) WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_workspaces_owner
  ON public.workspaces (owner_user_id) WHERE NOT is_deleted;

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_workspaces_update_set_updated_at ON public.workspaces;
CREATE TRIGGER trg_workspaces_update_set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.workspaces IS 'Multi-tenant workspace — root isolation entity';

COMMIT;
