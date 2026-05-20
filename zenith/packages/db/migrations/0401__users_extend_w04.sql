-- 0401__users_extend_w04.sql — Wave W04
BEGIN;
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS display_name_set_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'ar',
  ADD COLUMN IF NOT EXISTS timezone TEXT NOT NULL DEFAULT 'Africa/Cairo',
  ADD COLUMN IF NOT EXISTS theme_preference TEXT NOT NULL DEFAULT 'dark',
  ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD CONSTRAINT chk_locale CHECK (locale IN ('ar','en'));
ALTER TABLE users ADD CONSTRAINT chk_theme CHECK (theme_preference IN ('dark','system'));
COMMIT;
