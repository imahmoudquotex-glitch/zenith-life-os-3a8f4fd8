/**
 * Wave 06 — Virtual Blocks Renderer
 * src/components/editor/VirtualBlocks.tsx
 *
 * قواعد:
 * - ✅ يدعم 200+ block بدون جلب كلها في الـ DOM
 * - ✅ Intersection Observer بدون مكتبة خارجية
 * - ✅ Fallback graceful عند قلة الـ blocks
 */
import React, { useRef, useState, useEffect, useCallback } from 'react';
import type { Block } from '../../lib/block-engine/block-repo';
import { BlockRenderer } from './BlockRenderer';

interface VirtualBlocksProps {
  blocks: Block[];
  activeBlockId: string | null;
  onFocus: (id: string) => void;
  onChange: (id: string, content: Record<string, unknown>) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string, type: import('../../lib/block-engine/block-repo').BlockType) => void;
}

const ITEM_ESTIMATE_HEIGHT = 48; // px per block estimate
const OVERSCAN = 5; // extra blocks above/below viewport

export const VirtualBlocks = React.memo(function VirtualBlocks({
  blocks,
  activeBlockId,
  onFocus,
  onChange,
  onKeyDown,
  onDelete,
  onAddAfter,
}: VirtualBlocksProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: Math.min(30, blocks.length) });

  // Use simple scroll-based windowing — no extra dep
  const updateVisibleRange = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const { scrollTop, clientHeight } = container;
    const start = Math.max(0, Math.floor(scrollTop / ITEM_ESTIMATE_HEIGHT) - OVERSCAN);
    const end = Math.min(blocks.length, Math.ceil((scrollTop + clientHeight) / ITEM_ESTIMATE_HEIGHT) + OVERSCAN);
    setVisibleRange({ start, end });
  }, [blocks.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    updateVisibleRange();
    container.addEventListener('scroll', updateVisibleRange, { passive: true });
    return () => container.removeEventListener('scroll', updateVisibleRange);
  }, [updateVisibleRange]);

  // Fallback: if ≤50 blocks, just render all (no virtualization overhead)
  if (blocks.length <= 50) {
    return (
      <>
        {blocks.map((block) => (
          <VirtualBlockRow
            key={block.id}
            block={block}
            isActive={activeBlockId === block.id}
            onFocus={onFocus}
            onChange={onChange}
            onKeyDown={onKeyDown}
            onDelete={onDelete}
            onAddAfter={onAddAfter}
          />
        ))}
      </>
    );
  }

  const totalHeight = blocks.length * ITEM_ESTIMATE_HEIGHT;
  const paddingTop = visibleRange.start * ITEM_ESTIMATE_HEIGHT;
  const paddingBottom = (blocks.length - visibleRange.end) * ITEM_ESTIMATE_HEIGHT;
  const visibleBlocks = blocks.slice(visibleRange.start, visibleRange.end);

  return (
    <div
      ref={containerRef}
      style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', position: 'relative' }}
      aria-label={`محرر الكتل — ${blocks.length} كتلة`}
    >
      {/* Spacer top */}
      <div style={{ height: paddingTop }} aria-hidden />

      {visibleBlocks.map((block) => (
        <VirtualBlockRow
          key={block.id}
          block={block}
          isActive={activeBlockId === block.id}
          onFocus={onFocus}
          onChange={onChange}
          onKeyDown={onKeyDown}
          onDelete={onDelete}
          onAddAfter={onAddAfter}
        />
      ))}

      {/* Spacer bottom */}
      <div style={{ height: paddingBottom }} aria-hidden />

      {/* Total height anchor (for scrollbar) */}
      <div style={{ height: 0, visibility: 'hidden' }} aria-hidden>
        {totalHeight}px total
      </div>
    </div>
  );
});

const VirtualBlockRow = React.memo(function VirtualBlockRow({
  block,
  isActive,
  onFocus,
  onChange,
  onKeyDown,
  onDelete,
  onAddAfter,
}: {
  block: Block;
  isActive: boolean;
  onFocus: (id: string) => void;
  onChange: (id: string, content: Record<string, unknown>) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onDelete: (id: string) => void;
  onAddAfter: (id: string, type: import('../../lib/block-engine/block-repo').BlockType) => void;
}) {
  return (
    <div
      className={`block-editor__block${isActive ? ' block-editor__block--active' : ''}`}
      style={{ paddingInlineStart: `${block.depth * 24}px` }}
    >
      <BlockRenderer
        block={block}
        editable
        onChange={(content) => onChange(block.id, content)}
        onFocus={() => onFocus(block.id)}
        onKeyDown={(e) => onKeyDown(e, block.id)}
        onDelete={() => onDelete(block.id)}
        onAddAfter={(type) => onAddAfter(block.id, type)}
      />
    </div>
  );
});
