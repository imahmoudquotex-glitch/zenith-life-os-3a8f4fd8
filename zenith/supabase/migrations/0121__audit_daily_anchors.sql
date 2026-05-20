-- File: 0121__audit_daily_anchors.sql
-- Wave: 03
-- Description: Daily Merkle anchors for tamper-evident audit chain
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.audit_daily_anchors (
  id             TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  workspace_id   TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  day            DATE NOT NULL,
  merkle_root    BYTEA NOT NULL,     -- 32-byte SHA-256 root
  event_count    INT NOT NULL DEFAULT 0,
  first_event_id TEXT,
  last_event_id  TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, day)
);

CREATE INDEX idx_audit_anchors_workspace_day
  ON public.audit_daily_anchors(workspace_id, day DESC);

-- RLS: workspace isolation
ALTER TABLE public.audit_daily_anchors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_daily_anchors FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_anchors_workspace ON public.audit_daily_anchors
  USING (workspace_id = current_setting('app.current_workspace_id', true));

-- Service role bypass for nightly anchor computation
CREATE POLICY audit_anchors_service ON public.audit_daily_anchors
  AS PERMISSIVE FOR ALL
  USING (current_setting('role', true) = 'service_role');

COMMENT ON TABLE public.audit_daily_anchors IS
  'Daily Merkle roots for tamper-evident audit chain. SHA-256 over ordered (id, prev_hash, row_hash).';

COMMIT;
