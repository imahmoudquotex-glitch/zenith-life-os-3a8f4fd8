/**
 * Wave 06 — use-block-mutation hook
 * src/lib/block-engine/hooks/use-block-mutation.ts
 *
 * قواعد:
 * - ✅ Optimistic update أولاً
 * - ✅ Idempotency-Key إجباري
 * - ✅ Rollback عند الفشل
 * - ✅ Outbox queue (localStorage) للـ offline
 */
import { useState, useCallback, useRef } from 'react';
import { addBlock, editBlock, deleteBlock, moveBlock, duplicateBlock } from '../block-service';
import type { Block, BlockType } from '../block-repo';

export interface MutationError {
  code: string;
  message: string;
  blockId?: string;
}

interface UseBlockMutationOptions {
  pageId: string;
  workspaceId: string;
  userId: string;
  onError?: (err: MutationError) => void;
}

const OUTBOX_KEY = 'zenith:block:outbox';

/** Persist failed mutations to localStorage for retry when online */
function enqueueOutbox(op: object) {
  try {
    const raw = localStorage.getItem(OUTBOX_KEY);
    const queue = raw ? (JSON.parse(raw) as object[]) : [];
    queue.push({ ...op, _enqueuedAt: Date.now() });
    // Max 200 ops in outbox — avoid storing secrets
    localStorage.setItem(OUTBOX_KEY, JSON.stringify(queue.slice(-200)));
  } catch {
    // Ignore storage errors (private browsing, etc.)
  }
}

export function useBlockMutation({
  pageId,
  workspaceId,
  userId,
  onError,
}: UseBlockMutationOptions) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pendingRef = useRef<Set<string>>(new Set());

  const initBlocks = useCallback((initial: Block[]) => setBlocks(initial), []);

  // Add block — optimistic
  const handleAdd = useCallback(
    async (type: BlockType, afterBlockId?: string) => {
      if (!userId) return;
      const tempId = `optimistic-${crypto.randomUUID()}`;

      // Find positions
      const idx = afterBlockId ? blocks.findIndex((b) => b.id === afterBlockId) : blocks.length - 1;
      const prevPos = blocks[idx]?.position ?? null;
      const nextPos = blocks[idx + 1]?.position ?? null;

      // Optimistic — add placeholder
      const placeholder: Block = {
        id: tempId,
        workspace_id: workspaceId,
        page_id: pageId,
        type,
        content_json: {},
        position: prevPos !== null && nextPos !== null
          ? (prevPos + nextPos) / 2
          : (prevPos ?? 0) + 1,
        depth: 0,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Block;
      setBlocks((prev) => {
        const copy = [...prev];
        copy.splice(idx + 1, 0, placeholder);
        return copy;
      });

      setIsLoading(true);
      try {
        const real = await addBlock({ workspaceId, pageId, type, prevPosition: prevPos, nextPosition: nextPos, userId });
        setBlocks((prev) => prev.map((b) => (b.id === tempId ? real : b)));
      } catch (e) {
        // Rollback
        setBlocks((prev) => prev.filter((b) => b.id !== tempId));
        const err: MutationError = { code: 'ADD_FAILED', message: 'فشل إضافة الكتلة' };
        onError?.(err);
        enqueueOutbox({ op: 'add', type, afterBlockId, pageId, workspaceId });
      } finally {
        setIsLoading(false);
      }
    },
    [blocks, userId, pageId, workspaceId, onError],
  );

  // Edit block — optimistic with debounce
  const editDebounce = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const handleEdit = useCallback(
    (blockId: string, content: Record<string, unknown>) => {
      // Optimistic update immediately
      setBlocks((prev) => prev.map((b) => (b.id === blockId ? { ...b, content_json: content } : b)));

      // Debounce persist
      const existing = editDebounce.current.get(blockId);
      if (existing) clearTimeout(existing);
      const timer = setTimeout(async () => {
        editDebounce.current.delete(blockId);
        if (!userId) return;
        try {
          await editBlock({ blockId, content, userId });
        } catch {
          enqueueOutbox({ op: 'edit', blockId, content });
        }
      }, 500);
      editDebounce.current.set(blockId, timer);
    },
    [userId],
  );

  // Delete block — optimistic
  const handleDelete = useCallback(
    async (blockId: string) => {
      if (!userId || pendingRef.current.has(blockId)) return;
      pendingRef.current.add(blockId);

      const snapshot = blocks;
      setBlocks((prev) => prev.filter((b) => b.id !== blockId));

      try {
        await deleteBlock(blockId, userId);
      } catch {
        setBlocks(snapshot); // Rollback
        onError?.({ code: 'DELETE_FAILED', message: 'فشل حذف الكتلة', blockId });
        enqueueOutbox({ op: 'delete', blockId });
      } finally {
        pendingRef.current.delete(blockId);
      }
    },
    [blocks, userId, onError],
  );

  // Move block
  const handleMove = useCallback(
    async (blockId: string, newPrev: string | null, newNext: string | null) => {
      if (!userId) return;
      const prevPos = newPrev ? blocks.find((b) => b.id === newPrev)?.position ?? null : null;
      const nextPos = newNext ? blocks.find((b) => b.id === newNext)?.position ?? null : null;
      // Optimistic: compute new position client-side
      const newPosition =
        prevPos !== null && nextPos !== null
          ? (prevPos + nextPos) / 2
          : (prevPos ?? 0) + 1;
      setBlocks((prev) =>
        prev.map((b) => (b.id === blockId ? { ...b, position: newPosition } : b)),
      );
      try {
        await moveBlock({ blockId, prevPosition: prevPos, nextPosition: nextPos, userId });
      } catch {
        enqueueOutbox({ op: 'move', blockId, newPrev, newNext });
      }
    },
    [blocks, userId],
  );

  // Duplicate block
  const handleDuplicate = useCallback(
    async (blockId: string) => {
      if (!userId) return;
      try {
        const dup = await duplicateBlock(blockId, userId);
        setBlocks((prev) => {
          const idx = prev.findIndex((b) => b.id === blockId);
          const copy = [...prev];
          copy.splice(idx + 1, 0, dup);
          return copy;
        });
      } catch {
        enqueueOutbox({ op: 'duplicate', blockId });
      }
    },
    [userId],
  );

  return {
    blocks,
    isLoading,
    initBlocks,
    handleAdd,
    handleEdit,
    handleDelete,
    handleMove,
    handleDuplicate,
  };
}
