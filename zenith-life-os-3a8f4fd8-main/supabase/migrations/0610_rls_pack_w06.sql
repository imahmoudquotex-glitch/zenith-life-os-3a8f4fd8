-- Migration 0610 — RLS Pack W06 (Final Security Sweep)
-- Wave 06 — Block Editor
-- يضمن FORCE ROW LEVEL SECURITY على كل جداول المرحلة 6
BEGIN;

-- تأكد FORCE RLS على كل جداول W06
ALTER TABLE IF EXISTS public.blocks FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.block_versions FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.synced_block_refs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.block_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.page_links FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.block_attachments FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.block_permissions FORCE ROW LEVEL SECURITY;

-- تأكد policies موجودة (idempotent)
DO $$
BEGIN
  -- blocks
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'blocks' AND policyname = 'blocks_isolation'
  ) THEN
    CREATE POLICY blocks_isolation ON public.blocks
      USING (workspace_id = current_workspace_id());
  END IF;
END $$;

-- RPC: إحصائيات للـ admin (non-sensitive)
CREATE OR REPLACE FUNCTION public.get_block_stats(p_workspace_id TEXT)
RETURNS TABLE(
  total_blocks BIGINT,
  active_blocks BIGINT,
  deleted_blocks BIGINT,
  total_versions BIGINT
) LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public, pg_temp AS $$
  SELECT
    COUNT(*) AS total_blocks,
    COUNT(*) FILTER (WHERE NOT is_deleted) AS active_blocks,
    COUNT(*) FILTER (WHERE is_deleted) AS deleted_blocks,
    (SELECT COUNT(*) FROM block_versions bv
     JOIN blocks b ON b.id = bv.block_id
     WHERE b.workspace_id = p_workspace_id) AS total_versions
  FROM blocks
  WHERE workspace_id = p_workspace_id;
$$;

COMMENT ON FUNCTION get_block_stats IS 'W06: Non-sensitive block statistics per workspace.';

COMMIT;
