-- File: 0011__feature_flags.sql
-- Wave: 01
-- Description: Feature flags with rollout percentages
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.feature_flags (
  id          TEXT PRIMARY KEY,
  description TEXT,
  enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  rollout_pct INT NOT NULL DEFAULT 0 CHECK (rollout_pct >= 0 AND rollout_pct <= 100),
  allow_list  JSONB DEFAULT '[]',
  deny_list   JSONB DEFAULT '[]',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_feature_flags_update_set_updated_at ON public.feature_flags;
CREATE TRIGGER trg_feature_flags_update_set_updated_at
  BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: service-role only — flags are global, not per-workspace
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags FORCE ROW LEVEL SECURITY;

-- Read-only for app_user (flags are managed by service role)
DROP POLICY IF EXISTS feature_flags_read_all ON public.feature_flags;
CREATE POLICY feature_flags_read_all ON public.feature_flags
  FOR SELECT
  USING (TRUE);

GRANT SELECT ON public.feature_flags TO app_user;

-- Seed initial flags
INSERT INTO public.feature_flags (id, description, enabled) VALUES
  ('ai.v2', 'AI v2 with multi-provider support', FALSE),
  ('vault.sharing', 'Vault item sharing between users', FALSE),
  ('donations.optional', 'Show donation prompt', FALSE),
  ('experimental.formulas', 'Spreadsheet-like formulas in blocks', FALSE)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE public.feature_flags IS 'Global feature flags — read by all, managed by service role';

COMMIT;
