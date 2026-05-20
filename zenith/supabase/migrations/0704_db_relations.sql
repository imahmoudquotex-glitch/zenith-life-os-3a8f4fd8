-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0704_db_relations.sql
-- Wave:        W07 (0704–0803)
-- Description: Db Relations
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W07: 0704_db_relations.sql
-- Two-way relation links between db_rows across databases
-- Wave: W07 (0700-0799)

CREATE TABLE IF NOT EXISTS db_relations (
  id                TEXT        NOT NULL DEFAULT gen_ulid(),
  workspace_id      TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source_row_id     TEXT        NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
  target_row_id     TEXT        NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
  relation_prop_id  TEXT        NOT NULL REFERENCES db_properties(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT db_relations_unique UNIQUE (source_row_id, target_row_id, relation_prop_id)
);

CREATE INDEX IF NOT EXISTS db_relations_source_idx ON db_relations (source_row_id);
CREATE INDEX IF NOT EXISTS db_relations_target_idx ON db_relations (target_row_id);
CREATE INDEX IF NOT EXISTS db_relations_prop_idx ON db_relations (relation_prop_id);

ALTER TABLE db_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_relations FORCE ROW LEVEL SECURITY;
CREATE POLICY "db_relations_workspace_isolation"
  ON db_relations FOR ALL
  USING (workspace_id = current_workspace_id());



COMMIT;
