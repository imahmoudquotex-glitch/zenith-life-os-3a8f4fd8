-- Migration 0030: API idempotency
BEGIN;

CREATE TABLE public.api_idempotency (
  idempotency_key TEXT NOT NULL,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES public.users(id),
  method          TEXT NOT NULL,
  path            TEXT NOT NULL,
  status_code     INTEGER NOT NULL,
  response_body   JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours'),
  PRIMARY KEY (workspace_id, idempotency_key)
);

ALTER TABLE public.api_idempotency ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_idempotency FORCE ROW LEVEL SECURITY;

-- Only system context manages idempotency records
CREATE POLICY idem_system ON public.api_idempotency
  FOR ALL
  USING (public.is_system_context())
  WITH CHECK (public.is_system_context());

CREATE INDEX idx_idem_expires ON public.api_idempotency(expires_at);

COMMENT ON TABLE public.api_idempotency IS 'Prevents duplicate mutation processing (24h TTL)';

COMMIT;
