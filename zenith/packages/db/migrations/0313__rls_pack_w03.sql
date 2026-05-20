-- 0313__rls_pack_w03.sql
-- Wave: W03 — RLS enforcement sweep
BEGIN;
-- verify all W03 tables have RLS enabled
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'csp_reports','csrf_tokens','push_subscriptions','device_registry',
    'security_events','outbox_server_log','conflict_resolutions',
    'vault_master_key_meta'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
COMMIT;
