-- Migration 0015: helper functions for system context + current user
-- Required by vault_items, formula_cache, recalc_jobs
BEGIN;

-- Returns current user_id from JWT claims
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS TEXT LANGUAGE sql STABLE
SET search_path = public, pg_temp AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'user_id',
    current_setting('app.current_user_id', true),
    auth.uid()::text
  );
$$;

-- Returns true if current context is system/service-role
CREATE OR REPLACE FUNCTION public.is_system_context()
RETURNS BOOLEAN LANGUAGE sql STABLE
SET search_path = public, pg_temp AS $$
  SELECT COALESCE(
    current_setting('app.is_system', true)::boolean,
    (current_setting('request.jwt.claims', true)::jsonb->>'role') = 'service_role',
    false
  );
$$;

COMMENT ON FUNCTION public.current_user_id IS 'Returns authenticated user ID from JWT or session config';
COMMENT ON FUNCTION public.is_system_context IS 'Returns true if running under service_role or explicit system context';

COMMIT;
