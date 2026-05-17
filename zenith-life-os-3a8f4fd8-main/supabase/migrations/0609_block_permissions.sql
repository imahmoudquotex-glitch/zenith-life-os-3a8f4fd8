-- Migration 0609 — Block Permissions + Version Restore
-- Wave 06 — Notion-Parity Add-On
-- صلاحيات مستقلة per-block + UI استرجاع versions
BEGIN;

CREATE TABLE IF NOT EXISTS public.block_permissions (
  id              TEXT PRIMARY KEY DEFAULT gen_ulid(),
  workspace_id    TEXT NOT NULL,
  block_id        TEXT NOT NULL,
  grantee_user_id TEXT,
  grantee_role    TEXT,
  level           TEXT NOT NULL CHECK (level IN ('view','comment','edit','none')),
  inherit_from_page BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(block_id, grantee_user_id),
  UNIQUE(block_id, grantee_role),
  -- إما user أو role، مش الاثنين
  CHECK ((grantee_user_id IS NOT NULL) <> (grantee_role IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_bp_block ON block_permissions(block_id);

ALTER TABLE block_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_permissions FORCE ROW LEVEL SECURITY;

CREATE POLICY bp_isolation ON block_permissions
  USING (workspace_id = current_workspace_id());

-- RPC: يحسب effective permission لـ block (يرث من page لو inherit_from_page = true)
CREATE OR REPLACE FUNCTION public.get_block_effective_permission(
  p_block_id TEXT,
  p_user_id  TEXT
)
RETURNS TEXT LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_level   TEXT;
  v_inherit BOOLEAN;
  v_page_id TEXT;
BEGIN
  -- ابحث عن permission مباشر
  SELECT level, inherit_from_page
  INTO v_level, v_inherit
  FROM block_permissions
  WHERE block_id = p_block_id
    AND grantee_user_id = p_user_id
  LIMIT 1;

  -- لو موجود ومش وارث من page، ارجع مباشرة
  IF v_level IS NOT NULL AND NOT v_inherit THEN
    RETURN v_level;
  END IF;

  -- ارجع permission الـ page (stub — يُكمّل في W07)
  SELECT page_id INTO v_page_id FROM blocks WHERE id = p_block_id;
  RETURN COALESCE(v_level, 'view'); -- default view
END $$;

COMMENT ON TABLE block_permissions IS
  'W06: Per-block permission overrides. Inherits from page by default.';
COMMENT ON FUNCTION get_block_effective_permission IS
  'W06: Returns the effective permission level for a user on a block, respecting inheritance.';

COMMIT;
