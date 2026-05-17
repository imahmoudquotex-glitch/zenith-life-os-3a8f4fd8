/**
 * Wave 06 — use-block-dnd hook
 * src/lib/block-engine/hooks/use-block-dnd.ts
 *
 * قواعد:
 * - ✅ Native HTML5 drag-and-drop
 * - ✅ يحدث الـ position عبر block-service
 * - ✅ Visual feedback (drop indicator)
 */
import { useCallback, useState, useRef } from 'react';
import type { Block } from '../block-repo';

interface UseBlockDndOptions {
  onReorder: (draggedId: string, prevId: string | null, nextId: string | null) => void;
}

export function useBlockDnd({ onReorder }: UseBlockDndOptions) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below');
  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (e: React.DragEvent, blockId: string) => {
      setDraggedId(blockId);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', blockId);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDropTargetId(null);
    dragCounter.current = 0;
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, blockId: string) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDropTargetId(blockId);
      // Determine above/below from mouse position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const midY = rect.top + rect.height / 2;
      setDropPosition(e.clientY < midY ? 'above' : 'below');
    },
    [],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, blocks: Block[], targetBlockId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData('text/plain') || draggedId;
      if (!sourceId || sourceId === targetBlockId) {
        handleDragEnd();
        return;
      }

      const targetIdx = blocks.findIndex((b) => b.id === targetBlockId);
      const insertIdx = dropPosition === 'above' ? targetIdx : targetIdx + 1;

      // Compute prev/next
      const prevBlock = insertIdx > 0 ? blocks[insertIdx - 1] : null;
      const nextBlock = insertIdx < blocks.length ? blocks[insertIdx] : null;

      // Skip if inserting adjacent to itself
      const sourceIdx = blocks.findIndex((b) => b.id === sourceId);
      if (sourceIdx === insertIdx || sourceIdx + 1 === insertIdx) {
        handleDragEnd();
        return;
      }

      onReorder(sourceId, prevBlock?.id ?? null, nextBlock?.id ?? null);
      handleDragEnd();
    },
    [draggedId, dropPosition, handleDragEnd, onReorder],
  );

  return {
    draggedId,
    dropTargetId,
    dropPosition,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}
