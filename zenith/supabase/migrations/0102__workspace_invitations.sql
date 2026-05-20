-- File: 0102__workspace_invitations.sql
-- Wave: 02
-- Description: Workspace invitations with token-based acceptance
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.workspace_invitations (
  id                TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id      TEXT NOT NULL,
  invited_email     CITEXT NOT NULL,
  role              TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  token             TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked', 'expired')),
  invited_by        TEXT NOT NULL,
  accepted_by       TEXT,
  expires_at        TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '14 days'),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_workspace_invitations_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT fk_workspace_invitations_invited_by FOREIGN KEY (invited_by) REFERENCES public.users(id),
  CONSTRAINT fk_workspace_invitations_accepted_by FOREIGN KEY (accepted_by) REFERENCES public.users(id)
);

-- Token lookup (unique, URL-safe random)
CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_invitations_token
  ON public.workspace_invitations (token);

-- Pending invitations per workspace
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_ws_pending
  ON public.workspace_invitations (workspace_id, status)
  WHERE status = 'pending';

-- Pending invitations per email (for showing on signup)
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email_pending
  ON public.workspace_invitations (invited_email, status)
  WHERE status = 'pending';

-- Expiry scan
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_expires
  ON public.workspace_invitations (expires_at)
  WHERE status = 'pending';

-- Prevent duplicate pending invitations for same email+workspace
CREATE UNIQUE INDEX IF NOT EXISTS uq_workspace_invitations_email_ws_pending
  ON public.workspace_invitations (workspace_id, invited_email)
  WHERE status = 'pending';

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_workspace_invitations_update_set_updated_at ON public.workspace_invitations;
CREATE TRIGGER trg_workspace_invitations_update_set_updated_at
  BEFORE UPDATE ON public.workspace_invitations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS workspace_invitations_isolation ON public.workspace_invitations;
CREATE POLICY workspace_invitations_isolation ON public.workspace_invitations
  USING (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.workspace_invitations TO app_user;

COMMENT ON TABLE public.workspace_invitations IS 'Email-based workspace invitations with 14-day expiry';

COMMIT;
