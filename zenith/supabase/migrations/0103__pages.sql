-- File: 0103__pages.sql
-- Wave: 02
-- Description: Core pages table — content tree with self-referencing FK
-- Author: Zenith Builder
-- Created: 2026-05-16
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.pages (
  id                  TEXT PRIMARY KEY CHECK (public.is_ulid(id)),
  workspace_id        TEXT NOT NULL,
  parent_page_id      TEXT,
  title               TEXT NOT NULL DEFAULT '',
  slug                CITEXT NOT NULL,
  icon_kind           TEXT CHECK (icon_kind IS NULL OR icon_kind IN ('emoji', 'lucide', 'url')),
  icon_value          TEXT,
  cover_url           TEXT,
  position            DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  archived_at         TIMESTAMPTZ,
  is_locked           BOOLEAN NOT NULL DEFAULT FALSE,
  locked_by           TEXT,
  is_deleted          BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at          TIMESTAMPTZ,
  version             INT NOT NULL DEFAULT 1,
  created_by          TEXT NOT NULL,
  last_edited_by      TEXT NOT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT fk_pages_workspace FOREIGN KEY (workspace_id) REFERENCES public.workspaces(id),
  CONSTRAINT fk_pages_parent FOREIGN KEY (parent_page_id) REFERENCES public.pages(id),
  CONSTRAINT fk_pages_created_by FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT fk_pages_last_edited_by FOREIGN KEY (last_edited_by) REFERENCES public.users(id),
  CONSTRAINT fk_pages_locked_by FOREIGN KEY (locked_by) REFERENCES public.users(id),
  CONSTRAINT chk_pages_slug_format CHECK (slug ~ '^[a-z0-9]([a-z0-9-]{0,78}[a-z0-9])?$'),
  CONSTRAINT chk_pages_slug_length CHECK (LENGTH(slug) <= 80),
  CONSTRAINT chk_pages_no_self_parent CHECK (parent_page_id IS NULL OR parent_page_id <> id)
);

-- Slug unique per workspace
CREATE UNIQUE INDEX IF NOT EXISTS uq_pages_workspace_slug
  ON public.pages (workspace_id, slug) WHERE NOT is_deleted;

-- Tree traversal: children of a parent
CREATE INDEX IF NOT EXISTS idx_pages_workspace_parent
  ON public.pages (workspace_id, parent_page_id) WHERE NOT is_deleted;

-- Archived pages per workspace
CREATE INDEX IF NOT EXISTS idx_pages_workspace_archived
  ON public.pages (workspace_id, is_archived) WHERE is_archived = TRUE AND NOT is_deleted;

-- Ordering siblings
CREATE INDEX IF NOT EXISTS idx_pages_parent_position
  ON public.pages (parent_page_id, position) WHERE NOT is_deleted;

-- Created at for listing
CREATE INDEX IF NOT EXISTS idx_pages_workspace_created
  ON public.pages (workspace_id, created_at DESC) WHERE NOT is_deleted;

-- Auto-update trigger
DROP TRIGGER IF EXISTS trg_pages_update_set_updated_at ON public.pages;
CREATE TRIGGER trg_pages_update_set_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pages_isolation ON public.pages;
CREATE POLICY pages_isolation ON public.pages
  USING (workspace_id = public.current_workspace_id());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO app_user;

COMMENT ON TABLE public.pages IS 'Content pages — self-referencing tree with workspace isolation';

COMMIT;
