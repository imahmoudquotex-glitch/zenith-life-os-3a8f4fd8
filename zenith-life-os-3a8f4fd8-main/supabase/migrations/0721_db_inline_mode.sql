BEGIN;

-- ============================================================
-- 0721: db_inline_mode — layout_mode + host_block_id + convert RPC
-- ============================================================
ALTER TABLE databases
  ADD COLUMN IF NOT EXISTS layout_mode TEXT NOT NULL DEFAULT 'full_page'
    CHECK (layout_mode IN ('full_page','inline')),
  ADD COLUMN IF NOT EXISTS host_block_id TEXT REFERENCES blocks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS host_page_id TEXT REFERENCES pages(id) ON DELETE SET NULL;

-- inline DB must have host
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_inline_has_host' AND conrelid = 'databases'::regclass
  ) THEN
    ALTER TABLE databases ADD CONSTRAINT chk_inline_has_host CHECK (
      (layout_mode = 'inline' AND host_block_id IS NOT NULL AND host_page_id IS NOT NULL)
      OR (layout_mode = 'full_page' AND host_block_id IS NULL)
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_databases_host_page ON databases(host_page_id) WHERE layout_mode = 'inline';

-- convert_database_layout RPC
CREATE OR REPLACE FUNCTION convert_database_layout(
  p_db_id         TEXT,
  p_target_mode   TEXT,
  p_target_page_id TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE v_block_id TEXT;
BEGIN
  -- Verify ownership
  IF NOT EXISTS (SELECT 1 FROM databases WHERE id = p_db_id AND workspace_id = current_workspace_id()) THEN
    RAISE EXCEPTION 'database_not_found';
  END IF;

  IF p_target_mode = 'inline' THEN
    IF p_target_page_id IS NULL THEN RAISE EXCEPTION 'inline_needs_host_page'; END IF;
    v_block_id := generate_ulid();
    INSERT INTO blocks(id, workspace_id, page_id, type, content_json, position, created_by_user_id, last_edited_by_user_id)
    VALUES (
      v_block_id,
      current_workspace_id(),
      p_target_page_id,
      'database_inline',
      jsonb_build_object('database_id', p_db_id),
      (SELECT COALESCE(MAX(position), 0) + 1000 FROM blocks WHERE page_id = p_target_page_id),
      current_user_id(),
      current_user_id()
    );
    UPDATE databases
    SET layout_mode = 'inline', host_block_id = v_block_id, host_page_id = p_target_page_id
    WHERE id = p_db_id AND workspace_id = current_workspace_id();
  ELSE
    UPDATE databases
    SET layout_mode = 'full_page', host_block_id = NULL, host_page_id = NULL
    WHERE id = p_db_id AND workspace_id = current_workspace_id();
  END IF;
END $$;

GRANT EXECUTE ON FUNCTION convert_database_layout(TEXT, TEXT, TEXT) TO app_user;

COMMIT;
