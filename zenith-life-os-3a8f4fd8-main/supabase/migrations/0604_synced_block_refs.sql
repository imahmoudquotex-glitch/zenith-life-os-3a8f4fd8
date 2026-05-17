-- =============================================================================
-- Migration 0604 — Synced Block Refs + Cycle Prevention (Wave 06)
-- =============================================================================

BEGIN;

CREATE TABLE IF NOT EXISTS public.synced_block_refs (
  id              TEXT  PRIMARY KEY,
  block_id        TEXT  NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  source_block_id TEXT  NOT NULL REFERENCES public.blocks(id) ON DELETE CASCADE,
  workspace_id    TEXT  NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(block_id, source_block_id),
  CONSTRAINT chk_no_self_sync CHECK (block_id != source_block_id)
);

-- Cycle prevention trigger
CREATE OR REPLACE FUNCTION public.assert_no_synced_cycle()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_count INT;
BEGIN
  WITH RECURSIVE chain AS (
    SELECT source_block_id
    FROM public.synced_block_refs
    WHERE block_id = NEW.source_block_id
    UNION ALL
    SELECT s.source_block_id
    FROM public.synced_block_refs s
    JOIN chain c ON s.block_id = c.source_block_id
  )
  SELECT COUNT(*) INTO v_count FROM chain WHERE source_block_id = NEW.block_id;

  IF v_count > 0 THEN
    RAISE EXCEPTION 'synced_block_cycle_detected: block % -> % creates a cycle', NEW.block_id, NEW.source_block_id;
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_synced_block_cycle ON public.synced_block_refs;
CREATE TRIGGER trg_synced_block_cycle
BEFORE INSERT ON public.synced_block_refs
FOR EACH ROW EXECUTE FUNCTION public.assert_no_synced_cycle();

ALTER TABLE public.synced_block_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.synced_block_refs FORCE ROW LEVEL SECURITY;

CREATE POLICY synced_refs_isolation ON public.synced_block_refs
  USING (workspace_id IN (
    SELECT workspace_id FROM public.blocks WHERE created_by_user_id = auth.uid()::text LIMIT 1
  ));

COMMIT;
