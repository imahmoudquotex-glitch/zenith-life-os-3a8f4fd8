-- File: 0107__outbound_emails_queue.sql
-- Wave: 02
-- Description: Outbound email queue (stub — actual sender in Wave 12)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.outbound_emails (
  id              TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id    TEXT,
  to_email        CITEXT NOT NULL,
  template        TEXT NOT NULL,
  payload_json    JSONB NOT NULL DEFAULT '{}'::JSONB,
  status          TEXT NOT NULL DEFAULT 'pending',
  attempts        INT NOT NULL DEFAULT 0,
  last_error      TEXT,
  scheduled_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_outbound_emails_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT chk_outbound_emails_status CHECK (status IN ('pending', 'sending', 'sent', 'failed', 'dead')),
  CONSTRAINT chk_outbound_emails_template CHECK (template IN (
    'workspace_invitation',
    'workspace_member_joined',
    'workspace_ownership_transferred'
  ))
);

CREATE INDEX IF NOT EXISTS idx_outbound_emails_scheduled
  ON public.outbound_emails (status, scheduled_at)
  WHERE status IN ('pending', 'sending');

DROP TRIGGER IF EXISTS trg_outbound_emails_update_set_updated_at ON public.outbound_emails;
CREATE TRIGGER trg_outbound_emails_update_set_updated_at
  BEFORE UPDATE ON public.outbound_emails
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE public.outbound_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outbound_emails FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS outbound_emails_isolation ON public.outbound_emails;
CREATE POLICY outbound_emails_isolation ON public.outbound_emails
  USING (workspace_id IS NULL OR workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE ON public.outbound_emails TO app_user;

COMMENT ON TABLE public.outbound_emails IS 'Outbound email queue — stub for Wave 02, actual Resend sender in Wave 12';

COMMIT;
