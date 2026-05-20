-- File: 0206__goals_xp.sql
-- Wave: 03
-- Description: Goals system and XP/gamification events
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id                TEXT PRIMARY KEY,
  workspace_id      TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  page_id           TEXT REFERENCES public.pages(id) ON DELETE SET NULL,
  title             TEXT NOT NULL,
  description       TEXT,
  status            TEXT NOT NULL DEFAULT 'active'
                      CHECK (status IN ('active','completed','abandoned','paused')),
  category          TEXT,
  target_date       DATE,
  completed_at      TIMESTAMPTZ,
  progress_pct      INT NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  parent_goal_id    TEXT REFERENCES public.goals(id) ON DELETE SET NULL,
  creator_user_id   TEXT NOT NULL REFERENCES public.users(id),
  is_deleted        BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_goals_title CHECK (length(title) BETWEEN 1 AND 300)
);

CREATE INDEX idx_goals_workspace ON public.goals(workspace_id, status) WHERE NOT is_deleted;

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals FORCE ROW LEVEL SECURITY;
CREATE POLICY goals_workspace_isolation ON public.goals
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO app_user;
CREATE TRIGGER trg_goals_updated_at BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- XP events (append-only gamification log)
CREATE TABLE IF NOT EXISTS public.xp_events (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       TEXT NOT NULL REFERENCES public.users(id),
  action        TEXT NOT NULL,         -- e.g. 'task.completed', 'habit.checked', 'goal.achieved'
  xp_amount     INT NOT NULL DEFAULT 0 CHECK (xp_amount >= 0),
  resource_type TEXT,
  resource_id   TEXT,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_xp_events_user ON public.xp_events(user_id, created_at DESC);
CREATE INDEX idx_xp_events_workspace ON public.xp_events(workspace_id, created_at DESC);

ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events FORCE ROW LEVEL SECURITY;
CREATE POLICY xp_events_workspace_isolation ON public.xp_events
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT ON public.xp_events TO app_user;

-- Daily review snapshots
CREATE TABLE IF NOT EXISTS public.daily_reviews (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id         TEXT NOT NULL REFERENCES public.users(id),
  review_date     DATE NOT NULL,
  mood_score      INT CHECK (mood_score BETWEEN 1 AND 10),
  energy_score    INT CHECK (energy_score BETWEEN 1 AND 10),
  highlights      TEXT,
  challenges      TEXT,
  tomorrow_focus  TEXT,
  habits_done     INT NOT NULL DEFAULT 0,
  tasks_done      INT NOT NULL DEFAULT 0,
  xp_earned       INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id, review_date)
);

CREATE INDEX idx_daily_reviews_user ON public.daily_reviews(user_id, review_date DESC);

ALTER TABLE public.daily_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reviews FORCE ROW LEVEL SECURITY;
CREATE POLICY daily_reviews_workspace_isolation ON public.daily_reviews
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE ON public.daily_reviews TO app_user;
CREATE TRIGGER trg_daily_reviews_updated_at BEFORE UPDATE ON public.daily_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
