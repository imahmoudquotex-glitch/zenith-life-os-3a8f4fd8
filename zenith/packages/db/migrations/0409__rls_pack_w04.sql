-- 0409__rls_pack_w04.sql — Wave W04
BEGIN;
DO $$ DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'oauth_state_tokens','password_reset_tokens','magic_link_tokens',
    'email_verification_tokens','auth_lockouts','webauthn_credentials','onboarding_state'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
COMMIT;
