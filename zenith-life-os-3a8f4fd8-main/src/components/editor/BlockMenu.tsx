/**
 * Wave 06 — Block Context Menu
 * src/components/editor/BlockMenu.tsx
 *
 * قواعد:
 * - ❌ ممنوع AI في render path
 * - ✅ Keyboard accessible
 * - ✅ RTL-aware
 */
import React, { useCallback, useEffect, useRef } from 'react';
import type { BlockType } from '../../lib/block-engine/block-repo';

interface BlockMenuProps {
  onDelete: () => void;
  onDuplicate: () => void;
  onConvert: (type: BlockType) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
}

const CONVERT_OPTIONS: { label: string; type: BlockType }[] = [
  { label: 'فقرة', type: 'paragraph' },
  { label: 'عنوان 1', type: 'heading_1' },
  { label: 'عنوان 2', type: 'heading_2' },
  { label: 'عنوان 3', type: 'heading_3' },
  { label: 'قائمة نقطية', type: 'bulleted_list' },
  { label: 'قائمة مرقمة', type: 'numbered_list' },
  { label: 'مهمة', type: 'todo' },
  { label: 'اقتباس', type: 'quote' },
  { label: 'تنبيه', type: 'callout' },
  { label: 'كود', type: 'code' },
];

export const BlockMenu = React.memo(function BlockMenu({
  onDelete,
  onDuplicate,
  onConvert,
  onMoveUp,
  onMoveDown,
  onClose,
}: BlockMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showConvert, setShowConvert] = React.useState(false);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleConvert = useCallback(
    (type: BlockType) => {
      onConvert(type);
      onClose();
    },
    [onConvert, onClose],
  );

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="قائمة الكتلة"
      dir="rtl"
      style={{
        position: 'absolute',
        top: '100%',
        insetInlineStart: 0,
        zIndex: 200,
        background: 'hsl(220, 16%, 14%)',
        border: '1px solid hsl(220, 16%, 22%)',
        borderRadius: '10px',
        padding: '6px',
        minWidth: '180px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
      }}
    >
      <MenuItem icon="↑" label="نقل لأعلى" onClick={onMoveUp} />
      <MenuItem icon="↓" label="نقل لأسفل" onClick={onMoveDown} />
      <Divider />
      <MenuItem icon="⧉" label="نسخ" onClick={() => { onDuplicate(); onClose(); }} />
      <div style={{ position: 'relative' }}>
        <MenuItem
          icon="⇄"
          label="تحويل إلى..."
          onClick={() => setShowConvert((s) => !s)}
          hasSubmenu
        />
        {showConvert && (
          <div
            role="menu"
            aria-label="تحويل الكتلة إلى"
            style={{
              position: 'absolute',
              insetInlineEnd: '100%',
              top: 0,
              background: 'hsl(220, 16%, 14%)',
              border: '1px solid hsl(220, 16%, 22%)',
              borderRadius: '10px',
              padding: '6px',
              minWidth: '150px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            {CONVERT_OPTIONS.map((opt) => (
              <MenuItem
                key={opt.type}
                label={opt.label}
                onClick={() => handleConvert(opt.type)}
              />
            ))}
          </div>
        )}
      </div>
      <Divider />
      <MenuItem icon="🗑" label="حذف" onClick={() => { onDelete(); onClose(); }} danger />
    </div>
  );
});

function MenuItem({
  icon,
  label,
  onClick,
  danger = false,
  hasSubmenu = false,
}: {
  icon?: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
  hasSubmenu?: boolean;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        background: 'transparent',
        border: 'none',
        borderRadius: '6px',
        color: danger ? '#EF4444' : 'hsl(210, 15%, 80%)',
        cursor: 'pointer',
        fontSize: '13px',
        textAlign: 'start',
        width: '100%',
        transition: 'background 0.1s',
        justifyContent: 'space-between',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'hsl(220,16%,20%)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {icon && <span aria-hidden style={{ fontSize: '14px' }}>{icon}</span>}
        {label}
      </span>
      {hasSubmenu && <span aria-hidden style={{ opacity: 0.5, fontSize: '11px' }}>◀</span>}
    </button>
  );
}

function Divider() {
  return (
    <div
      role="separator"
      style={{
        height: '1px',
        background: 'hsl(220,16%,22%)',
        margin: '4px 0',
      }}
    />
  );
}
