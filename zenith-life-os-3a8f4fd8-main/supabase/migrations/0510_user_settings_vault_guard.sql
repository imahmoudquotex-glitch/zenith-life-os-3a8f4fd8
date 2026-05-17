-- =============================================================================
-- Migration 0510 — Settings Vault Guard (Phase 07 — Canonical V2)
-- =============================================================================
-- القواعد:
-- 1. يضمن أن allowVaultContext لا يُفعّل حتى لو Client أرسله
-- 2. يستخدم user_settings الـ canonical من W01 (مش public.profiles)
-- 3. DB trigger = safety net مستقل عن app code
-- =============================================================================

BEGIN;

-- Guard Function
CREATE OR REPLACE FUNCTION public.user_settings_force_vault_off()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.settings IS NOT NULL THEN
    NEW.settings = jsonb_set(
      COALESCE(NEW.settings, '{}'::jsonb),
      '{ai,allowVaultContext}',
      'false'::jsonb,
      true  -- create if not exists
    );
  END IF;
  RETURN NEW;
END $$;

-- Drop old trigger if exists
DROP TRIGGER IF EXISTS trg_user_settings_force_vault_off ON public.user_settings;

-- Create canonical trigger on user_settings (V2 — not public.profiles)
CREATE TRIGGER trg_user_settings_force_vault_off
BEFORE INSERT OR UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.user_settings_force_vault_off();

COMMENT ON TRIGGER trg_user_settings_force_vault_off ON public.user_settings IS
  'V2 Canonical: allowVaultContext مُجبر على false دائماً. workspace_id-scoped via RLS.';

COMMIT;
