-- Migration 0011: Workspaces table
BEGIN;

CREATE TABLE public.workspaces (
  id          TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  name        TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  slug        TEXT NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]{3,50}$'),
  icon        TEXT,
  plan        TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'supporter')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces FORCE ROW LEVEL SECURITY;

CREATE TRIGGER trg_workspaces_set_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.workspaces IS 'Tenant workspaces — core isolation boundary';

COMMIT;
