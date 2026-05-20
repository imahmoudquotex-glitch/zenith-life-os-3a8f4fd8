-- File: 0019__compliance_consents.sql
-- Wave: 01
-- Description: GDPR/CCPA/PDPL consent tracking
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

CREATE TABLE IF NOT EXISTS public.compliance_consents (
  id              TEXT PRIMARY KEY CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  user_id         TEXT NOT NULL REFERENCES public.users(id),
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id),
  consent_kind    TEXT NOT NULL, -- 'analytics', 'ai_processing', 'marketing', 'data_export'
  version         INT NOT NULL DEFAULT 1,
  granted_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at    TIMESTAMPTZ,
  UNIQUE (user_id, workspace_id, consent_kind)
);

ALTER TABLE public.compliance_consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_consents FORCE ROW LEVEL SECURITY;

CREATE POLICY consents_isolation ON public.compliance_consents
  USING (workspace_id = current_setting('app.current_workspace_id', true));

COMMIT;
