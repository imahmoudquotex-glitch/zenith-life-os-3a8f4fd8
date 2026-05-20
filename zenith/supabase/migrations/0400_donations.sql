-- File: 0015__donations.sql
-- Wave: 01
-- Description: Donations table — optional financial support, no feature gates
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

CREATE TABLE IF NOT EXISTS public.donations (
  id              TEXT PRIMARY KEY CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  user_id         TEXT NOT NULL REFERENCES public.users(id),
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id),
  amount_cents    BIGINT NOT NULL CHECK (amount_cents > 0),
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  provider        TEXT NOT NULL, -- 'stripe', 'paypal', etc.
  provider_tx_id  TEXT,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded')),
  anonymous       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER trg_donations_updated_at
  BEFORE UPDATE ON public.donations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations FORCE ROW LEVEL SECURITY;

CREATE POLICY donations_isolation ON public.donations
  USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE INDEX IF NOT EXISTS idx_donations_user ON public.donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_workspace ON public.donations(workspace_id);

COMMIT;
