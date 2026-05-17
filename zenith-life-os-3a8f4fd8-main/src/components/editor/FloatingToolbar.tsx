/**
 * Wave 06 — Floating Toolbar (selection-based formatting)
 * src/components/editor/FloatingToolbar.tsx
 */
import React, { useEffect, useRef, useState } from 'react';

interface ToolbarState { visible: boolean; x: number; y: number; }

export function FloatingToolbar() {
  const [state, setState] = useState<ToolbarState>({ visible: false, x: 0, y: 0 });

  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.toString().trim() === '') {
        setState((s) => ({ ...s, visible: false }));
        return;
      }
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setState({
        visible: true,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    }
    document.addEventListener('selectionchange', onSelectionChange);
    return () => document.removeEventListener('selectionchange', onSelectionChange);
  }, []);

  if (!state.visible) return null;

  const buttons = [
    { label: 'B', title: 'عريض', cmd: 'bold' },
    { label: 'I', title: 'مائل', cmd: 'italic' },
    { label: 'U', title: 'تسطير', cmd: 'underline' },
    { label: 'S', title: 'شطب', cmd: 'strikeThrough' },
    { label: '</>', title: 'كود مضمّن', cmd: 'insertHTML' },
  ];

  return (
    <div
      role="toolbar"
      aria-label="شريط التنسيق"
      style={{
        position: 'fixed',
        left: state.x,
        top: state.y,
        transform: 'translateX(-50%) translateY(-100%)',
        zIndex: 10000,
        display: 'flex',
        gap: '2px',
        background: 'hsl(220, 18%, 11%)',
        border: '1px solid hsl(220,15%,22%)',
        borderRadius: '6px',
        padding: '4px',
        boxShadow: '0 4px 16px hsl(0,0%,0%,0.4)',
      }}
    >
      {buttons.map((btn) => (
        <button
          key={btn.cmd}
          title={btn.title}
          aria-label={btn.title}
          onMouseDown={(e) => {
            e.preventDefault();
            document.execCommand(btn.cmd, false);
          }}
          style={{
            width: '28px', height: '28px',
            background: 'transparent',
            border: 'none',
            color: 'hsl(210,15%,85%)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {btn.label}
        </button>
      ))}
    </div>
  );
}
