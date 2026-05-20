-- File: 0020__tenant_exports.sql
-- Wave: 01
-- Description: Tenant data export bundles (encrypted)
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

CREATE TABLE IF NOT EXISTS public.tenant_exports (
  id                    TEXT PRIMARY KEY CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  workspace_id          TEXT NOT NULL REFERENCES public.workspaces(id),
  requested_by          TEXT NOT NULL REFERENCES public.users(id),
  status                TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed','expired')),
  manifest_url          TEXT,
  encrypted_bundle_url  TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at          TIMESTAMPTZ,
  expires_at            TIMESTAMPTZ
);

ALTER TABLE public.tenant_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_exports FORCE ROW LEVEL SECURITY;

CREATE POLICY tenant_exports_isolation ON public.tenant_exports
  USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE INDEX IF NOT EXISTS idx_tenant_exports_workspace ON public.tenant_exports(workspace_id);

COMMIT;
