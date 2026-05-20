-- File: 0202__habits.sql
-- Wave: 03
-- Description: Habits tracking with daily check-ins and streak computation
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.habits (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  description       TEXT,
  frequency         TEXT NOT NULL DEFAULT 'daily'
                      CHECK (frequency IN ('daily','weekly','monthly','custom')),
  frequency_config  JSONB NOT NULL DEFAULT '{}'::jsonb,
  target_count      INT NOT NULL DEFAULT 1,  -- times per frequency period
  color             TEXT,
  icon              TEXT,
  start_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date          DATE,
  is_archived       BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  creator_user_id   TEXT NOT NULL REFERENCES public.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_habits_title CHECK (length(title) BETWEEN 1 AND 200),
  CONSTRAINT chk_habits_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_habits_workspace ON public.habits(workspace_id) WHERE NOT is_deleted AND NOT is_archived;

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits FORCE ROW LEVEL SECURITY;
CREATE POLICY habits_workspace_isolation ON public.habits
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO app_user;
CREATE TRIGGER trg_habits_updated_at BEFORE UPDATE ON public.habits
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Daily check-ins (append-mostly)
CREATE TABLE IF NOT EXISTS public.habit_checkins (
  id            TEXT PRIMARY KEY,
  habit_id      TEXT NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES public.users(id),
  check_date    DATE NOT NULL,
  count         INT NOT NULL DEFAULT 1,
  note          TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, user_id, check_date)
);

CREATE INDEX idx_habit_checkins_habit_date ON public.habit_checkins(habit_id, check_date DESC);
CREATE INDEX idx_habit_checkins_workspace ON public.habit_checkins(workspace_id, check_date DESC);

ALTER TABLE public.habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_checkins FORCE ROW LEVEL SECURITY;
CREATE POLICY habit_checkins_isolation ON public.habit_checkins
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_checkins TO app_user;

COMMIT;
