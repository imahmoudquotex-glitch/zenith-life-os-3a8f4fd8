-- =============================================================================
-- Migration 0602 — Block Versions (Wave 06)
-- =============================================================================
-- - حفظ تاريخ كل تعديل على block
-- - prune تلقائي إذا تجاوز 50 version للـ block الواحد
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.block_versions (
  id                      TEXT         PRIMARY KEY,
  block_id                TEXT         NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  workspace_id            TEXT         NOT NULL,
  content_json            JSONB        NOT NULL DEFAULT '{}'::jsonb,
  type                    TEXT         NOT NULL,
  version                 INT          NOT NULL,
  last_edited_by_user_id  TEXT         NOT NULL,
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_block_versions_block
  ON public.block_versions(block_id, version DESC);

-- Auto-insert version on block update
CREATE OR REPLACE FUNCTION public.capture_block_version()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_count INT;
BEGIN
  -- Insert new version
  INSERT INTO public.block_versions(
    id, block_id, workspace_id, content_json, type, version, last_edited_by_user_id
  ) VALUES (
    gen_random_uuid()::text,
    NEW.id,
    NEW.workspace_id,
    NEW.content_json,
    NEW.type,
    NEW.version,
    NEW.last_edited_by_user_id
  );

  -- Prune: keep only latest 50
  SELECT COUNT(*) INTO v_count FROM public.block_versions WHERE block_id = NEW.id;
  IF v_count > 50 THEN
    DELETE FROM public.block_versions
    WHERE id IN (
      SELECT id FROM public.block_versions
      WHERE block_id = NEW.id
      ORDER BY version ASC
      LIMIT (v_count - 50)
    );
  END IF;

  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_capture_block_version ON public.blocks;
CREATE TRIGGER trg_capture_block_version
AFTER UPDATE OF content_json, type ON public.blocks
FOR EACH ROW
WHEN (OLD.content_json IS DISTINCT FROM NEW.content_json OR OLD.type IS DISTINCT FROM NEW.type)
EXECUTE FUNCTION public.capture_block_version();

-- RLS
ALTER TABLE public.block_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_versions FORCE ROW LEVEL SECURITY;

CREATE POLICY block_versions_isolation ON public.block_versions
  USING (last_edited_by_user_id = auth.uid()::text);

COMMIT;
