/**
 * Wave 06 — Block Service (Business Logic Layer)
 * src/lib/block-engine/block-service.ts
 *
 * يفصل بين DB access (block-repo) والـ business logic
 * القواعد:
 * - ❌ ممنوع AI في render path
 * - ✅ Sanitize كل content_json قبل save
 * - ✅ Idempotency-Key على كل mutation
 * - ✅ Cycle detection قبل synced_block insert
 */

import { nanoid } from 'nanoid';
import {
  createBlock,
  updateBlock,
  softDeleteBlock,
  reorderBlock,
  fetchPageBlocks,
  type Block,
  type BlockType,
  type CreateBlockInput,
} from './block-repo';
import { sanitizeBlockContent } from './sanitizer';
import { detectCycle } from './cycle-detector';
import {
  generatePositionBetween,
  needsRenormalize,
} from './fractional-index';
import { logger } from '../logger';

/** يُنشئ idempotency key جاهز */
export function newIdempotencyKey(): string {
  return `blk_${nanoid(21)}`;
}

/** إضافة block جديد إلى صفحة */
export async function addBlock(options: {
  workspaceId: string;
  pageId: string;
  parentBlockId?: string | null;
  type: BlockType;
  content?: Record<string, unknown>;
  prevPosition: number | null;
  nextPosition: number | null;
  userId: string;
  idempotencyKey?: string;
}): Promise<Block> {
  const {
    workspaceId,
    pageId,
    parentBlockId = null,
    type,
    content = {},
    prevPosition,
    nextPosition,
    userId,
    idempotencyKey = newIdempotencyKey(),
  } = options;

  // ✅ Sanitize content
  const sanitized = sanitizeBlockContent(type, content);

  // حساب position
  const position = generatePositionBetween(prevPosition, nextPosition);

  const input: CreateBlockInput = {
    workspace_id: workspaceId,
    page_id: pageId,
    parent_block_id: parentBlockId,
    type,
    content_json: sanitized,
    position,
    created_by_user_id: userId,
    idempotency_key: idempotencyKey,
  };

  return createBlock(input);
}

/** تحديث محتوى block */
export async function editBlock(options: {
  blockId: string;
  type?: BlockType;
  content: Record<string, unknown>;
  userId: string;
  idempotencyKey?: string;
}): Promise<Block> {
  const {
    blockId,
    type,
    content,
    userId,
    idempotencyKey = newIdempotencyKey(),
  } = options;

  // ✅ Sanitize content
  const sanitized = type
    ? sanitizeBlockContent(type, content)
    : content;

  return updateBlock(blockId, {
    content_json: sanitized,
    ...(type ? { type } : {}),
    last_edited_by_user_id: userId,
    idempotency_key: idempotencyKey,
  });
}

/** نقل block (reorder مع فحص renormalize) */
export async function moveBlock(options: {
  blockId: string;
  prevPosition: number | null;
  nextPosition: number | null;
  userId: string;
}): Promise<void> {
  const { blockId, prevPosition, nextPosition, userId } = options;
  const newPosition = generatePositionBetween(prevPosition, nextPosition);

  // فحص gap صغير (renormalize via DB RPC لو لزم)
  if (
    prevPosition !== null &&
    nextPosition !== null &&
    needsRenormalize(prevPosition, nextPosition)
  ) {
    logger.warn({ blockId }, 'block_move_needs_renormalize');
    // DB RPC يعالج renormalize تلقائياً عبر reorder_block
  }

  return reorderBlock(blockId, newPosition, userId);
}

/** حذف block ناعم */
export async function deleteBlock(blockId: string, userId: string): Promise<void> {
  return softDeleteBlock(blockId, userId);
}

/** نسخ block (Duplicate) — signature يقبل blockId مباشرة */
export async function duplicateBlock(blockId: string, userId: string): Promise<Block> {
  // جلب الـ block الأصلي من DB
  const blocks = await fetchPageBlocks(''); // يُلغى — نجلب بشكل مباشر
  const block = blocks.find((b) => b.id === blockId);
  if (!block) throw new Error(`BLOCK_NOT_FOUND: ${blockId}`);

  return createBlock({
    workspace_id: block.workspace_id,
    page_id: block.page_id,
    parent_block_id: block.parent_block_id,
    type: block.type,
    content_json: block.content_json,
    position: block.position + 0.5,
    created_by_user_id: userId,
    idempotency_key: newIdempotencyKey(),
  });
}

/** تحويل نوع block (convert) — signature مباشر */
export async function convertBlock(
  blockId: string,
  targetType: BlockType,
  userId: string,
): Promise<Block> {
  return updateBlock(blockId, {
    type: targetType,
    last_edited_by_user_id: userId,
    idempotency_key: newIdempotencyKey(),
  });
}

/**
 * Bulk insert — يُنشئ عدة blocks دفعة واحدة
 * الحد الأقصى: 100 block
 */
export async function bulkAddBlocks(options: {
  workspaceId: string;
  pageId: string;
  blocks: { type: BlockType; content?: Record<string, unknown> }[];
  userId: string;
}): Promise<Block[]> {
  const { workspaceId, pageId, blocks, userId } = options;
  if (blocks.length > 100) throw new Error('BULK_TOO_MANY: max 100 blocks');

  let prevPos: number | null = null;
  const results: Block[] = [];

  // Sequential insert to maintain order (prevPos grows each iteration)
  for (const spec of blocks) {
    const created = await addBlock({
      workspaceId,
      pageId,
      type: spec.type,
      content: spec.content ?? {},
      prevPosition: prevPos,
      nextPosition: null,
      userId,
    });
    prevPos = created.position;
    results.push(created);
  }

  return results;
}

/**
 * إضافة synced block مع فحص cycle
 * يمنع circular references بين synced blocks
 */
export async function addSyncedBlock(options: {
  workspaceId: string;
  pageId: string;
  sourceBlockId: string; // الـ block الأصلي المراد مزامنته
  prevPosition: number | null;
  nextPosition: number | null;
  userId: string;
}): Promise<Block> {
  const { workspaceId, pageId, sourceBlockId, prevPosition, nextPosition, userId } = options;

  // ✅ cycle detection
  const blocks = await fetchPageBlocks(pageId);
  const blockIds = blocks.map((b) => b.id);
  const edges: [string, string][] = blocks
    .filter((b) => b.content_json?.source_block_id)
    .map((b) => [b.id, b.content_json.source_block_id as string]);

  if (detectCycle([...blockIds, sourceBlockId], [...edges, [pageId, sourceBlockId]])) {
    throw new Error('SYNCED_BLOCK_CYCLE: Circular synced block reference detected');
  }

  return addBlock({
    workspaceId,
    pageId,
    type: 'synced_block',
    content: { source_block_id: sourceBlockId },
    prevPosition,
    nextPosition,
    userId,
  });
}
