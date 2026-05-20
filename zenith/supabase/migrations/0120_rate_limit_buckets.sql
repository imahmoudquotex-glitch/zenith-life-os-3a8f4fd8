-- File: 0120__rate_limit_buckets.sql
-- Wave: 03
-- Description: Rate limit buckets for DB-backed sliding-window enforcement
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key          TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INT NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

-- RLS: service role only (no user-level access)
ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;
CREATE POLICY rl_service_only ON public.rate_limit_buckets
  USING (current_setting('role', true) = 'service_role');

-- Cleanup function: removes expired buckets older than 2 hours
CREATE OR REPLACE FUNCTION public.cleanup_rate_limit_buckets()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE window_start < now() - interval '2 hours';
END $$;

COMMENT ON TABLE public.rate_limit_buckets IS
  'Sliding-window rate limit buckets. Supplemental to in-memory store. Cleared hourly.';

COMMIT;
