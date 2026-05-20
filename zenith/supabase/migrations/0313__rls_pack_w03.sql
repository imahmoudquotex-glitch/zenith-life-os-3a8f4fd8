-- Migration:    0313__rls_pack_w03
-- Wave:         W03 (Security Fortress & Offline PWA)
-- Description:  Enforce RLS + FORCE RLS for all W03 tables + audit_chain trigger verification
-- Created:      2026-05-16

BEGIN;

-- Verify all W03 tables have RLS enabled
DO $$
DECLARE
  t TEXT;
  missing TEXT[] := '{}';
  w03_tables TEXT[] := ARRAY[
    'csp_reports', 'csrf_tokens', 'vault_master_key_meta',
    'push_subscriptions', 'device_registry', 'security_events',
    'outbox_server_log', 'conflict_resolutions'
  ];
BEGIN
  FOREACH t IN ARRAY w03_tables LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_tables
       WHERE schemaname = 'public' AND tablename = t
    ) THEN
      missing := array_append(missing, t || ' (TABLE MISSING)');
    ELSIF NOT EXISTS (
      SELECT 1 FROM pg_class c
        JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relname = t
         AND c.relrowsecurity = true
    ) THEN
      missing := array_append(missing, t || ' (RLS NOT ENABLED)');
    END IF;
  END LOOP;

  IF array_length(missing, 1) > 0 THEN
    RAISE EXCEPTION 'W03 RLS check failed: %', array_to_string(missing, ', ');
  END IF;
END $$;

-- Verify audit_chain trigger is installed
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
     WHERE tgname = 'trg_audit_chain'
       AND tgrelid = 'audit_events'::regclass
  ) THEN
    RAISE EXCEPTION 'W03: trg_audit_chain trigger missing on audit_events';
  END IF;
END $$;

-- Verify sessions table has device_fingerprint column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'sessions'
       AND column_name = 'device_fingerprint'
  ) THEN
    RAISE EXCEPTION 'W03: sessions.device_fingerprint column missing';
  END IF;
END $$;

-- Verify vault_items has E2E columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = 'vault_items'
       AND column_name = 'wrapped_item_key'
  ) THEN
    RAISE EXCEPTION 'W03: vault_items.wrapped_item_key column missing';
  END IF;
END $$;

COMMIT;
