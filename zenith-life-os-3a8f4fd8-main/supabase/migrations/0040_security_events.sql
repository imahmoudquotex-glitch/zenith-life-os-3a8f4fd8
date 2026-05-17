-- Migration 0040: Security events
BEGIN;

CREATE TABLE public.auth_events (
  id          TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  user_id     TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  email       TEXT,
  action      TEXT NOT NULL CHECK (action IN (
    'signin_attempt', 'signin_success', 'signin_failure',
    'signup_attempt', 'signup_success',
    'signout',
    'password_reset_request', 'password_reset_success',
    'mfa_enroll', 'mfa_verify',
    'session_refresh', 'session_rotate',
    'account_locked', 'account_unlocked',
    'oauth_attempt', 'oauth_success', 'oauth_failure'
  )),
  ip_address  INET,
  user_agent  TEXT,
  metadata    JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.auth_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auth_events FORCE ROW LEVEL SECURITY;

-- Only system writes auth events
CREATE POLICY auth_events_system_write ON public.auth_events
  FOR INSERT
  WITH CHECK (public.is_system_context());

-- Users can read own events
CREATE POLICY auth_events_self_read ON public.auth_events
  FOR SELECT
  USING (user_id = public.current_user_id());

CREATE INDEX idx_auth_events_user ON public.auth_events(user_id, created_at DESC);
CREATE INDEX idx_auth_events_email ON public.auth_events(email, action, created_at DESC);

COMMENT ON TABLE public.auth_events IS 'Authentication event log for security audit';

COMMIT;
