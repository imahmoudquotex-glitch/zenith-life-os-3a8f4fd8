-- File: 0013__push_subscriptions.sql
-- Wave: 01
-- Description: Web Push VAPID subscriptions (endpoint-based, not tokens)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  user_id       TEXT NOT NULL CHECK (public.is_ulid(user_id)),
  workspace_id  TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  endpoint      TEXT NOT NULL,
  p256dh        TEXT NOT NULL,
  auth          TEXT NOT NULL,
  user_agent    TEXT,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_push_subscriptions_endpoint UNIQUE (endpoint),
  CONSTRAINT fk_push_subscriptions_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_push_subscriptions_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_active
  ON public.push_subscriptions (user_id) WHERE is_active;

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_push_subscriptions_update_set_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_push_subscriptions_update_set_updated_at
  BEFORE UPDATE ON public.push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RLS: user can only manage their own subscriptions
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.push_subscriptions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS push_subscriptions_isolation ON public.push_subscriptions;
CREATE POLICY push_subscriptions_isolation ON public.push_subscriptions
  FOR ALL
  USING (user_id = public.current_user_id())
  WITH CHECK (user_id = public.current_user_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.push_subscriptions TO app_user;

COMMENT ON TABLE public.push_subscriptions IS 'Web Push VAPID subscriptions — endpoint-based, user-scoped';

COMMIT;
