-- Migration 0020: Pages table
BEGIN;

CREATE TABLE public.pages (
  id                    TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id          TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  parent_page_id        TEXT REFERENCES public.pages(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL DEFAULT 'Untitled',
  icon                  TEXT,
  cover_url             TEXT,
  is_archived           BOOLEAN NOT NULL DEFAULT FALSE,
  is_template           BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_user_id    TEXT NOT NULL REFERENCES public.users(id),
  last_edited_by_user_id TEXT NOT NULL REFERENCES public.users(id),
  position              NUMERIC(30, 15) NOT NULL DEFAULT 0,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages FORCE ROW LEVEL SECURITY;

CREATE POLICY pages_workspace_read ON public.pages
  FOR SELECT
  USING (
    workspace_id = public.current_workspace_id()
    AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY pages_workspace_insert ON public.pages
  FOR INSERT
  WITH CHECK (
    workspace_id = public.current_workspace_id()
    AND created_by_user_id = public.current_user_id()
    AND last_edited_by_user_id = public.current_user_id()
  );

CREATE POLICY pages_workspace_update ON public.pages
  FOR UPDATE
  USING (workspace_id = public.current_workspace_id())
  WITH CHECK (
    workspace_id = public.current_workspace_id()
    AND last_edited_by_user_id = public.current_user_id()
  );

CREATE INDEX idx_pages_workspace ON public.pages(workspace_id);
CREATE INDEX idx_pages_parent ON public.pages(parent_page_id);

CREATE TRIGGER trg_pages_set_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.pages IS 'Workspace pages with hierarchical nesting';

COMMIT;
