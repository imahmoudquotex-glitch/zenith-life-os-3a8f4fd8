-- File: 0003__updated_at_trigger.sql
-- Wave: 01
-- Description: Reusable trigger function to auto-set updated_at
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'Trigger function: sets updated_at to NOW() on every UPDATE';

COMMIT;
