-- File: 0008__audit_events.sql
-- Wave: 01
-- Description: Append-only audit log — immutable by design
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.audit_events (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id  TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  actor_id      TEXT NOT NULL,
  actor_type    TEXT NOT NULL CHECK (actor_type IN ('user', 'system', 'api_key', 'webhook')),
  action        TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id   TEXT,
  metadata_json JSONB DEFAULT '{}',
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_audit_events_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);

-- Immutability: prevent UPDATE and DELETE
CREATE OR REPLACE FUNCTION public.audit_events_immutable()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE_RECORD: audit_events cannot be modified or deleted';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_events_immutable_update ON public.audit_events;
CREATE TRIGGER trg_audit_events_immutable_update
  BEFORE UPDATE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_events_immutable();

DROP TRIGGER IF EXISTS trg_audit_events_immutable_delete ON public.audit_events;
CREATE TRIGGER trg_audit_events_immutable_delete
  BEFORE DELETE ON public.audit_events
  FOR EACH ROW EXECUTE FUNCTION public.audit_events_immutable();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_events_workspace_created
  ON public.audit_events (workspace_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_actor
  ON public.audit_events (actor_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_events_resource
  ON public.audit_events (resource_type, resource_id);

-- RLS
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_events_isolation ON public.audit_events;
CREATE POLICY audit_events_isolation ON public.audit_events
  FOR ALL
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT ON public.audit_events TO app_user;

COMMENT ON TABLE public.audit_events IS 'Append-only audit trail — immutable, no UPDATE/DELETE allowed';

COMMIT;
