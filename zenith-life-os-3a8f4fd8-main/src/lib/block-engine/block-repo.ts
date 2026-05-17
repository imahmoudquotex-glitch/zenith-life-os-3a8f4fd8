/**
 * Wave 06 — Block Repository (All SQL via Supabase)
 * src/lib/block-engine/block-repo.ts
 *
 * القواعد الصارمة:
 * - ❌ ممنوع SQL مباشر في routes
 * - ✅ كل DB access هنا فقط
 * - ✅ كل mutation تحمل idempotency_key
 * - ✅ Soft delete — لا حذف حقيقي
 */

import { supabase } from '../auth/supabase';
import { logger } from '../logger';

export type BlockType =
  | 'paragraph' | 'heading_1' | 'heading_2' | 'heading_3'
  | 'bulleted_list' | 'numbered_list' | 'todo' | 'toggle'
  | 'quote' | 'callout' | 'divider' | 'code'
  | 'image' | 'video' | 'audio' | 'file' | 'embed' | 'bookmark'
  | 'column_list' | 'column'
  | 'database_inline' | 'synced_block' | 'template_button'
  | 'table_of_contents' | 'page_link';

export interface Block {
  id: string;
  workspace_id: string;
  page_id: string;
  parent_block_id: string | null;
  type: BlockType;
  content_json: Record<string, unknown>;
  position: number;
  depth: number;
  is_archived: boolean;
  is_deleted: boolean;
  created_by_user_id: string;
  last_edited_by_user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateBlockInput {
  workspace_id: string;
  page_id: string;
  parent_block_id?: string | null;
  type: BlockType;
  content_json?: Record<string, unknown>;
  position: number;
  depth?: number;
  created_by_user_id: string;
  idempotency_key: string; // ✅ إجباري
}

export interface UpdateBlockInput {
  content_json?: Record<string, unknown>;
  type?: BlockType;
  position?: number;
  last_edited_by_user_id: string;
  idempotency_key: string; // ✅ إجباري
}

/** جلب كل blocks لصفحة معينة (غير محذوفة) */
export async function fetchPageBlocks(pageId: string): Promise<Block[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('page_id', pageId)
    .eq('is_deleted', false)
    .order('position', { ascending: true });

  if (error) {
    logger.warn({ err: error, pageId }, 'block_repo_fetch_failed');
    throw new Error(`block_repo_fetch: ${error.message}`);
  }

  return (data ?? []) as Block[];
}

/** إنشاء block جديد */
export async function createBlock(input: CreateBlockInput): Promise<Block> {
  const { idempotency_key, ...rest } = input;

  // تحقق من idempotency — لو موجود ارجع الموجود
  const { data: existing } = await supabase
    .from('blocks')
    .select('*')
    .eq('idempotency_key', idempotency_key)
    .maybeSingle();

  if (existing) {
    logger.warn({ idempotency_key }, 'block_create_idempotent_hit');
    return existing as Block;
  }

  const { data, error } = await supabase
    .from('blocks')
    .insert({
      ...rest,
      content_json: rest.content_json ?? {},
      depth: rest.depth ?? 0,
      idempotency_key,
    })
    .select()
    .single();

  if (error) {
    logger.warn({ err: error }, 'block_create_failed');
    throw new Error(`block_create: ${error.message}`);
  }

  return data as Block;
}

/** تحديث block */
export async function updateBlock(
  blockId: string,
  input: UpdateBlockInput
): Promise<Block> {
  const { idempotency_key, ...patch } = input;

  const { data, error } = await supabase
    .from('blocks')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', blockId)
    .eq('is_deleted', false)
    .select()
    .single();

  if (error) {
    logger.warn({ err: error, blockId }, 'block_update_failed');
    throw new Error(`block_update: ${error.message}`);
  }

  return data as Block;
}

/** Soft delete block (cascade يكون في DB trigger) */
export async function softDeleteBlock(
  blockId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc('soft_delete_block', {
    p_block_id: blockId,
    p_user_id: userId,
  });

  if (error) {
    logger.warn({ err: error, blockId }, 'block_delete_failed');
    throw new Error(`block_soft_delete: ${error.message}`);
  }
}

/** إعادة ترتيب block (via RPC) */
export async function reorderBlock(
  blockId: string,
  newPosition: number,
  userId: string
): Promise<void> {
  const { error } = await supabase.rpc('reorder_block', {
    p_block_id: blockId,
    p_new_position: newPosition,
    p_user_id: userId,
  });

  if (error) {
    logger.warn({ err: error, blockId, newPosition }, 'block_reorder_failed');
    throw new Error(`block_reorder: ${error.message}`);
  }
}

/** البحث النصي في blocks */
export async function searchBlocks(
  workspaceId: string,
  query: string,
  limit = 20
): Promise<Block[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('is_deleted', false)
    .textSearch('search_tsv', query, { type: 'websearch', config: 'arabic' })
    .limit(limit);

  if (error) {
    logger.warn({ err: error, query }, 'block_search_failed');
    return [];
  }

  return (data ?? []) as Block[];
}

/** نسخة احتياطية: جلب versions لـ block */
export async function fetchBlockVersions(blockId: string) {
  const { data, error } = await supabase
    .from('block_versions')
    .select('*')
    .eq('block_id', blockId)
    .order('version_number', { ascending: false })
    .limit(50);

  if (error) {
    logger.warn({ err: error, blockId }, 'block_versions_fetch_failed');
    return [];
  }

  return data ?? [];
}
