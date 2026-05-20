-- File: 0009__idempotency_keys.sql
-- Wave: 01
-- Description: Idempotency key store for safe request retry
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.idempotency_keys (
  key           TEXT NOT NULL,
  workspace_id  TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  request_hash  TEXT NOT NULL,
  response_body JSONB,
  response_code INT,
  locked_at     TIMESTAMPTZ,
  completed_at  TIMESTAMPTZ,
  expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT pk_idempotency_keys PRIMARY KEY (key, workspace_id),
  CONSTRAINT fk_idempotency_keys_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);

-- Auto-cleanup expired keys
CREATE INDEX IF NOT EXISTS idx_idempotency_keys_expires
  ON public.idempotency_keys (expires_at) WHERE completed_at IS NOT NULL;

-- RLS
ALTER TABLE public.idempotency_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idempotency_keys FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS idempotency_keys_isolation ON public.idempotency_keys;
CREATE POLICY idempotency_keys_isolation ON public.idempotency_keys
  FOR ALL
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE ON public.idempotency_keys TO app_user;

COMMENT ON TABLE public.idempotency_keys IS 'Idempotency store — ensures POST/PUT/PATCH/DELETE are safe to retry';

COMMIT;
