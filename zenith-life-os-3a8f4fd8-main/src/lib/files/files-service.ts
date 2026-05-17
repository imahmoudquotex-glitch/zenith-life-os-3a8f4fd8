/**
 * Wave 06 — Files Pipeline Service
 * src/lib/files/files-service.ts
 *
 * قواعد:
 * - ✅ Upload عبر signed URL فقط — لا تمر الملفات بالسيرفر
 * - ✅ MIME whitelist إجباري
 * - ✅ Per-workspace quota (5GB)
 * - ✅ Soft delete + hard delete من الـ bucket
 * - ✅ Virus scan = stub (async worker)
 * - ✅ Variants = stub (image processing worker)
 */
import { supabase } from '../auth/supabase';

export interface FileRecord {
  id: string;
  workspace_id: string;
  user_id: string;
  bucket: string;
  object_key: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  width?: number;
  height?: number;
  duration_ms?: number;
  hash_sha256?: string;
  is_processed: boolean;
  is_deleted: boolean;
  variants: Record<string, string>;
  created_at: string;
}

export interface UploadRequest {
  workspaceId: string;
  file: File;
}

export interface UploadResult {
  fileId: string;
  objectKey: string;
  publicUrl: string;
}

// ─── MIME Whitelist ───────────────────────────────────────────────────────────
const ALLOWED_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif',
  'video/mp4', 'video/webm', 'video/ogg',
  'audio/mpeg', 'audio/ogg', 'audio/wav', 'audio/webm',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv', 'text/markdown',
  'application/zip',
]);

// ─── Size limits per type ─────────────────────────────────────────────────────
const MAX_SIZE: Record<string, number> = {
  'image/': 10 * 1024 * 1024,    // 10MB
  'video/': 100 * 1024 * 1024,   // 100MB
  'audio/': 50 * 1024 * 1024,    // 50MB
  'application/pdf': 25 * 1024 * 1024, // 25MB
  'default': 25 * 1024 * 1024,   // 25MB
};

function getMaxSize(mime: string): number {
  for (const [prefix, limit] of Object.entries(MAX_SIZE)) {
    if (mime.startsWith(prefix)) return limit;
  }
  return MAX_SIZE['default'];
}

// ─── uploadFile ───────────────────────────────────────────────────────────────
/**
 * 1. Validates MIME + size
 * 2. Calls request_file_upload RPC → gets file_id + object_key
 * 3. Uploads directly to Supabase Storage bucket (signed)
 * 4. Returns file record info
 */
export async function uploadFile(req: UploadRequest): Promise<UploadResult> {
  const { workspaceId, file } = req;

  // ✅ MIME check
  if (!ALLOWED_MIMES.has(file.type)) {
    throw new Error(`MIME_NOT_ALLOWED: ${file.type}`);
  }

  // ✅ Size check
  const maxSize = getMaxSize(file.type);
  if (file.size > maxSize) {
    throw new Error(`FILE_TOO_LARGE: max ${maxSize / 1024 / 1024}MB for ${file.type}`);
  }

  // ✅ Request signed upload slot via RPC
  const { data: slot, error: rpcError } = await supabase.rpc('request_file_upload', {
    p_workspace_id: workspaceId,
    p_mime_type: file.type,
    p_size_bytes: file.size,
    p_original_name: file.name,
  });
  if (rpcError) throw rpcError;

  const { file_id: fileId, object_key: objectKey, bucket } = slot as {
    file_id: string;
    object_key: string;
    bucket: string;
  };

  // ✅ Upload directly to bucket (bypasses app server)
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(objectKey, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
  if (uploadError) throw uploadError;

  // ✅ Get public URL
  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(objectKey);

  // Mark as processed (stub — in production, worker does this after scanning)
  await supabase.rpc('mark_file_processed', { p_file_id: fileId, p_variants: {} });

  return {
    fileId,
    objectKey,
    publicUrl: urlData.publicUrl,
  };
}

// ─── deleteFile ───────────────────────────────────────────────────────────────
/**
 * 1. Soft-delete in DB
 * 2. Hard-delete from bucket (storage)
 */
export async function deleteFile(fileId: string): Promise<void> {
  // Fetch record first (need object_key + bucket)
  const { data: record, error: fetchErr } = await supabase
    .from('files')
    .select('object_key, bucket')
    .eq('id', fileId)
    .single();
  if (fetchErr) throw fetchErr;

  // Soft delete in DB
  const { error: dbErr } = await supabase.rpc('delete_file', { p_file_id: fileId });
  if (dbErr) throw dbErr;

  // Hard delete from bucket (data completely gone)
  const { error: storageErr } = await supabase.storage
    .from(record.bucket)
    .remove([record.object_key]);
  if (storageErr) {
    // Log but don't throw — DB record is already soft-deleted
    console.error('[files] Storage delete failed:', storageErr.message);
  }
}

// ─── getWorkspaceStorageUsage ─────────────────────────────────────────────────
export async function getWorkspaceStorageUsage(workspaceId: string): Promise<{
  used_bytes: number;
  quota_bytes: number;
  percent: number;
}> {
  const { data, error } = await supabase
    .from('workspace_storage_quotas')
    .select('used_bytes, quota_bytes')
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !data) {
    return { used_bytes: 0, quota_bytes: 5 * 1024 * 1024 * 1024, percent: 0 };
  }

  const percent = Math.round((data.used_bytes / data.quota_bytes) * 100);
  return { used_bytes: data.used_bytes, quota_bytes: data.quota_bytes, percent };
}

// ─── Virus Scan STUB ──────────────────────────────────────────────────────────
/**
 * STUB MODE: In production, this triggers an async worker.
 * Returns immediately (optimistic: assume clean).
 * Worker updates is_processed after real scan.
 */
export async function requestVirusScan(fileId: string): Promise<void> {
  // STUB: log and return — async worker handles this
  console.info(`[files] Virus scan requested for ${fileId} (stub — async worker)`);
}

// ─── Image Variants STUB ──────────────────────────────────────────────────────
/**
 * STUB MODE: In production, triggers image processing worker.
 * Generates: thumb (150px), medium (800px), large (1600px).
 */
export async function requestVariants(fileId: string): Promise<void> {
  console.info(`[files] Variants generation requested for ${fileId} (stub — async worker)`);
}
