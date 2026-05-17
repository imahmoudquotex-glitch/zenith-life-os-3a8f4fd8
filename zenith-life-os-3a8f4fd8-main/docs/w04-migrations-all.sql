-- ============================================================
-- ZENITH LIFE OS — W04 MIGRATIONS (0400-0409)
-- انسخ كل هذا الكود وشغّله في Supabase SQL Editor دفعة واحدة
-- ============================================================

-- 0400: oauth_state_tokens — TTL 10 دقائق
CREATE TABLE IF NOT EXISTS public.oauth_state_tokens (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state        TEXT NOT NULL UNIQUE,
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider     TEXT NOT NULL,
  redirect_to  TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at   TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '10 minutes',
  used_at      TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_oauth_state ON public.oauth_state_tokens(state);
ALTER TABLE public.oauth_state_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oauth_state_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_oauth_state" ON public.oauth_state_tokens;
CREATE POLICY "deny_select_oauth_state" ON public.oauth_state_tokens FOR SELECT USING (false);

-- 0401: users extend w04
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url              TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS display_name_set_at     TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS locale                  TEXT DEFAULT 'ar';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS theme_preference        TEXT DEFAULT 'dark';

-- 0402: password_reset_tokens — TTL 60 دقيقة، استخدام واحد
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '60 minutes',
  used_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_prt_hash ON public.password_reset_tokens(token_hash);
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.password_reset_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_prt" ON public.password_reset_tokens;
CREATE POLICY "deny_select_prt" ON public.password_reset_tokens FOR SELECT USING (false);

-- 0403: magic_link_tokens — TTL 15 دقيقة
CREATE TABLE IF NOT EXISTS public.magic_link_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '15 minutes',
  used_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_mlt_hash ON public.magic_link_tokens(token_hash);
ALTER TABLE public.magic_link_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.magic_link_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_mlt" ON public.magic_link_tokens;
CREATE POLICY "deny_select_mlt" ON public.magic_link_tokens FOR SELECT USING (false);

-- 0404: email_verification_tokens — TTL 24 ساعة
CREATE TABLE IF NOT EXISTS public.email_verification_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  email       TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '24 hours',
  used_at     TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_evt_hash ON public.email_verification_tokens(token_hash);
ALTER TABLE public.email_verification_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_verification_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_evt" ON public.email_verification_tokens;
CREATE POLICY "deny_select_evt" ON public.email_verification_tokens FOR SELECT USING (false);

-- 0405: auth_lockouts — حظر بعد 5 محاولات فاشلة
CREATE TABLE IF NOT EXISTS public.auth_lockouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier      TEXT NOT NULL UNIQUE,
  attempt_count   INT NOT NULL DEFAULT 1,
  locked_until    TIMESTAMPTZ,
  last_attempt_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lockouts_id ON public.auth_lockouts(identifier);
ALTER TABLE public.auth_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_lockouts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_lockouts" ON public.auth_lockouts;
CREATE POLICY "deny_select_lockouts" ON public.auth_lockouts FOR SELECT USING (false);

-- 0406: webauthn_credentials (Passkeys scaffold)
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT NOT NULL UNIQUE,
  public_key    BYTEA NOT NULL,
  sign_count    INT NOT NULL DEFAULT 0,
  transports    TEXT[],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at  TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_webauthn_uid ON public.webauthn_credentials(user_id);
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "webauthn_self" ON public.webauthn_credentials;
CREATE POLICY "webauthn_self" ON public.webauthn_credentials FOR ALL USING (user_id = auth.uid());

-- 0407: onboarding_state — حفظ خطوات الـ wizard
CREATE TABLE IF NOT EXISTS public.onboarding_state (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  step         TEXT NOT NULL DEFAULT 'locale',
  payload      JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.onboarding_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_state FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "onboarding_self" ON public.onboarding_state;
CREATE POLICY "onboarding_self" ON public.onboarding_state FOR ALL USING (user_id = auth.uid());

-- 0408: captcha_attempts — تتبع محاولات الـ captcha
CREATE TABLE IF NOT EXISTS public.captcha_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address INET,
  token_hash TEXT,
  verified   BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_captcha_ip ON public.captcha_attempts(ip_address, created_at);
ALTER TABLE public.captcha_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.captcha_attempts FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "deny_select_captcha" ON public.captcha_attempts;
CREATE POLICY "deny_select_captcha" ON public.captcha_attempts FOR SELECT USING (false);

-- تأكيد
SELECT 'W04 migrations 0400-0408 applied successfully ✅' AS status;
