-- =============================================================================
-- Migration 0603 — Reorder Block RPC + Soft Delete (Wave 06)
-- =============================================================================

BEGIN;

-- reorder_block: atomic position update + version bump
CREATE OR REPLACE FUNCTION public.reorder_block(
  p_block_id    TEXT,
  p_new_position DOUBLE PRECISION,
  p_user_id     TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.blocks
  SET
    position = p_new_position,
    version = version + 1,
    last_edited_by_user_id = p_user_id
  WHERE
    id = p_block_id
    AND created_by_user_id = p_user_id  -- workspace isolation
    AND is_deleted = false;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'block_not_found_or_unauthorized';
  END IF;
END $$;

-- soft_delete_block: cascade delete children recursively
CREATE OR REPLACE FUNCTION public.soft_delete_block(
  p_block_id TEXT,
  p_user_id  TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  -- Pre-delete: version snapshot is captured by trigger automatically
  WITH RECURSIVE children AS (
    SELECT id FROM public.blocks
    WHERE id = p_block_id AND created_by_user_id = p_user_id
    UNION ALL
    SELECT b.id FROM public.blocks b
    JOIN children c ON b.parent_block_id = c.id
    WHERE b.is_deleted = false
  )
  UPDATE public.blocks
  SET
    is_deleted = true,
    deleted_at = now(),
    version = version + 1,
    last_edited_by_user_id = p_user_id
  WHERE id IN (SELECT id FROM children);
END $$;

COMMIT;
