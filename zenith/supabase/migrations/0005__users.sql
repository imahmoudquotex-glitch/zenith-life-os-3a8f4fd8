-- File: 0005__users.sql
-- Wave: 01
-- Description: Users table — auth identity linked to Supabase Auth
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.users (
  id              TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  email           CITEXT NOT NULL,
  email_verified  BOOLEAN NOT NULL DEFAULT FALSE,
  display_name    TEXT,
  avatar_url      TEXT,
  locale          TEXT NOT NULL DEFAULT 'ar',
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_users_email UNIQUE (email),
  CONSTRAINT chk_users_email_format CHECK (email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

-- Partial index for active users
CREATE INDEX IF NOT EXISTS idx_users_email_active
  ON public.users (email) WHERE NOT is_deleted;

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_users_update_set_updated_at ON public.users;
CREATE TRIGGER trg_users_update_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.users IS 'User profiles — synced from Supabase Auth';

COMMIT;
