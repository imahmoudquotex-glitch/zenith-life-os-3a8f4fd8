-- Migration 0010: Users table
-- Foundation table — all workspace membership derives from this
BEGIN;

CREATE TABLE public.users (
  id          TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  auth_uid    UUID NOT NULL UNIQUE,  -- Supabase auth.users FK
  email       TEXT NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url  TEXT,
  locale      TEXT NOT NULL DEFAULT 'en',
  timezone    TEXT NOT NULL DEFAULT 'UTC',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;

CREATE TRIGGER trg_users_set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.users IS 'Application users (mapped from Supabase auth)';

COMMIT;
