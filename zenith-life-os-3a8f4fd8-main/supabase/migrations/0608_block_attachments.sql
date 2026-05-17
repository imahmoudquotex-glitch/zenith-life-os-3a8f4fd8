-- Migration 0608 — Block Attachments (blocks ↔ storage objects)
-- Wave 06 — Block Editor
BEGIN;

CREATE TABLE IF NOT EXISTS public.block_attachments (
  id            TEXT PRIMARY KEY DEFAULT gen_ulid(),
  workspace_id  TEXT NOT NULL,
  block_id      TEXT NOT NULL,
  bucket        TEXT NOT NULL DEFAULT 'blocks-media',
  object_key    TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL CHECK (size_bytes >= 0),
  -- لا تسمح بـ image/video أكبر من: image ≤ 10MB, video ≤ 100MB
  is_processed  BOOLEAN NOT NULL DEFAULT false,
  is_deleted    BOOLEAN NOT NULL DEFAULT false,
  metadata      JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_block_attach_size CHECK (size_bytes <= 104857600), -- 100MB max
  CONSTRAINT chk_block_attach_mime CHECK (
    mime_type ~ '^(image|video|audio|application|text)/'
  )
);

CREATE INDEX IF NOT EXISTS idx_block_attachments_block ON block_attachments(block_id) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_block_attachments_workspace ON block_attachments(workspace_id) WHERE is_deleted = false;

ALTER TABLE block_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE block_attachments FORCE ROW LEVEL SECURITY;

CREATE POLICY block_attachments_isolation ON block_attachments
  USING (workspace_id = current_workspace_id());

COMMENT ON TABLE block_attachments IS
  'W06: Tracks file attachments for media blocks (image/video/audio/file). Linked to storage bucket blocks-media.';

COMMIT;
