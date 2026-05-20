-- 0205__habits.sql
-- Wave: W02
-- Purpose: Habits tracking + daily checkins with streak management and RLS isolation

BEGIN;
CREATE TABLE IF NOT EXISTS habits (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  icon_kind       TEXT,
  icon_value      TEXT,
  cadence         TEXT NOT NULL DEFAULT 'daily',
  target_per_period INT NOT NULL DEFAULT 1,
  current_streak  INT NOT NULL DEFAULT 0,
  longest_streak  INT NOT NULL DEFAULT 0,
  is_archived     BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_habits_cadence CHECK (cadence IN ('daily','weekly','monthly','custom'))
);

CREATE INDEX idx_habits_workspace_user ON habits(workspace_id, user_id) WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS habit_checkins (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  habit_id        TEXT NOT NULL REFERENCES habits(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  day_local       DATE NOT NULL,
  count           INT NOT NULL DEFAULT 1,
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, day_local)
);

CREATE INDEX idx_habit_checkins_workspace_day ON habit_checkins(workspace_id, day_local DESC);

CREATE TRIGGER trg_habits_before_update_set_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits FORCE ROW LEVEL SECURITY;
CREATE POLICY habits_isolation ON habits USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON habits TO app_user;

ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins FORCE ROW LEVEL SECURITY;
CREATE POLICY habit_checkins_isolation ON habit_checkins USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON habit_checkins TO app_user;
COMMIT;
