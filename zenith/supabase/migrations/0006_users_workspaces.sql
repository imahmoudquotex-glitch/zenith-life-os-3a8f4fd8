-- File: 0006__users_workspaces.sql
-- Wave: 01
-- Description: Junction table linking users to workspaces with roles
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.users_workspaces (
  user_id       TEXT NOT NULL CHECK (public.is_ulid(user_id)),
  workspace_id  TEXT NOT NULL CHECK (public.is_ulid(workspace_id)),
  role          TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,

  CONSTRAINT pk_users_workspaces PRIMARY KEY (user_id, workspace_id),
  CONSTRAINT fk_users_workspaces_user FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT fk_users_workspaces_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_workspaces_workspace
  ON public.users_workspaces (workspace_id) WHERE NOT is_deleted;

CREATE INDEX IF NOT EXISTS idx_users_workspaces_user_active
  ON public.users_workspaces (user_id) WHERE NOT is_deleted;

COMMENT ON TABLE public.users_workspaces IS 'Many-to-many: users ↔ workspaces with role-based access';

COMMIT;
