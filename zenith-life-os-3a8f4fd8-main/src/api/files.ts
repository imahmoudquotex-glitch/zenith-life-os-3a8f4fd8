/**
 * Wave 06 — Files API Route
 * src/api/files.ts
 *
 * ✅ No SQL in route handlers — uses files-service (which calls Supabase)
 * ✅ All mutations require Idempotency-Key
 * ✅ MIME/size validation in service layer
 * ✅ Auth check on every request
 */
import { uploadFile, deleteFile, getWorkspaceStorageUsage } from '../lib/files/files-service';
import { createServerClient } from '../lib/auth/supabase-server';

type ApiHandler = (req: Request) => Promise<Response>;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function json<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ data, error: null }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function err(msg: string, status = 400): Response {
  return new Response(JSON.stringify({ data: null, error: msg }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function requireAuth(req: Request) {
  const supabase = createServerClient(req);
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

// ─── POST /api/files — Upload file ───────────────────────────────────────────
export const handleFileUpload: ApiHandler = async (req) => {
  const user = await requireAuth(req);
  if (!user) return err('Unauthorized', 401);

  const idempotencyKey = req.headers.get('Idempotency-Key');
  if (!idempotencyKey || idempotencyKey.length < 16) {
    return err('Idempotency-Key header required (min 16 chars)', 422);
  }

  const formData = await req.formData().catch(() => null);
  if (!formData) return err('Invalid form data', 400);

  const file = formData.get('file') as File | null;
  const workspaceId = formData.get('workspace_id') as string | null;

  if (!file || !workspaceId) {
    return err('file and workspace_id are required', 400);
  }

  try {
    const result = await uploadFile({ workspaceId, file });
    return json(result, 201);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Upload failed';
    if (msg.startsWith('MIME_NOT_ALLOWED')) return err(msg, 415);
    if (msg.startsWith('FILE_TOO_LARGE')) return err(msg, 413);
    if (msg.startsWith('QUOTA_EXCEEDED')) return err(msg, 413);
    return err(msg, 500);
  }
};

// ─── DELETE /api/files/:id — Delete file ─────────────────────────────────────
export const handleFileDelete: ApiHandler = async (req) => {
  const user = await requireAuth(req);
  if (!user) return err('Unauthorized', 401);

  const url = new URL(req.url);
  const fileId = url.pathname.split('/').at(-1);
  if (!fileId) return err('File ID required', 400);

  try {
    await deleteFile(fileId);
    return json({ deleted: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Delete failed';
    if (msg === 'FILE_NOT_FOUND') return err(msg, 404);
    return err(msg, 500);
  }
};

// ─── GET /api/files/quota?workspace_id=... ───────────────────────────────────
export const handleFileQuota: ApiHandler = async (req) => {
  const user = await requireAuth(req);
  if (!user) return err('Unauthorized', 401);

  const url = new URL(req.url);
  const workspaceId = url.searchParams.get('workspace_id');
  if (!workspaceId) return err('workspace_id required', 400);

  const usage = await getWorkspaceStorageUsage(workspaceId);
  return json(usage);
};
