/**
 * Wave 06 — use-block-history hook (local undo/redo)
 * src/lib/block-engine/hooks/use-block-history.ts
 *
 * قواعد:
 * - ✅ undo/redo على مستوى الـ block tree
 * - ✅ Max 50 steps في الـ history
 * - ✅ لا يخزن secrets في history
 */
import { useCallback, useRef, useState } from 'react';
import type { Block } from '../block-repo';

const MAX_HISTORY = 50;

interface HistoryEntry {
  blocks: Block[];
  description: string;
  timestamp: number;
}

export function useBlockHistory(initialBlocks: Block[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const historyRef = useRef<HistoryEntry[]>([
    { blocks: initialBlocks, description: 'حالة أولية', timestamp: Date.now() },
  ]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < historyRef.current.length - 1;
  const currentBlocks = historyRef.current[currentIndex]?.blocks ?? initialBlocks;

  /** Push a new state to history */
  const push = useCallback(
    (blocks: Block[], description = '') => {
      const entry: HistoryEntry = { blocks: [...blocks], description, timestamp: Date.now() };
      // Truncate any forward history
      historyRef.current = historyRef.current.slice(0, currentIndex + 1);
      historyRef.current.push(entry);
      // Limit size
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current.shift();
      } else {
        setCurrentIndex((i) => i + 1);
      }
    },
    [currentIndex],
  );

  const undo = useCallback((): Block[] | null => {
    if (!canUndo) return null;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return historyRef.current[newIndex]?.blocks ?? null;
  }, [canUndo, currentIndex]);

  const redo = useCallback((): Block[] | null => {
    if (!canRedo) return null;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return historyRef.current[newIndex]?.blocks ?? null;
  }, [canRedo, currentIndex]);

  const reset = useCallback((blocks: Block[]) => {
    historyRef.current = [{ blocks: [...blocks], description: 'reset', timestamp: Date.now() }];
    setCurrentIndex(0);
  }, []);

  return { currentBlocks, push, undo, redo, reset, canUndo, canRedo };
}
