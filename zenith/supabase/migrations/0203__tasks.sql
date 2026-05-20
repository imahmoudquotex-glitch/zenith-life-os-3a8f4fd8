-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0203__tasks.sql
-- Wave:        W02 (0203–0302)
-- Description:  Tasks
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- 0203__tasks.sql
-- Wave: W02
-- Purpose: Tasks table - workspace-scoped task management with full RLS isolation

BEGIN;
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
COMMIT;
