-- File: 0016__webhook_nonces_baseline.sql
-- Wave: 01
-- Description: Webhook nonce dedup — service-role only
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

CREATE TABLE IF NOT EXISTS public.webhook_nonces (
  source      TEXT NOT NULL,
  nonce       TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (source, nonce)
);

-- Service-role only — no RLS needed (system table)
REVOKE ALL ON public.webhook_nonces FROM public;
GRANT SELECT, INSERT ON public.webhook_nonces TO service_role;

COMMIT;
