-- Migration 0014: Audit base table
BEGIN;

CREATE TABLE public.audit_events (
  id            TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id  TEXT REFERENCES public.workspaces(id) ON DELETE SET NULL,
  user_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,
  entity_type   TEXT NOT NULL,
  entity_id     TEXT,
  before_state  JSONB,
  after_state   JSONB,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_events FORCE ROW LEVEL SECURITY;

-- Only system context can write audit events
CREATE POLICY audit_system_write ON public.audit_events
  FOR INSERT
  WITH CHECK (public.is_system_context());

-- Users can read their own workspace audit events
CREATE POLICY audit_workspace_read ON public.audit_events
  FOR SELECT
  USING (
    workspace_id = public.current_workspace_id()
    AND public.is_workspace_member(workspace_id)
  );

CREATE INDEX idx_audit_workspace ON public.audit_events(workspace_id, created_at DESC);
CREATE INDEX idx_audit_entity ON public.audit_events(entity_type, entity_id);

COMMENT ON TABLE public.audit_events IS 'Immutable audit log for all mutations';

COMMIT;
