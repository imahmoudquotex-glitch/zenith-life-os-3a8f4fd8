/**
 * Wave 06 — Blocks API Routes
 * src/api/blocks.ts
 *
 * قواعد:
 * - ✅ كل route يشترط Idempotency-Key
 * - ✅ لا SQL في الـ route نفسه — يمر عبر block-service
 * - ✅ Auth guard على كل endpoint
 * - ✅ Rate limit بسيط (W07 يوسعه)
 */
import { supabase } from '../lib/auth/supabase';
import {
  addBlock,
  editBlock,
  deleteBlock,
  moveBlock,
  duplicateBlock,
  convertBlock,
  bulkAddBlocks,
} from '../lib/block-engine/block-service';
import type { BlockType } from '../lib/block-engine/block-repo';

type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code: string };

/** Authenticate request — returns userId or throws */
async function requireAuth(req: Request): Promise<string> {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  if (!token) throw new ApiError('غير مصرح', 'UNAUTHORIZED', 401);
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) throw new ApiError('غير مصرح', 'UNAUTHORIZED', 401);
  return data.user.id;
}

/** Require Idempotency-Key header */
function requireIdempotencyKey(req: Request): string {
  const key = req.headers.get('Idempotency-Key');
  if (!key || key.length < 16) throw new ApiError('Idempotency-Key مفقود أو قصير', 'MISSING_IDEMPOTENCY_KEY', 400);
  return key;
}

class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

function json<T>(data: ApiResponse<T>, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function errorResponse(err: unknown): Response {
  if (err instanceof ApiError) {
    return json({ ok: false, error: err.message, code: err.code }, err.status);
  }
  return json({ ok: false, error: 'خطأ داخلي في الخادم', code: 'INTERNAL' }, 500);
}

// ─────────────────────────────────────────
// POST /api/blocks
// ─────────────────────────────────────────
export async function createBlockHandler(req: Request): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const body = await req.json() as {
      workspaceId: string;
      pageId: string;
      type: BlockType;
      prevPosition?: number | null;
      nextPosition?: number | null;
      content?: Record<string, unknown>;
    };
    if (!body.workspaceId || !body.pageId || !body.type) {
      throw new ApiError('workspaceId و pageId و type إجباريون', 'INVALID_PARAMS');
    }
    const block = await addBlock({
      workspaceId: body.workspaceId,
      pageId: body.pageId,
      type: body.type,
      prevPosition: body.prevPosition ?? null,
      nextPosition: body.nextPosition ?? null,
      userId,
      content: body.content,
    });
    return json({ ok: true, data: block }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// PATCH /api/blocks/:id
// ─────────────────────────────────────────
export async function updateBlockHandler(req: Request, blockId: string): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const body = await req.json() as { content: Record<string, unknown> };
    if (!body.content) throw new ApiError('content إجباري', 'INVALID_PARAMS');
    const block = await editBlock({ blockId, content: body.content, userId });
    return json({ ok: true, data: block });
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// DELETE /api/blocks/:id
// ─────────────────────────────────────────
export async function deleteBlockHandler(req: Request, blockId: string): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    await deleteBlock(blockId, userId);
    return json({ ok: true, data: null }, 200);
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// PATCH /api/blocks/:id/reorder
// ─────────────────────────────────────────
export async function reorderBlockHandler(req: Request, blockId: string): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const body = await req.json() as {
      prevPosition: number | null;
      nextPosition: number | null;
    };
    const block = await moveBlock({ blockId, prevPosition: body.prevPosition, nextPosition: body.nextPosition, userId });
    return json({ ok: true, data: block });
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// POST /api/blocks/:id/duplicate
// ─────────────────────────────────────────
export async function duplicateBlockHandler(req: Request, blockId: string): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const block = await duplicateBlock(blockId, userId);
    return json({ ok: true, data: block }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// POST /api/blocks/:id/convert
// ─────────────────────────────────────────
export async function convertBlockHandler(req: Request, blockId: string): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const body = await req.json() as { targetType: BlockType };
    if (!body.targetType) throw new ApiError('targetType إجباري', 'INVALID_PARAMS');
    const block = await convertBlock(blockId, body.targetType, userId);
    return json({ ok: true, data: block });
  } catch (e) {
    return errorResponse(e);
  }
}

// ─────────────────────────────────────────
// POST /api/blocks/bulk
// ─────────────────────────────────────────
export async function bulkBlocksHandler(req: Request): Promise<Response> {
  try {
    const userId = await requireAuth(req);
    requireIdempotencyKey(req);
    const body = await req.json() as {
      workspaceId: string;
      pageId: string;
      blocks: { type: BlockType; content?: Record<string, unknown> }[];
    };
    if (!body.workspaceId || !body.pageId || !Array.isArray(body.blocks)) {
      throw new ApiError('workspaceId و pageId و blocks إجباريون', 'INVALID_PARAMS');
    }
    if (body.blocks.length > 100) throw new ApiError('الحد الأقصى 100 كتلة في bulk', 'TOO_MANY_BLOCKS');
    const created = await bulkAddBlocks({
      workspaceId: body.workspaceId,
      pageId: body.pageId,
      blocks: body.blocks,
      userId,
    });
    return json({ ok: true, data: created }, 201);
  } catch (e) {
    return errorResponse(e);
  }
}
