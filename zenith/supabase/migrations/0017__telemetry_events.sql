-- File: 0017__telemetry_events.sql
-- Wave: 01
-- Description: Client telemetry buffer — NO PII
-- Author: Zenith
-- Created: 2026-05-16
-- Idempotent: YES
-- Rollback: forward-fix only

BEGIN;

CREATE TABLE IF NOT EXISTS public.telemetry_events (
  id            TEXT PRIMARY KEY CHECK (id ~ '^[0-9A-HJKMNP-TV-Z]{26}$'),
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id),
  event_name    TEXT NOT NULL,
  event_data    JSONB NOT NULL DEFAULT '{}',
  session_id    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telemetry_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.telemetry_events FORCE ROW LEVEL SECURITY;

CREATE POLICY telemetry_isolation ON public.telemetry_events
  USING (workspace_id = current_setting('app.current_workspace_id', true));

CREATE INDEX IF NOT EXISTS idx_telemetry_workspace ON public.telemetry_events(workspace_id);
CREATE INDEX IF NOT EXISTS idx_telemetry_name ON public.telemetry_events(event_name);

COMMIT;
