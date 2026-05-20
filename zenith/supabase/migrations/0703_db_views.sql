-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0703_db_views.sql
-- Wave:        W07 (0703–0802)
-- Description: Db Views
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W07: 0703_db_views.sql
-- Views: table, board, gallery, calendar, timeline, list
-- Wave: W07 (0700-0799)

CREATE TABLE IF NOT EXISTS db_views (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  database_id     TEXT        NOT NULL REFERENCES database_sources(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN (
    'table','board','gallery','calendar','timeline','list'
  )),
  config          JSONB       NOT NULL DEFAULT '{}',
  -- config includes: filters[], sorts[], groupBy, visibleProperties[], rowHeight, etc.
  position        TEXT        NOT NULL DEFAULT 'a0',
  is_default      BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by      TEXT        NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT db_views_name_len CHECK (char_length(name) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS db_views_database_idx ON db_views (database_id, position);

ALTER TABLE db_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_views FORCE ROW LEVEL SECURITY;
CREATE POLICY "db_views_workspace_isolation"
  ON db_views FOR ALL
  USING (workspace_id = current_workspace_id());

SELECT create_updated_at_trigger('db_views');



COMMIT;
