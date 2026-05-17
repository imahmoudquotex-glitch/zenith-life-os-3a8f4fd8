-- Migration 0605 — Block Full-Text Search (tsvector)
-- Wave 06 — Block Editor
BEGIN;

ALTER TABLE blocks
  ADD COLUMN IF NOT EXISTS search_tsv TSVECTOR
  GENERATED ALWAYS AS (
    to_tsvector('arabic', COALESCE(content_json->>'text', '') || ' ' ||
                          COALESCE(content_json->>'caption', '') || ' ' ||
                          COALESCE(content_json->>'title', ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_blocks_search_tsv
  ON blocks USING GIN(search_tsv)
  WHERE is_deleted = false;

COMMENT ON COLUMN blocks.search_tsv IS
  'W06: Arabic full-text search vector. Covers text/caption/title fields of content_json.';

COMMIT;
