-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0601_blocks.sql
-- Wave:        W06 (0601–0700)
-- Description: Blocks
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W06: 0601_blocks.sql
-- Page blocks for the block editor
-- Wave: W06 (0600-0699)

CREATE TABLE IF NOT EXISTS blocks (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  page_id         TEXT        NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  parent_id       TEXT        REFERENCES blocks(id) ON DELETE CASCADE,
  type            TEXT        NOT NULL CHECK (type IN (
    'text','heading_1','heading_2','heading_3',
    'bulleted_list','numbered_list','toggle',
    'quote','divider','code','callout',
    'image','video','file','embed',
    'database','database_view',
    'synced_block','template'
  )),
  content         JSONB       NOT NULL DEFAULT '{}',
  position        TEXT        NOT NULL DEFAULT 'a0',
  is_archived     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by      TEXT        NOT NULL REFERENCES users(id),
  last_edited_by  TEXT        REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS blocks_page_idx ON blocks (page_id, position);
CREATE INDEX IF NOT EXISTS blocks_parent_idx ON blocks (parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS blocks_workspace_idx ON blocks (workspace_id);
CREATE INDEX IF NOT EXISTS blocks_active_idx ON blocks (page_id) WHERE is_archived = FALSE;

ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks FORCE ROW LEVEL SECURITY;
CREATE POLICY "blocks_workspace_isolation"
  ON blocks FOR ALL
  USING (workspace_id = current_workspace_id());

SELECT create_updated_at_trigger('blocks');



COMMIT;
