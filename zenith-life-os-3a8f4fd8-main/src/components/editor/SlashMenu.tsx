/**
 * Wave 06 — Slash Menu (cmdk-style)
 * src/components/editor/SlashMenu.tsx
 * Performance: < 100ms open time
 */
import React, { useMemo, useRef, useEffect } from 'react';
import type { BlockType } from '../../lib/block-engine/block-repo';

interface SlashItem { label: string; type: BlockType; icon: string; description: string; keywords: string[]; }

const SLASH_ITEMS: SlashItem[] = [
  { label: 'نص عادي', type: 'paragraph', icon: '¶', description: 'فقرة نصية', keywords: ['نص', 'p', 'text', 'paragraph'] },
  { label: 'عنوان 1', type: 'heading_1', icon: 'H1', description: 'عنوان رئيسي كبير', keywords: ['h1', 'عنوان', 'heading'] },
  { label: 'عنوان 2', type: 'heading_2', icon: 'H2', description: 'عنوان ثانوي', keywords: ['h2', 'عنوان'] },
  { label: 'عنوان 3', type: 'heading_3', icon: 'H3', description: 'عنوان ثالثي', keywords: ['h3'] },
  { label: 'قائمة نقطية', type: 'bulleted_list', icon: '•', description: 'قائمة بالنقاط', keywords: ['ul', 'list', 'قائمة', 'نقطة'] },
  { label: 'قائمة مرقّمة', type: 'numbered_list', icon: '1.', description: 'قائمة مرقّمة', keywords: ['ol', 'رقم', 'ordered'] },
  { label: 'مهمة', type: 'todo', icon: '☐', description: 'عنصر قابل للإنجاز', keywords: ['todo', 'task', 'مهمة', 'check'] },
  { label: 'اقتباس', type: 'quote', icon: '"', description: 'كتلة اقتباس', keywords: ['quote', 'blockquote', 'اقتباس'] },
  { label: 'تنبيه', type: 'callout', icon: '💡', description: 'ملاحظة أو تحذير', keywords: ['callout', 'note', 'تنبيه'] },
  { label: 'فاصل', type: 'divider', icon: '—', description: 'خط فاصل أفقي', keywords: ['divider', 'hr', 'فاصل'] },
  { label: 'كود', type: 'code', icon: '</>', description: 'كتلة كود مع تلوين', keywords: ['code', 'كود', 'pre'] },
  { label: 'صورة', type: 'image', icon: '🖼', description: 'صورة مع caption', keywords: ['image', 'img', 'صورة'] },
  { label: 'فيديو', type: 'video', icon: '🎬', description: 'ملف فيديو', keywords: ['video', 'فيديو'] },
  { label: 'صوت', type: 'audio', icon: '🎵', description: 'ملف صوتي', keywords: ['audio', 'صوت'] },
  { label: 'ملف', type: 'file', icon: '📎', description: 'مرفق ملف', keywords: ['file', 'ملف', 'attachment'] },
  { label: 'رابط محتوى', type: 'embed', icon: '🌐', description: 'YouTube, Figma, etc.', keywords: ['embed', 'iframe', 'youtube', 'figma'] },
  { label: 'إشارة مرجعية', type: 'bookmark', icon: '🔖', description: 'رابط مع معاينة', keywords: ['bookmark', 'link', 'رابط'] },
  { label: 'أعمدة', type: 'column_list', icon: '⊞', description: 'تخطيط بالأعمدة', keywords: ['columns', 'col', 'grid', 'أعمدة'] },
  { label: 'جدول محتويات', type: 'table_of_contents', icon: '≡', description: 'جدول المحتويات التلقائي', keywords: ['toc', 'contents', 'جدول'] },
  { label: 'رابط صفحة', type: 'page_link', icon: '📄', description: 'رابط لصفحة أخرى', keywords: ['page', 'link', 'backlink', 'صفحة'] },
  { label: 'كتلة متزامنة', type: 'synced_block', icon: '🔗', description: 'محتوى يظهر في عدة أماكن', keywords: ['sync', 'synced', 'متزامن'] },
  { label: 'قاعدة بيانات', type: 'database_inline', icon: '🗃️', description: 'قاعدة بيانات مضمّنة', keywords: ['database', 'db', 'table', 'قاعدة'] },
];

interface SlashMenuProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSelect: (type: BlockType) => void;
  onClose: () => void;
}

export function SlashMenu({ query, onQueryChange, onSelect, onClose }: SlashMenuProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [selectedIdx, setSelectedIdx] = React.useState(0);

  const filtered = useMemo(() => {
    if (!query.trim()) return SLASH_ITEMS;
    const q = query.toLowerCase();
    return SLASH_ITEMS.filter(
      (item) =>
        item.label.includes(query) ||
        item.keywords.some((k) => k.includes(q)) ||
        item.description.includes(query)
    );
  }, [query]);

  useEffect(() => { setSelectedIdx(0); }, [query]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx((i) => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx((i) => Math.max(i - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[selectedIdx]) onSelect(filtered[selectedIdx].type); }
    else if (e.key === 'Escape') { e.preventDefault(); onClose(); }
  };

  return (
    <div
      role="dialog"
      aria-label="قائمة الأوامر"
      style={{
        position: 'fixed',
        zIndex: 9999,
        background: 'hsl(220, 18%, 11%)',
        border: '1px solid hsl(220, 15%, 22%)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px hsl(0,0%,0%,0.5)',
        width: '320px',
        maxHeight: '420px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      onKeyDown={handleKeyDown}
    >
      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid hsl(220,15%,18%)' }}>
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="ابحث عن نوع كتلة..."
          dir="auto"
          aria-label="بحث في قائمة الأوامر"
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'hsl(210,15%,90%)',
            fontSize: '0.875rem',
          }}
        />
      </div>
      <ul
        ref={listRef}
        role="listbox"
        aria-label="أنواع الكتل"
        style={{ margin: 0, padding: '0.25rem', listStyle: 'none', overflowY: 'auto', flex: 1 }}
      >
        {filtered.length === 0 && (
          <li style={{ padding: '0.75rem', color: 'hsl(210,10%,50%)', fontSize: '0.85rem', textAlign: 'center' }}>
            لا توجد نتائج
          </li>
        )}
        {filtered.map((item, idx) => (
          <li
            key={item.type}
            role="option"
            aria-selected={idx === selectedIdx}
            onClick={() => onSelect(item.type)}
            onMouseEnter={() => setSelectedIdx(idx)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              background: idx === selectedIdx ? 'hsl(220,15%,18%)' : 'transparent',
              transition: 'background 0.1s',
            }}
          >
            <span style={{ width: '24px', textAlign: 'center', fontSize: '0.85rem', opacity: 0.8 }}>{item.icon}</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'hsl(210,10%,55%)' }}>{item.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
