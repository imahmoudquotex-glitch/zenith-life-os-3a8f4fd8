-- Migration 0050: Donations table
-- Reviewer issue #43: The project is donations-only forever.
-- No billing, no subscriptions, no paywall, no feature gating.
BEGIN;

CREATE TABLE public.donations (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id  TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  donor_user_id TEXT REFERENCES public.users(id),
  amount_cents  NUMERIC(20, 4) NOT NULL CHECK (amount_cents > 0),
  currency      TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  provider      TEXT NOT NULL CHECK (provider IN ('stripe', 'lemonsqueezy', 'paypal')),
  provider_ref  TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations FORCE ROW LEVEL SECURITY;

-- System writes donations (webhook)
CREATE POLICY donations_system_write ON public.donations
  FOR INSERT
  WITH CHECK (public.is_system_context());

CREATE POLICY donations_system_update ON public.donations
  FOR UPDATE
  USING (public.is_system_context())
  WITH CHECK (public.is_system_context());

-- Donors can read their own donations
CREATE POLICY donations_self_read ON public.donations
  FOR SELECT
  USING (donor_user_id = public.current_user_id());

CREATE INDEX idx_donations_user ON public.donations(donor_user_id);
CREATE INDEX idx_donations_provider ON public.donations(provider, provider_ref);

CREATE TRIGGER trg_donations_set_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.donations IS 'Donation records. NO subscriptions, NO billing, NO paywalls.';

COMMIT;
