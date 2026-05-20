-- File: 0100__users_sync_with_auth.sql
-- Wave: 02
-- Description: Trigger to sync auth.users → public.users on signup
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

-- ─── Sync function ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_ulid TEXT;
  personal_ws_id TEXT;
  ws_slug CITEXT;
BEGIN
  -- Generate ULID for the new user
  new_ulid := gen_random_ulid();

  -- Insert into public.users
  INSERT INTO public.users (id, email, email_verified, display_name, locale, created_at, updated_at)
  VALUES (
    new_ulid,
    NEW.email,
    COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'locale', 'ar'),
    NOW(),
    NOW()
  );

  -- Create personal workspace
  personal_ws_id := gen_random_ulid();
  ws_slug := LOWER(REPLACE(split_part(NEW.email, '@', 1), '.', '-'));

  -- Ensure slug uniqueness by appending suffix if needed
  IF EXISTS (SELECT 1 FROM public.workspaces WHERE slug = ws_slug) THEN
    ws_slug := ws_slug || '-' || SUBSTRING(personal_ws_id FROM 1 FOR 6);
  END IF;

  INSERT INTO public.workspaces (id, slug, name, owner_user_id, plan, created_at, updated_at)
  VALUES (
    personal_ws_id,
    ws_slug,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)) || '''s Workspace',
    new_ulid,
    'free',
    NOW(),
    NOW()
  );

  -- Make user owner of personal workspace
  INSERT INTO public.users_workspaces (user_id, workspace_id, role, joined_at)
  VALUES (new_ulid, personal_ws_id, 'owner', NOW());

  -- Set default workspace
  UPDATE public.users SET default_workspace_id = personal_ws_id WHERE id = new_ulid;

  RETURN NEW;
END;
$$;

-- ─── Trigger on auth.users ────────────────────────────────
DROP TRIGGER IF EXISTS trg_auth_users_after_insert_create_profile ON auth.users;
CREATE TRIGGER trg_auth_users_after_insert_create_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ─── ULID generator (if not exists) ──────────────────────
CREATE OR REPLACE FUNCTION public.gen_random_ulid()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  timestamp_ms BIGINT;
  encoded TEXT := '';
  crockford CHAR(32)[] := ARRAY[
    '0','1','2','3','4','5','6','7','8','9',
    'A','B','C','D','E','F','G','H','J','K',
    'M','N','P','Q','R','S','T','V','W','X','Y','Z'
  ];
  i INT;
  rand_bytes BYTEA;
BEGIN
  timestamp_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;

  -- Encode timestamp (10 chars)
  FOR i IN REVERSE 9..0 LOOP
    encoded := encoded || crockford[(timestamp_ms % 32) + 1];
    timestamp_ms := timestamp_ms / 32;
  END LOOP;
  -- Reverse timestamp portion
  encoded := REVERSE(encoded);

  -- Encode randomness (16 chars)
  rand_bytes := gen_random_bytes(10);
  FOR i IN 0..9 LOOP
    encoded := encoded || crockford[(get_byte(rand_bytes, i) % 32) + 1];
  END LOOP;

  -- Pad to 26 chars
  WHILE LENGTH(encoded) < 26 LOOP
    encoded := encoded || crockford[(floor(random() * 32)::INT) + 1];
  END LOOP;

  RETURN SUBSTRING(encoded FROM 1 FOR 26);
END;
$$;

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Syncs auth.users inserts to public.users + creates personal workspace';

COMMIT;
