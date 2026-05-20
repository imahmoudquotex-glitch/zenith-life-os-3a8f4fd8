-- File: 0105__page_permissions.sql
-- Wave: 02
-- Description: Page-level permission overrides (additive model)
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.page_permissions (
  id                  TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id        TEXT NOT NULL,
  page_id             TEXT NOT NULL,
  subject_type        TEXT NOT NULL,
  subject_user_id     TEXT,
  subject_role        TEXT,
  level               TEXT NOT NULL,
  created_by_user_id  TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_page_permissions_page FOREIGN KEY (page_id) REFERENCES public.pages(id),
  CONSTRAINT fk_page_permissions_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT fk_page_permissions_user FOREIGN KEY (subject_user_id) REFERENCES public.users(id),
  CONSTRAINT fk_page_permissions_created_by FOREIGN KEY (created_by_user_id) REFERENCES public.users(id),

  CONSTRAINT chk_page_permissions_subject_type CHECK (subject_type IN ('user', 'role', 'workspace_everyone')),
  CONSTRAINT chk_page_permissions_subject_role CHECK (subject_role IS NULL OR subject_role IN ('admin', 'member', 'viewer')),
  CONSTRAINT chk_page_permissions_level CHECK (level IN ('view', 'comment', 'edit', 'full')),
  CONSTRAINT chk_page_permissions_subject_coherence CHECK (
    (subject_type = 'user' AND subject_user_id IS NOT NULL AND subject_role IS NULL) OR
    (subject_type = 'role' AND subject_role IS NOT NULL AND subject_user_id IS NULL) OR
    (subject_type = 'workspace_everyone' AND subject_user_id IS NULL AND subject_role IS NULL)
  )
);

-- Partial unique indexes per subject type
CREATE UNIQUE INDEX IF NOT EXISTS uq_page_permissions_user
  ON public.page_permissions (page_id, subject_user_id)
  WHERE subject_type = 'user';

CREATE UNIQUE INDEX IF NOT EXISTS uq_page_permissions_role
  ON public.page_permissions (page_id, subject_role)
  WHERE subject_type = 'role';

CREATE UNIQUE INDEX IF NOT EXISTS uq_page_permissions_everyone
  ON public.page_permissions (page_id)
  WHERE subject_type = 'workspace_everyone';

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_page_permissions_update_set_updated_at ON public.page_permissions;
CREATE TRIGGER trg_page_permissions_update_set_updated_at
  BEFORE UPDATE ON public.page_permissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_permissions FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS page_permissions_isolation ON public.page_permissions;
CREATE POLICY page_permissions_isolation ON public.page_permissions
  USING (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.page_permissions TO app_user;

COMMENT ON TABLE public.page_permissions IS 'Additive page-level permission overrides (user > role > everyone)';

COMMIT;
