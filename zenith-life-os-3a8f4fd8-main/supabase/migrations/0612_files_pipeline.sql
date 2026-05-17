-- Wave 06 — Files & Media Pipeline Migration
-- Migration 0612: files table + RLS + request_file_upload RPC + quota
-- Supabase Migration: supabase/migrations/0612_files_pipeline.sql

BEGIN;

-- ─── Files table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bucket        TEXT NOT NULL DEFAULT 'blocks-media',
  object_key    TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL CHECK (size_bytes >= 0),
  width         INT,
  height        INT,
  duration_ms   INT,
  hash_sha256   TEXT,
  is_processed  BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  deleted_at    TIMESTAMPTZ,
  variants      JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_object_key UNIQUE (bucket, object_key),
  CONSTRAINT chk_mime_not_empty CHECK (length(trim(mime_type)) > 0)
);

CREATE INDEX idx_files_workspace ON public.files(workspace_id) WHERE is_deleted = false;
CREATE INDEX idx_files_user ON public.files(user_id) WHERE is_deleted = false;

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files FORCE ROW LEVEL SECURITY;

CREATE POLICY files_isolation ON public.files
  USING (workspace_id = current_workspace_id())
  WITH CHECK (workspace_id = current_workspace_id());

-- ─── Workspace Storage Quotas ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.workspace_storage_quotas (
  workspace_id  UUID PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  used_bytes    BIGINT NOT NULL DEFAULT 0 CHECK (used_bytes >= 0),
  quota_bytes   BIGINT NOT NULL DEFAULT 5368709120 CHECK (quota_bytes > 0), -- 5 GB
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_storage_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_storage_quotas FORCE ROW LEVEL SECURITY;

CREATE POLICY quota_isolation ON public.workspace_storage_quotas
  USING (workspace_id = current_workspace_id());

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

-- ─── request_file_upload RPC ──────────────────────────────────────────────────
-- Checks quota, creates DB record, returns signed info
CREATE OR REPLACE FUNCTION public.request_file_upload(
  p_workspace_id UUID,
  p_mime_type    TEXT,
  p_size_bytes   BIGINT,
  p_original_name TEXT DEFAULT 'file'
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_quota    public.workspace_storage_quotas;
  v_file_id  UUID := gen_random_uuid();
  v_obj_key  TEXT;
BEGIN
  -- Check quota
  SELECT * INTO v_quota FROM public.workspace_storage_quotas WHERE workspace_id = p_workspace_id;
  IF v_quota.used_bytes + p_size_bytes > v_quota.quota_bytes THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED: used=% + new=% > limit=%',
      v_quota.used_bytes, p_size_bytes, v_quota.quota_bytes;
  END IF;

  -- Build object key
  v_obj_key := p_workspace_id::text || '/' || v_file_id::text || '-' || 
               regexp_replace(p_original_name, '[^a-zA-Z0-9._-]', '_', 'g');

  -- Create file record
  INSERT INTO public.files(id, workspace_id, user_id, bucket, object_key, original_name, mime_type, size_bytes)
  VALUES (v_file_id, p_workspace_id, auth.uid(), 'blocks-media', v_obj_key, p_original_name, p_mime_type, p_size_bytes);

  -- Reserve quota
  UPDATE public.workspace_storage_quotas
  SET used_bytes = used_bytes + p_size_bytes, updated_at = now()
  WHERE workspace_id = p_workspace_id;

  RETURN jsonb_build_object(
    'file_id', v_file_id,
    'object_key', v_obj_key,
    'bucket', 'blocks-media'
  );
END $$;

-- ─── mark_file_processed RPC ─────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.mark_file_processed(
  p_file_id UUID,
  p_variants JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
BEGIN
  UPDATE public.files
  SET is_processed = true, variants = p_variants
  WHERE id = p_file_id AND workspace_id = current_workspace_id();
END $$;

-- ─── delete_file RPC (soft delete) ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.delete_file(p_file_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, pg_temp AS $$
DECLARE
  v_size BIGINT;
  v_ws   UUID;
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
