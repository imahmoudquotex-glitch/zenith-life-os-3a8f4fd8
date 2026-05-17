BEGIN;

-- ============================================================
-- 0715: db_files_attachments (file property ↔ storage objects)
-- ============================================================
CREATE TABLE IF NOT EXISTS db_file_attachments (
  id           TEXT PRIMARY KEY DEFAULT generate_ulid(),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  row_id       TEXT NOT NULL REFERENCES db_rows(id) ON DELETE CASCADE,
  property_id  TEXT NOT NULL REFERENCES db_properties(id) ON DELETE CASCADE,
  file_id      TEXT NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  position     INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_db_file_attachments_row ON db_file_attachments(row_id, property_id);

ALTER TABLE db_file_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_file_attachments FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_file_attachments' AND policyname='db_file_attachments_isolation') THEN
    CREATE POLICY db_file_attachments_isolation ON db_file_attachments USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_file_attachments TO app_user;

-- ============================================================
-- 0716: db_templates (page templates per DB)
-- ============================================================
CREATE TABLE IF NOT EXISTS db_templates (
  id           TEXT PRIMARY KEY DEFAULT generate_ulid(),
  workspace_id TEXT NOT NULL REFERENCES workspaces(id),
  database_id  TEXT NOT NULL REFERENCES databases(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  description  TEXT,
  default_props JSONB NOT NULL DEFAULT '{}'::jsonb, -- pre-filled property values
  page_id      TEXT REFERENCES pages(id),           -- linked page as template content
  is_default   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_template_name CHECK (length(name) BETWEEN 1 AND 200)
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_db_templates_default ON db_templates(database_id) WHERE is_default = TRUE;

ALTER TABLE db_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_templates FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_templates' AND policyname='db_templates_isolation') THEN
    CREATE POLICY db_templates_isolation ON db_templates USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON db_templates TO app_user;

-- ============================================================
-- 0719: db_csv_import_jobs (queue + progress)
-- ============================================================
CREATE TABLE IF NOT EXISTS db_csv_import_jobs (
  id             TEXT PRIMARY KEY DEFAULT generate_ulid(),
  workspace_id   TEXT NOT NULL REFERENCES workspaces(id),
  database_id    TEXT NOT NULL REFERENCES databases(id),
  status         TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','processing','completed','failed')),
  file_url       TEXT,
  column_mapping JSONB,
  total_rows     INT,
  imported_rows  INT DEFAULT 0,
  failed_rows    INT DEFAULT 0,
  error_report   JSONB, -- rejected rows with reasons
  started_at     TIMESTAMPTZ,
  completed_at   TIMESTAMPTZ,
  created_by     TEXT REFERENCES users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_db_csv_jobs_database ON db_csv_import_jobs(database_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_db_csv_jobs_status ON db_csv_import_jobs(workspace_id, status) WHERE status IN ('pending','processing');

ALTER TABLE db_csv_import_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE db_csv_import_jobs FORCE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='db_csv_import_jobs' AND policyname='db_csv_jobs_isolation') THEN
    CREATE POLICY db_csv_jobs_isolation ON db_csv_import_jobs USING (workspace_id = current_workspace_id());
  END IF;
END $$;

GRANT SELECT, INSERT, UPDATE ON db_csv_import_jobs TO app_user;

COMMIT;
