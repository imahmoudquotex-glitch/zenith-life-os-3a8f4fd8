/**
 * Wave 06 — Page Cover + Icon + Title Editable
 * src/components/editor/PageHeader.tsx
 *
 * قواعد:
 * - ✅ Title editable في مكانه (contenteditable)
 * - ✅ Cover image قابل للتغيير
 * - ✅ Icon (emoji أو custom) قابل للتغيير
 * - ✅ RTL-aware
 * - ✅ autosave debounced 500ms
 */
import React, { useCallback, useRef, useState } from 'react';
import { uploadFile } from '../../lib/files/files-service';

interface PageHeaderProps {
  pageId: string;
  workspaceId: string;
  title: string;
  icon?: string;
  coverUrl?: string;
  onTitleChange: (title: string) => void;
  onIconChange: (icon: string) => void;
  onCoverChange: (url: string) => void;
}

const EMOJI_LIST = ['📝', '📚', '💡', '🎯', '🔥', '✨', '🚀', '🌟', '💎', '🎨', '🧠', '⚡'];

export const PageHeader = React.memo(function PageHeader({
  pageId,
  workspaceId,
  title,
  icon,
  coverUrl,
  onTitleChange,
  onIconChange,
  onCoverChange,
}: PageHeaderProps) {
  const titleRef = useRef<HTMLDivElement>(null);
  const titleTimer = useRef<ReturnType<typeof setTimeout>>();
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [coverLoading, setCoverLoading] = useState(false);

  // ─── Title ───────────────────────────────────────────────────────────────
  const handleTitleInput = useCallback(() => {
    if (!titleRef.current) return;
    const newTitle = titleRef.current.innerText.trim();
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => onTitleChange(newTitle), 500);
  }, [onTitleChange]);

  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Enter → move to first block
    if (e.key === 'Enter') {
      e.preventDefault();
      document.getElementById('block-editor-area')?.focus();
    }
  }, []);

  // ─── Cover ───────────────────────────────────────────────────────────────
  const handleCoverUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverLoading(true);
    try {
      const result = await uploadFile({ workspaceId, file });
      onCoverChange(result.publicUrl);
    } catch (err) {
      console.error('[cover] Upload failed:', err);
    } finally {
      setCoverLoading(false);
      e.target.value = '';
    }
  }, [workspaceId, onCoverChange]);

  return (
    <div style={{ width: '100%' }} dir="auto">
      {/* Cover Image */}
      {coverUrl && (
        <div style={{ position: 'relative', width: '100%', height: '200px', overflow: 'hidden', marginBottom: '1rem' }}>
          <img
            src={coverUrl}
            alt="غلاف الصفحة"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <label
            style={{
              position: 'absolute', bottom: '0.75rem', insetInlineEnd: '0.75rem',
              background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.3rem 0.6rem',
              borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
            }}
            aria-label="تغيير الغلاف"
          >
            {coverLoading ? '...' : 'تغيير الغلاف'}
            <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
          </label>
        </div>
      )}

      <div style={{ padding: '0 2rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Icon + Add Cover Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {/* Icon Picker */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowIconPicker(!showIconPicker)}
              aria-label="تغيير الأيقونة"
              title="تغيير الأيقونة"
              style={{
                fontSize: '28px', background: 'transparent', border: 'none',
                cursor: 'pointer', padding: '4px', borderRadius: '6px',
                lineHeight: 1,
              }}
            >
              {icon ?? '📝'}
            </button>
            {showIconPicker && (
              <div
                style={{
                  position: 'absolute', top: '100%', insetInlineStart: 0, zIndex: 100,
                  background: '#1F2937', border: '1px solid #374151', borderRadius: '10px',
                  padding: '0.5rem', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
                }}
                role="listbox"
                aria-label="اختر أيقونة"
              >
                {EMOJI_LIST.map((emoji) => (
                  <button
                    key={emoji}
                    role="option"
                    aria-selected={icon === emoji}
                    onClick={() => { onIconChange(emoji); setShowIconPicker(false); }}
                    style={{
                      fontSize: '20px', background: icon === emoji ? '#374151' : 'transparent',
                      border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '4px',
                    }}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Add Cover Button (if no cover) */}
          {!coverUrl && (
            <label
              style={{
                color: '#6B7280', fontSize: '13px', cursor: 'pointer',
                padding: '0.2rem 0.5rem', borderRadius: '4px',
                border: '1px solid transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#9CA3AF'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
              aria-label="إضافة غلاف"
            >
              + إضافة غلاف
              <input type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
            </label>
          )}
        </div>

        {/* Title */}
        <div
          ref={titleRef}
          contentEditable
          suppressContentEditableWarning
          role="heading"
          aria-level={1}
          aria-label="عنوان الصفحة"
          id="page-title"
          onInput={handleTitleInput}
          onKeyDown={handleTitleKeyDown}
          data-placeholder="عنوان بدون عنوان..."
          style={{
            fontSize: 'clamp(24px, 4vw, 36px)',
            fontWeight: 700,
            color: '#F9FAFB',
            outline: 'none',
            minHeight: '1.2em',
            lineHeight: 1.25,
            wordBreak: 'break-word',
            marginBottom: '0.5rem',
            cursor: 'text',
          }}
          suppressHydrationWarning
        >
          {title || ''}
        </div>
      </div>

      <style>{`
        [contenteditable]:empty::before {
          content: attr(data-placeholder);
          color: #4B5563;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
});
