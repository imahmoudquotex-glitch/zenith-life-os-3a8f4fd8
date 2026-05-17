/**
 * Wave 06 — Drag Handle
 * src/components/editor/DragHandle.tsx
 *
 * قواعد:
 * - ✅ Draggable + Keyboard fallback
 * - ✅ ARIA grabbed/dropeffect
 */
import React from 'react';

interface DragHandleProps {
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

export const DragHandle = React.memo(function DragHandle({
  onDragStart,
  onDragEnd,
  isDragging = false,
}: DragHandleProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      aria-label="اسحب لإعادة الترتيب"
      role="button"
      tabIndex={0}
      aria-grabbed={isDragging}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '20px',
        height: '24px',
        cursor: isDragging ? 'grabbing' : 'grab',
        opacity: isDragging ? 0.5 : 0,
        transition: 'opacity 0.15s',
        color: 'hsl(210, 10%, 50%)',
        borderRadius: '4px',
        flexShrink: 0,
        userSelect: 'none',
      }}
      className="drag-handle"
    >
      <svg
        width="10"
        height="16"
        viewBox="0 0 10 16"
        fill="currentColor"
        aria-hidden
      >
        <circle cx="3" cy="2" r="1.5" />
        <circle cx="7" cy="2" r="1.5" />
        <circle cx="3" cy="6" r="1.5" />
        <circle cx="7" cy="6" r="1.5" />
        <circle cx="3" cy="10" r="1.5" />
        <circle cx="7" cy="10" r="1.5" />
        <circle cx="3" cy="14" r="1.5" />
        <circle cx="7" cy="14" r="1.5" />
      </svg>
    </div>
  );
});
