-- Migration 0003: Common timestamp functions
-- Shared by all tables that need updated_at auto-update
BEGIN;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'Auto-sets updated_at on UPDATE';

COMMIT;
