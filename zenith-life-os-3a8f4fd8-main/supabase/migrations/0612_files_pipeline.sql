-- Wave 06 — Files & Media Pipeline Migration (Canonical)
-- Migration 0612: files table + RLS + request_file_upload RPC + quota
-- FIXED: UUID → TEXT ULID, auth.uid() → current_user_id(), gen_random_uuid() → app ULID

BEGIN;

-- NOTE: 0611 creates the same tables. 0612 exists as the canonical/corrected version.
-- If 0611 already ran, this will skip via IF NOT EXISTS.

-- ─── Files table ─────────────────────────────────────────────────────────────
-- Already created in 0611. Add unique constraint if not present.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_object_key') THEN
    ALTER TABLE public.files ADD CONSTRAINT uq_object_key UNIQUE (bucket, object_key);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_mime_not_empty') THEN
    ALTER TABLE public.files ADD CONSTRAINT chk_mime_not_empty CHECK (length(trim(mime_type)) > 0);
  END IF;
END $$;

-- Auto-create quota row for each new workspace
CREATE OR REPLACE FUNCTION init_workspace_quota() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO public.workspace_storage_quotas(workspace_id)
  VALUES (NEW.id)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_init_workspace_quota ON public.workspaces;
CREATE TRIGGER trg_init_workspace_quota
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION init_workspace_quota();

-- ─── request_file_upload RPC (FIXED: no gen_random_uuid) ──────────────────────
CREATE OR REPLACE FUNCTION public.request_file_upload(
  p_workspace_id TEXT,
  p_mime_type    TEXT,
  p_size_bytes   BIGINT,
  p_original_name TEXT DEFAULT 'file',
  p_file_id      TEXT DEFAULT NULL  -- ULID from app layer
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_quota    public.workspace_storage_quotas;
  v_obj_key  TEXT;
BEGIN
  -- Validate ULID
  IF p_file_id IS NOT NULL AND NOT public.is_ulid(p_file_id) THEN
    RAISE EXCEPTION 'INVALID_FILE_ID';
  END IF;

  -- Check quota
  SELECT * INTO v_quota FROM public.workspace_storage_quotas WHERE workspace_id = p_workspace_id;
  IF v_quota.used_bytes + p_size_bytes > v_quota.quota_bytes THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED: used=% + new=% > limit=%',
      v_quota.used_bytes, p_size_bytes, v_quota.quota_bytes;
  END IF;

  -- Build object key
  v_obj_key := p_workspace_id || '/' || p_file_id || '-' || 
               regexp_replace(p_original_name, '[^a-zA-Z0-9._-]', '_', 'g');

  -- Create file record
  INSERT INTO public.files(id, workspace_id, user_id, bucket, object_key, original_name, mime_type, size_bytes)
  VALUES (p_file_id, p_workspace_id, public.current_user_id(), 'blocks-media', v_obj_key, p_original_name, p_mime_type, p_size_bytes);

  -- Reserve quota
  UPDATE public.workspace_storage_quotas
  SET used_bytes = used_bytes + p_size_bytes, updated_at = now()
  WHERE workspace_id = p_workspace_id;

  RETURN jsonb_build_object(
    'file_id', p_file_id,
    'object_key', v_obj_key,
    'bucket', 'blocks-media'
  );
END $$;

-- ─── mark_file_processed RPC ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_file_processed(
  p_file_id TEXT,
  p_variants JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.files
  SET is_processed = true, variants = p_variants
  WHERE id = p_file_id AND workspace_id = public.current_workspace_id();
END $$;

-- ─── delete_file RPC (soft delete) ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_file(p_file_id TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_size BIGINT;
  v_ws   TEXT;
BEGIN
  SELECT size_bytes, workspace_id INTO v_size, v_ws
  FROM public.files WHERE id = p_file_id AND is_deleted = false;

  IF NOT FOUND THEN RAISE EXCEPTION 'FILE_NOT_FOUND'; END IF;

  -- Soft delete
  UPDATE public.files
  SET is_deleted = true, deleted_at = now()
  WHERE id = p_file_id;

  -- Release quota
  UPDATE public.workspace_storage_quotas
  SET used_bytes = GREATEST(0, used_bytes - v_size), updated_at = now()
  WHERE workspace_id = v_ws;
END $$;

GRANT EXECUTE ON FUNCTION public.request_file_upload TO app_user;
GRANT EXECUTE ON FUNCTION public.mark_file_processed TO app_user;
GRANT EXECUTE ON FUNCTION public.delete_file TO app_user;
GRANT SELECT, INSERT, UPDATE ON public.files TO app_user;
GRANT SELECT, UPDATE ON public.workspace_storage_quotas TO app_user;

COMMIT;
