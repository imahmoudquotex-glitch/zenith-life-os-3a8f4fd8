-- File: 0208__database_rows_canvas.sql
-- Wave: 03
-- Description: Generic database rows (JSONB) and canvas nodes baseline
-- Author: Zenith Builder
-- Created: 2026-05-20
-- Idempotent: YES

BEGIN;

-- Generic database rows (baseline for Wave 07 DB Engine)
CREATE TABLE IF NOT EXISTS public.database_rows_baseline (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  database_id   TEXT NOT NULL,
  properties    JSONB NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(properties) = 'object'),
  position      DOUBLE PRECISION NOT NULL DEFAULT 0,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  created_by    TEXT NOT NULL REFERENCES public.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_db_rows_baseline_workspace ON public.database_rows_baseline(workspace_id, database_id) WHERE NOT is_deleted;
CREATE INDEX idx_db_rows_baseline_props ON public.database_rows_baseline USING GIN(properties);

ALTER TABLE public.database_rows_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.database_rows_baseline FORCE ROW LEVEL SECURITY;
CREATE POLICY db_rows_baseline_isolation ON public.database_rows_baseline
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.database_rows_baseline TO app_user;
CREATE TRIGGER trg_db_rows_baseline_updated_at BEFORE UPDATE ON public.database_rows_baseline
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Canvas nodes baseline (for visual workspace/mind-map features)
CREATE TABLE IF NOT EXISTS public.canvas_nodes_baseline (
  id            TEXT PRIMARY KEY,
  workspace_id  TEXT NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  canvas_id     TEXT NOT NULL,
  node_type     TEXT NOT NULL DEFAULT 'note'
                  CHECK (node_type IN ('note','task','image','link','shape','group')),
  content_json  JSONB NOT NULL DEFAULT '{}'::jsonb,
  x             DOUBLE PRECISION NOT NULL DEFAULT 0,
  y             DOUBLE PRECISION NOT NULL DEFAULT 0,
  width         DOUBLE PRECISION NOT NULL DEFAULT 200,
  height        DOUBLE PRECISION NOT NULL DEFAULT 100,
  z_index       INT NOT NULL DEFAULT 0,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  creator_user_id TEXT NOT NULL REFERENCES public.users(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_canvas_nodes_baseline_canvas ON public.canvas_nodes_baseline(workspace_id, canvas_id) WHERE NOT is_deleted;

ALTER TABLE public.canvas_nodes_baseline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.canvas_nodes_baseline FORCE ROW LEVEL SECURITY;
CREATE POLICY canvas_nodes_baseline_isolation ON public.canvas_nodes_baseline
  USING (workspace_id = current_setting('app.current_workspace_id', true));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.canvas_nodes_baseline TO app_user;
CREATE TRIGGER trg_canvas_nodes_updated_at BEFORE UPDATE ON public.canvas_nodes_baseline
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMIT;
