-- Migration 0012: Users-Workspaces membership (M:N)
-- Reviewer issue #14: standardized name users_workspaces (not workspace_members)
BEGIN;

CREATE TABLE public.users_workspaces (
  user_id      TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  role         TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'invited')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workspace_id)
);

ALTER TABLE public.users_workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_workspaces FORCE ROW LEVEL SECURITY;

CREATE INDEX idx_uw_workspace ON public.users_workspaces(workspace_id);
CREATE INDEX idx_uw_user ON public.users_workspaces(user_id);

CREATE TRIGGER trg_users_workspaces_set_updated_at
  BEFORE UPDATE ON public.users_workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.users_workspaces IS 'Workspace membership (M:N). Name is users_workspaces, NOT workspace_members.';

COMMIT;
