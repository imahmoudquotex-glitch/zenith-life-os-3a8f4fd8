-- =============================================================================
-- Migration 0600 — Block Types Enum (Wave 06 — Block Editor Foundation)
-- =============================================================================
BEGIN;

-- Block types supported in Wave 06
DO $$ BEGIN
  CREATE TYPE public.block_type AS ENUM (
    'paragraph',
    'heading_1', 'heading_2', 'heading_3',
    'bulleted_list', 'numbered_list', 'todo', 'toggle',
    'quote', 'callout', 'divider', 'code',
    'image', 'video', 'audio', 'file', 'embed', 'bookmark',
    'column_list', 'column',
    'database_inline',   -- placeholder لـ W07
    'synced_block',
    'template_button',
    'table_of_contents',
    'page_link',
    'vault_inline'       -- B.7: مشفر ZKE, يُستثنى من AI/Search
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
