-- =============================================================================
-- Migration 0050 — Donations (Issue #43)
-- Zenith is 100% donations-funded. No subscriptions. No paywalls.
-- See ADR-0008-donations-only.md
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.donations (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id  TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  donor_user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  amount_cents  NUMERIC(20,4) NOT NULL CHECK (amount_cents > 0),
  currency      TEXT NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  provider      TEXT NOT NULL CHECK (provider IN ('stripe','lemonsqueezy','paypal')),
  provider_ref  TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL CHECK (status IN ('pending','succeeded','failed','refunded')),
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_donations_user ON public.donations(donor_user_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_provider ON public.donations(provider, provider_ref);

CREATE TRIGGER trg_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations FORCE ROW LEVEL SECURITY;

-- Users can see their own donations
CREATE POLICY donations_select ON public.donations
  FOR SELECT
  USING (donor_user_id = public.current_user_id());

-- Only system (SECURITY DEFINER webhook handler) can insert/update
-- No direct INSERT from app_user
REVOKE INSERT, UPDATE, DELETE ON public.donations FROM anon, authenticated;

COMMENT ON TABLE public.donations IS 'Donations-only monetization. No subscriptions. See ADR-0008.';

COMMIT;
