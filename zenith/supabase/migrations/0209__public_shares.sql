-- File: 0209__public_shares.sql
-- Wave: 03
-- Description: Public sharing tokens for pages and databases (read-only)
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.public_shares (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  resource_type   TEXT NOT NULL CHECK (resource_type IN ('page','database','note','goal')),
  resource_id     TEXT NOT NULL,
  token           TEXT NOT NULL UNIQUE,   -- random 32-byte URL-safe token
  title           TEXT,                   -- optional custom title override
  password_hash   TEXT,                   -- optional password (bcrypt)
  expires_at      TIMESTAMPTZ,
  view_count      INT NOT NULL DEFAULT 0,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      TEXT NOT NULL REFERENCES public.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_public_shares_token ON public.public_shares(token) WHERE is_active;
CREATE INDEX idx_public_shares_resource ON public.public_shares(workspace_id, resource_type, resource_id) WHERE is_active;

ALTER TABLE public.public_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.public_shares FORCE ROW LEVEL SECURITY;
CREATE POLICY public_shares_workspace_isolation ON public.public_shares
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.public_shares TO app_user;
CREATE TRIGGER trg_public_shares_updated_at BEFORE UPDATE ON public.public_shares
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
