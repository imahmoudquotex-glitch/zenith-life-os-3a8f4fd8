-- File: 0200__tasks.sql
-- Wave: 03
-- Description: Tasks workload table with priority, status, and full RLS
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.tasks (
  id                    TEXT PRIMARY KEY,
  workspace_id          TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  page_id               TEXT REFERENCES public.pages(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL,
  description_json      JSONB,
  status                TEXT NOT NULL DEFAULT 'todo'
                          CHECK (status IN ('todo','in_progress','done','cancelled','blocked')),
  priority              TEXT NOT NULL DEFAULT 'medium'
                          CHECK (priority IN ('urgent','high','medium','low','none')),
  due_date              DATE,
  due_datetime          TIMESTAMPTZ,
  start_date            DATE,
  completed_at          TIMESTAMPTZ,
  assignee_user_id      TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  creator_user_id       TEXT NOT NULL REFERENCES public.users(id),
  parent_task_id        TEXT REFERENCES public.tasks(id) ON DELETE SET NULL,
  position              DOUBLE PRECISION NOT NULL DEFAULT 0,
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  version               INT NOT NULL DEFAULT 1,
  CONSTRAINT chk_tasks_title CHECK (length(title) BETWEEN 1 AND 500)
);

CREATE INDEX idx_tasks_workspace ON public.tasks(workspace_id, status) WHERE NOT is_deleted;
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_user_id, workspace_id) WHERE NOT is_deleted;
CREATE INDEX idx_tasks_due ON public.tasks(workspace_id, due_date) WHERE NOT is_deleted AND due_date IS NOT NULL;
CREATE INDEX idx_tasks_parent ON public.tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_page ON public.tasks(page_id) WHERE page_id IS NOT NULL;

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks FORCE ROW LEVEL SECURITY;

CREATE POLICY tasks_workspace_isolation ON public.tasks
  USING (workspace_id = current_setting('app.current_workspace_id', true));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO app_user;

CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
