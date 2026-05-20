-- 0201__helpers_local_time.sql
-- Wave: W02
-- Purpose: Helper functions for timezone-aware date operations, updated_at triggers, and authorization

BEGIN;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.local_day(p_user TEXT)
RETURNS DATE LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_tz TEXT;
BEGIN
  SELECT COALESCE(timezone, 'UTC') INTO v_tz FROM public.users WHERE id = p_user;
  RETURN (now() AT TIME ZONE v_tz)::DATE;
END $$;

CREATE OR REPLACE FUNCTION public.assert_owner(p_user TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_user IS NULL OR p_user <> current_user_id() THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;
END $$;
COMMIT;
