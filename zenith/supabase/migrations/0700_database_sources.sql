-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0700_database_sources.sql
-- Wave:        W07 (0700–0799)
-- Description: Database Sources
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W07: 0700_database_sources.sql
-- Core database (Zenith DB) data sources table
-- Wave: W07 (0700-0799)

CREATE TABLE IF NOT EXISTS database_sources (
  id            TEXT        NOT NULL DEFAULT gen_ulid(),
  workspace_id  TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name          TEXT        NOT NULL,
  description   TEXT,
  icon          TEXT,
  cover_url     TEXT,
  row_count     INTEGER     NOT NULL DEFAULT 0,
  created_by    TEXT        NOT NULL REFERENCES users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT database_sources_name_len CHECK (char_length(name) BETWEEN 1 AND 200)
);

CREATE INDEX IF NOT EXISTS database_sources_workspace_idx ON database_sources (workspace_id);
CREATE INDEX IF NOT EXISTS database_sources_created_idx ON database_sources (workspace_id, created_at DESC);

ALTER TABLE database_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE database_sources FORCE ROW LEVEL SECURITY;
CREATE POLICY "database_sources_workspace_isolation"
  ON database_sources FOR ALL
  USING (workspace_id = current_workspace_id());

SELECT create_updated_at_trigger('database_sources');



COMMIT;
