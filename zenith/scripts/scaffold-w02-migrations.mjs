import fs from 'node:fs';
import path from 'node:path';

const migrationsDir = path.join(process.cwd(), 'packages', 'db', 'migrations');
if (!fs.existsSync(migrationsDir)) {
  fs.mkdirSync(migrationsDir, { recursive: true });
}

const migrations = {
  '0200__extensions_advanced.sql': `BEGIN;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
COMMIT;`,
  '0201__helpers_local_time.sql': `BEGIN;
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.local_day(p_user TEXT)
RETURNS DATE LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_tz TEXT;
BEGIN
  SELECT COALESCE(timezone, 'UTC') INTO v_tz FROM public.users WHERE id = p_user;
  RETURN (now() AT TIME ZONE v_tz)::DATE;
END $$;

CREATE OR REPLACE FUNCTION public.assert_owner(p_user TEXT)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  IF p_user IS NULL OR p_user <> current_user_id() THEN
    RAISE EXCEPTION 'unauthorized' USING ERRCODE = '42501';
  END IF;
END $$;
COMMIT;`,
  '0203__tasks.sql': `BEGIN;
CREATE TABLE IF NOT EXISTS tasks (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  page_id         TEXT REFERENCES pages(id),
  title           TEXT NOT NULL DEFAULT '',
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'open',
  priority        TEXT NOT NULL DEFAULT 'normal',
  due_at          TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  position_key    TEXT NOT NULL,
  parent_task_id  TEXT REFERENCES tasks(id),
  tags            TEXT[] NOT NULL DEFAULT '{}',
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT chk_tasks_status CHECK (status IN ('open','in_progress','blocked','done','cancelled')),
  CONSTRAINT chk_tasks_priority CHECK (priority IN ('low','normal','high','urgent'))
);
CREATE INDEX idx_tasks_workspace_user ON tasks(workspace_id, user_id) WHERE is_deleted = false;
CREATE INDEX idx_tasks_workspace_status ON tasks(workspace_id, status) WHERE is_deleted = false;
CREATE INDEX idx_tasks_workspace_due ON tasks(workspace_id, due_at) WHERE is_deleted = false AND status != 'done';
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE is_deleted = false;
CREATE INDEX idx_tasks_position ON tasks(workspace_id, position_key) WHERE is_deleted = false;

CREATE TRIGGER trg_tasks_before_update_set_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks FORCE ROW LEVEL SECURITY;
CREATE POLICY tasks_isolation ON tasks
  USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON tasks TO app_user;
COMMIT;`,
  '0204__notes_and_versions.sql': `BEGIN;
CREATE TABLE IF NOT EXISTS notes (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  page_id         TEXT REFERENCES pages(id),
  title           TEXT NOT NULL DEFAULT '',
  content_md      TEXT NOT NULL DEFAULT '',
  search_tsv      tsvector,
  pinned          BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  version         INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX idx_notes_workspace_pinned ON notes(workspace_id, pinned) WHERE is_deleted = false;
CREATE INDEX idx_notes_workspace_updated ON notes(workspace_id, updated_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_notes_search ON notes USING GIN(search_tsv);

CREATE TABLE IF NOT EXISTS note_versions (
  id              TEXT PRIMARY KEY,
  note_id         TEXT NOT NULL REFERENCES notes(id),
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  content_md      TEXT NOT NULL,
  edited_by_user_id TEXT NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_note_versions_note ON note_versions(note_id, created_at DESC);

CREATE TRIGGER trg_notes_before_update_set_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes FORCE ROW LEVEL SECURITY;
CREATE POLICY notes_isolation ON notes USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON notes TO app_user;

ALTER TABLE note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE note_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY note_versions_isolation ON note_versions USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT ON note_versions TO app_user;
COMMIT;`,
  '0205__habits.sql': `BEGIN;
CREATE TABLE IF NOT EXISTS habits (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  name            TEXT NOT NULL,
  icon_kind       TEXT, icon_value TEXT,
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

CREATE TRIGGER trg_habits_before_update_set_updated_at BEFORE UPDATE ON habits FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits FORCE ROW LEVEL SECURITY;
CREATE POLICY habits_isolation ON habits USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON habits TO app_user;

ALTER TABLE habit_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_checkins FORCE ROW LEVEL SECURITY;
CREATE POLICY habit_checkins_isolation ON habit_checkins USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON habit_checkins TO app_user;
COMMIT;`,
  '0206__expenses_and_budgets.sql': `BEGIN;
CREATE TABLE IF NOT EXISTS expenses (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  amount_cents    BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  category        TEXT NOT NULL DEFAULT 'general',
  description     TEXT,
  spent_at        DATE NOT NULL,
  is_recurring    BOOLEAN NOT NULL DEFAULT false,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_expenses_amount_nonneg CHECK (amount_cents >= 0)
);
CREATE INDEX idx_expenses_workspace_spent ON expenses(workspace_id, spent_at DESC) WHERE is_deleted = false;
CREATE INDEX idx_expenses_workspace_category ON expenses(workspace_id, category) WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS budgets (
  id              TEXT PRIMARY KEY,
  workspace_id    TEXT NOT NULL REFERENCES workspaces(id),
  user_id         TEXT NOT NULL REFERENCES users(id),
  category        TEXT NOT NULL,
  monthly_limit_cents BIGINT NOT NULL,
  currency        CHAR(3) NOT NULL DEFAULT 'USD',
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id, category)
);

CREATE TRIGGER trg_expenses_before_update_set_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_budgets_before_update_set_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses FORCE ROW LEVEL SECURITY;
CREATE POLICY expenses_isolation ON expenses USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON expenses TO app_user;

ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets FORCE ROW LEVEL SECURITY;
CREATE POLICY budgets_isolation ON budgets USING (workspace_id = current_workspace_id());
GRANT SELECT, INSERT, UPDATE, DELETE ON budgets TO app_user;
COMMIT;`,
  '0209__ai_usage.sql': `BEGIN;
CREATE TABLE IF NOT EXISTS ai_usage_events (
  id TEXT PRIMARY KEY,
  reservation_id TEXT NOT NULL,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  user_id TEXT NOT NULL REFERENCES users(id),
  idempotency_key TEXT NOT NULL,
  tokens_reserved INT NOT NULL,
  tokens_refunded INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_usage_workspace ON ai_usage_events(workspace_id, created_at);
CREATE UNIQUE INDEX idx_ai_usage_idem ON ai_usage_events(workspace_id, idempotency_key);
ALTER TABLE ai_usage_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_usage_events FORCE ROW LEVEL SECURITY;
CREATE POLICY ai_usage_events_isolation ON ai_usage_events USING (workspace_id = current_workspace_id());
COMMIT;`,
  '0210__ai_rpc.sql': `BEGIN;
CREATE OR REPLACE FUNCTION reserve_ai_usage(
  p_workspace_id TEXT,
  p_user_id TEXT,
  p_idempotency_key TEXT,
  p_estimated_tokens INT
) RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp AS $$
DECLARE v_reservation_id TEXT := generate_ulid();
DECLARE v_used INT;
BEGIN
  PERFORM 1 FROM ai_usage_events
  WHERE workspace_id = p_workspace_id AND idempotency_key = p_idempotency_key
  FOR UPDATE;
  IF FOUND THEN
    SELECT reservation_id INTO v_reservation_id FROM ai_usage_events
    WHERE workspace_id = p_workspace_id AND idempotency_key = p_idempotency_key;
    RETURN v_reservation_id;
  END IF;

  SELECT COALESCE(SUM(tokens_reserved - tokens_refunded), 0)
  INTO v_used
  FROM ai_usage_events
  WHERE workspace_id = p_workspace_id
    AND created_at >= date_trunc('day', now());

  IF v_used + p_estimated_tokens > 1000000 THEN
    RAISE EXCEPTION 'AI_QUOTA_EXCEEDED';
  END IF;

  INSERT INTO ai_usage_events(id, reservation_id, workspace_id, user_id, idempotency_key, tokens_reserved)
  VALUES (generate_ulid(), v_reservation_id, p_workspace_id, p_user_id, p_idempotency_key, p_estimated_tokens);
  RETURN v_reservation_id;
END $$;
COMMIT;`
};

for (const [file, content] of Object.entries(migrations)) {
  fs.writeFileSync(path.join(migrationsDir, file), content);
  console.log('Created migration:', file);
}
