-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0702_db_rows.sql
-- Wave:        W07 (0702–0801)
-- Description: Db Rows
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W07: 0702_db_rows.sql
-- Database rows with JSONB property values
-- Wave: W07 (0700-0799)

CREATE TABLE IF NOT EXISTS db_rows (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  database_id     TEXT        NOT NULL REFERENCES database_sources(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  properties      JSONB       NOT NULL DEFAULT '{}', -- { property_id: value }
  position        TEXT        NOT NULL DEFAULT 'a0', -- fractional index for ordering
  is_archived     BOOLEAN     NOT NULL DEFAULT FALSE,
  created_by      TEXT        NOT NULL REFERENCES users(id),
  last_edited_by  TEXT        REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS db_rows_database_idx ON db_rows (database_id, position);
CREATE INDEX IF NOT EXISTS db_rows_workspace_idx ON db_rows (workspace_id);
CREATE INDEX IF NOT EXISTS db_rows_properties_gin ON db_rows USING GIN (properties);
CREATE INDEX IF NOT EXISTS db_rows_active_idx ON db_rows (database_id) WHERE is_archived = FALSE;

ALTER TABLE db_rows ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_rows FORCE ROW LEVEL SECURITY;
CREATE POLICY "db_rows_workspace_isolation"
  ON db_rows FOR ALL
  USING (workspace_id = current_workspace_id());

SELECT create_updated_at_trigger('db_rows');



COMMIT;
