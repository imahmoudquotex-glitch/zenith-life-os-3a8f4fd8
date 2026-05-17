-- Migration 0607 — Page Links (Backlinks)
-- Wave 06 — Block Editor
-- يتبع روابط الصفحات (page_link blocks) لبناء backlinks graph
BEGIN;

CREATE TABLE IF NOT EXISTS public.page_links (
  id            TEXT PRIMARY KEY DEFAULT gen_ulid(),
  workspace_id  TEXT NOT NULL,
  source_page_id TEXT NOT NULL,
  target_page_id TEXT NOT NULL,
  source_block_id TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(source_block_id, target_page_id)
);

CREATE INDEX IF NOT EXISTS idx_page_links_target ON page_links(target_page_id);
CREATE INDEX IF NOT EXISTS idx_page_links_source ON page_links(source_page_id);

ALTER TABLE page_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_links FORCE ROW LEVEL SECURITY;

CREATE POLICY page_links_isolation ON page_links
  USING (workspace_id = current_workspace_id());

-- RPC: upsert backlink عند إضافة page_link block
CREATE OR REPLACE FUNCTION public.upsert_page_link(
  p_workspace_id TEXT,
  p_source_page TEXT,
  p_target_page TEXT,
  p_source_block TEXT
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  INSERT INTO page_links(workspace_id, source_page_id, target_page_id, source_block_id)
  VALUES (p_workspace_id, p_source_page, p_target_page, p_source_block)
  ON CONFLICT (source_block_id, target_page_id) DO NOTHING;
END $$;

-- RPC: حذف backlink عند soft delete لـ block
CREATE OR REPLACE FUNCTION public.remove_page_link(p_source_block TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  DELETE FROM page_links WHERE source_block_id = p_source_block;
END $$;

COMMENT ON TABLE page_links IS 'W06: Bidirectional page link graph for backlinks feature.';

COMMIT;
