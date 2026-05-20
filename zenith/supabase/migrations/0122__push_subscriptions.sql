-- File: 0122__push_subscriptions.sql
-- Wave: 03
-- Description: Web Push VAPID subscriptions with endpoint hashing
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id                 TEXT PRIMARY KEY,
  user_id            TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id       TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  -- endpoint_hash for deduplication (never store raw endpoint)
  endpoint_hash      TEXT NOT NULL,
  -- endpoint_encrypted: XChaCha20-encrypted raw endpoint (Phase 22: vault wraps this)
  endpoint_encrypted TEXT NOT NULL,
  p256dh             TEXT NOT NULL,   -- client public key (base64url)
  auth_secret        TEXT NOT NULL,   -- VAPID auth secret (base64url)
  user_agent         TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at       TIMESTAMPTZ,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (user_id, endpoint_hash)
);

CREATE INDEX idx_push_subs_user
  ON public.push_subscriptions(user_id)
  WHERE is_active = true;

CREATE INDEX idx_push_subs_workspace
  ON public.push_subscriptions(workspace_id)
  WHERE is_active = true;

-- RLS: users can only manage their own subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions FORCE ROW LEVEL SECURITY;

CREATE POLICY push_subs_own_rows ON public.push_subscriptions
  USING (user_id = auth.uid()::text);

-- Service role: full access for sending notifications
CREATE POLICY push_subs_service ON public.push_subscriptions
  AS PERMISSIVE FOR ALL
  USING (current_setting('role', true) = 'service_role');

COMMENT ON TABLE public.push_subscriptions IS
  'Web Push VAPID subscriptions. Endpoint hashed for dedup, encrypted for storage.';

COMMIT;
