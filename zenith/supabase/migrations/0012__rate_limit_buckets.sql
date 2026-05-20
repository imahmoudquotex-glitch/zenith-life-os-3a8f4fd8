-- File: 0012__rate_limit_buckets.sql
-- Wave: 01
-- Description: Rate limit bucket store for debug/fallback (Redis primary)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  user_id       TEXT NOT NULL CHECK (public.is_ulid(user_id)),
  route         TEXT NOT NULL,
  tokens        INT NOT NULL DEFAULT 0,
  max_tokens    INT NOT NULL DEFAULT 100,
  refill_rate   INT NOT NULL DEFAULT 10,
  last_refill   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_rate_limit_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);

-- Composite index for lookups
CREATE INDEX IF NOT EXISTS idx_rate_limit_user_route
  ON public.rate_limit_buckets (user_id, route);

-- RLS
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limit_buckets FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rate_limit_buckets_isolation ON public.rate_limit_buckets;
CREATE POLICY rate_limit_buckets_isolation ON public.rate_limit_buckets
  FOR ALL
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE ON public.rate_limit_buckets TO app_user;

COMMENT ON TABLE public.rate_limit_buckets IS 'Token bucket rate limiter — Postgres fallback when Redis unavailable';

COMMIT;
