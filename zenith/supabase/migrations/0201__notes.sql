-- File: 0201__notes.sql
-- Wave: 03
-- Description: Notes and note versions with full versioning and RLS
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

CREATE TABLE IF NOT EXISTS public.notes (
  id                    TEXT PRIMARY KEY,
  workspace_id          TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  page_id               TEXT REFERENCES public.pages(id) ON DELETE SET NULL,
  title                 TEXT NOT NULL DEFAULT 'Untitled',
  content_json          JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_text          TEXT,             -- denormalized for FTS (Wave 15)
  tags                  TEXT[] NOT NULL DEFAULT '{}',
  is_pinned             BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted            BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at            TIMESTAMPTZ,
  creator_user_id       TEXT NOT NULL REFERENCES public.users(id),
  last_editor_user_id   TEXT NOT NULL REFERENCES public.users(id),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  version               INT NOT NULL DEFAULT 1,
  CONSTRAINT chk_notes_title CHECK (length(title) BETWEEN 1 AND 500)
);

CREATE INDEX idx_notes_workspace ON public.notes(workspace_id, updated_at DESC) WHERE NOT is_deleted;
CREATE INDEX idx_notes_page ON public.notes(page_id) WHERE page_id IS NOT NULL AND NOT is_deleted;

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes FORCE ROW LEVEL SECURITY;
CREATE POLICY notes_workspace_isolation ON public.notes
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notes TO app_user;

CREATE TRIGGER trg_notes_updated_at BEFORE UPDATE ON public.notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Note versions (append-only, no RLS needed beyond workspace)
CREATE TABLE IF NOT EXISTS public.note_versions (
  id            TEXT PRIMARY KEY,
  note_id       TEXT NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  version       INT NOT NULL,
  content_json  JSONB NOT NULL,
  editor_user_id TEXT NOT NULL REFERENCES public.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (note_id, version)
);

CREATE INDEX idx_note_versions_note ON public.note_versions(note_id, version DESC);

ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions FORCE ROW LEVEL SECURITY;
CREATE POLICY note_versions_isolation ON public.note_versions
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT ON public.note_versions TO app_user;

COMMIT;
