-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- File:        0701_db_properties.sql
-- Wave:        W07 (0701–0800)
-- Description: Db Properties
-- Author:      zenith-system
-- Created:     2026-05-20
-- Idempotent:  YES (uses IF NOT EXISTS / OR REPLACE)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BEGIN;

-- W07: 0701_db_properties.sql
-- Column schema for Zenith DB (21 property types)
-- Wave: W07 (0700-0799)

CREATE TABLE IF NOT EXISTS db_properties (
  id              TEXT        NOT NULL DEFAULT gen_ulid(),
  database_id     TEXT        NOT NULL REFERENCES database_sources(id) ON DELETE CASCADE,
  workspace_id    TEXT        NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name            TEXT        NOT NULL,
  type            TEXT        NOT NULL CHECK (type IN (
    'title','text','number','select','multi_select','status',
    'date','person','files','checkbox','url','email','phone',
    'relation','rollup','formula',
    'created_time','last_edited_time','created_by','last_edited_by',
    'auto_increment_id'
  )),
  config          JSONB       NOT NULL DEFAULT '{}', -- options, formula, relation target, etc.
  position        TEXT        NOT NULL DEFAULT 'a0', -- fractional index
  is_primary      BOOLEAN     NOT NULL DEFAULT FALSE,
  is_hidden       BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id),
  CONSTRAINT db_properties_name_len CHECK (char_length(name) BETWEEN 1 AND 200),
  CONSTRAINT db_properties_one_title UNIQUE (database_id, is_primary) DEFERRABLE INITIALLY DEFERRED
);

CREATE INDEX IF NOT EXISTS db_properties_database_idx ON db_properties (database_id);

ALTER TABLE db_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_properties FORCE ROW LEVEL SECURITY;
CREATE POLICY "db_properties_workspace_isolation"
  ON db_properties FOR ALL
  USING (workspace_id = current_workspace_id());

SELECT create_updated_at_trigger('db_properties');



COMMIT;
