-- =============================================================================
-- Migration 0601 — Blocks Table (Wave 06)
-- =============================================================================
-- القواعد:
-- - fractional position (double precision)
-- - parent_block_id tree (max depth 50)
-- - soft delete (is_deleted = true)
-- - RLS + FORCE RLS
-- - workspace_id isolation
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.blocks (
  id                      TEXT         PRIMARY KEY,
  workspace_id            TEXT         NOT NULL,
  page_id                 TEXT         NOT NULL,
  parent_block_id         TEXT         REFERENCES public.blocks(id) ON DELETE SET NULL,
  type                    TEXT         NOT NULL,
  content_json            JSONB        NOT NULL DEFAULT '{}'::jsonb,
  position                DOUBLE PRECISION NOT NULL DEFAULT 0,
  depth                   INT          NOT NULL DEFAULT 0,
  is_deleted              BOOLEAN      NOT NULL DEFAULT false,
  deleted_at              TIMESTAMPTZ,
  created_by_user_id      TEXT         NOT NULL,
  last_edited_by_user_id  TEXT         NOT NULL,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  version                 INT          NOT NULL DEFAULT 1,

  -- Constraints
  CONSTRAINT chk_blocks_depth        CHECK (depth BETWEEN 0 AND 50),
  CONSTRAINT chk_blocks_content_obj  CHECK (jsonb_typeof(content_json) = 'object'),
  CONSTRAINT chk_blocks_position_pos CHECK (position >= 0)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blocks_page_position
  ON public.blocks(page_id, position)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_blocks_parent
  ON public.blocks(parent_block_id)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_blocks_workspace_type
  ON public.blocks(workspace_id, type)
  WHERE is_deleted = false;

-- Auto update updated_at
CREATE OR REPLACE FUNCTION public.set_blocks_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_blocks_updated_at ON public.blocks;
CREATE TRIGGER trg_blocks_updated_at
BEFORE UPDATE ON public.blocks
FOR EACH ROW EXECUTE FUNCTION public.set_blocks_updated_at();

-- RLS
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks FORCE ROW LEVEL SECURITY;

CREATE POLICY blocks_workspace_isolation ON public.blocks
  USING (created_by_user_id = auth.uid()::text);

COMMIT;
