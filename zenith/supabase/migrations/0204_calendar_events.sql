-- File: 0204__calendar_events.sql
-- Wave: 03
-- Description: Calendar events with recurrence rules and attendees
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id                  TEXT PRIMARY KEY,
  workspace_id        TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  page_id             TEXT REFERENCES public.pages(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  description_json    JSONB,
  start_at            TIMESTAMPTZ NOT NULL,
  end_at              TIMESTAMPTZ NOT NULL,
  is_all_day          BOOLEAN NOT NULL DEFAULT FALSE,
  timezone            TEXT NOT NULL DEFAULT 'UTC',
  location            TEXT,
  url                 TEXT,
  color               TEXT,
  recurrence_rule     TEXT,               -- RFC 5545 RRULE string
  recurrence_end_at   TIMESTAMPTZ,
  parent_event_id     TEXT REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  creator_user_id     TEXT NOT NULL REFERENCES public.users(id),
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_calendar_events_title CHECK (length(title) BETWEEN 1 AND 500),
  CONSTRAINT chk_calendar_events_end_after_start CHECK (end_at >= start_at)
);

CREATE INDEX idx_calendar_events_workspace ON public.calendar_events(workspace_id, start_at) WHERE NOT is_deleted;
CREATE INDEX idx_calendar_events_range ON public.calendar_events(workspace_id, start_at, end_at) WHERE NOT is_deleted;

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events FORCE ROW LEVEL SECURITY;
CREATE POLICY calendar_events_workspace_isolation ON public.calendar_events
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO app_user;
CREATE TRIGGER trg_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Event attendees
CREATE TABLE IF NOT EXISTS public.calendar_event_attendees (
  id            TEXT PRIMARY KEY,
  event_id      TEXT NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  email         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','declined','tentative')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_attendee_has_identity CHECK (user_id IS NOT NULL OR email IS NOT NULL)
);

CREATE INDEX idx_calendar_attendees_event ON public.calendar_event_attendees(event_id);
CREATE INDEX idx_calendar_attendees_user ON public.calendar_event_attendees(user_id) WHERE user_id IS NOT NULL;

ALTER TABLE public.calendar_event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_event_attendees FORCE ROW LEVEL SECURITY;
CREATE POLICY calendar_attendees_isolation ON public.calendar_event_attendees
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_event_attendees TO app_user;

COMMIT;
