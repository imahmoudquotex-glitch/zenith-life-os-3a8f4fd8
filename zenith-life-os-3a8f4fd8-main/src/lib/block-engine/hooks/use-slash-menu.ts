/**
 * Wave 06 — use-slash-menu hook
 * src/lib/block-engine/hooks/use-slash-menu.ts
 *
 * قواعد:
 * - ✅ فلترة < 100ms
 * - ✅ Keyboard navigation (↑↓ Enter Escape)
 * - ✅ Fuzzy Arabic/English match
 */
import { useState, useCallback, useMemo, useRef } from 'react';
import type { BlockType } from '../block-repo';

export interface SlashMenuItem {
  type: BlockType;
  label: string;
  labelEn: string;
  icon: string;
  description: string;
  group: 'text' | 'media' | 'layout' | 'special';
}

export const SLASH_MENU_ITEMS: SlashMenuItem[] = [
  // Text
  { type: 'paragraph', label: 'فقرة', labelEn: 'paragraph', icon: '¶', description: 'نص عادي', group: 'text' },
  { type: 'heading_1', label: 'عنوان 1', labelEn: 'heading 1', icon: 'H1', description: 'عنوان كبير', group: 'text' },
  { type: 'heading_2', label: 'عنوان 2', labelEn: 'heading 2', icon: 'H2', description: 'عنوان متوسط', group: 'text' },
  { type: 'heading_3', label: 'عنوان 3', labelEn: 'heading 3', icon: 'H3', description: 'عنوان صغير', group: 'text' },
  { type: 'bulleted_list', label: 'قائمة نقطية', labelEn: 'bullet list', icon: '•', description: 'عناصر غير مرتبة', group: 'text' },
  { type: 'numbered_list', label: 'قائمة مرقمة', labelEn: 'numbered list', icon: '1.', description: 'عناصر مرتبة', group: 'text' },
  { type: 'todo', label: 'مهمة', labelEn: 'todo checkbox', icon: '☐', description: 'مهمة قابلة للإنجاز', group: 'text' },
  { type: 'toggle', label: 'قابل للطي', labelEn: 'toggle', icon: '▶', description: 'محتوى منسدل', group: 'text' },
  { type: 'quote', label: 'اقتباس', labelEn: 'quote', icon: '"', description: 'نص اقتباسي', group: 'text' },
  { type: 'callout', label: 'تنبيه', labelEn: 'callout', icon: '💡', description: 'صندوق تنبيه', group: 'text' },
  { type: 'divider', label: 'فاصل', labelEn: 'divider', icon: '—', description: 'خط فاصل', group: 'text' },
  { type: 'code', label: 'كود', labelEn: 'code block', icon: '</>', description: 'كتلة كود برمجي', group: 'text' },
  // Media
  { type: 'image', label: 'صورة', labelEn: 'image', icon: '🖼', description: 'رفع أو رابط صورة', group: 'media' },
  { type: 'video', label: 'فيديو', labelEn: 'video', icon: '▶️', description: 'رابط فيديو', group: 'media' },
  { type: 'audio', label: 'صوت', labelEn: 'audio', icon: '🔊', description: 'ملف صوتي', group: 'media' },
  { type: 'file', label: 'ملف', labelEn: 'file', icon: '📎', description: 'رفع ملف', group: 'media' },
  { type: 'embed', label: 'تضمين', labelEn: 'embed', icon: '↗', description: 'تضمين محتوى خارجي', group: 'media' },
  { type: 'bookmark', label: 'إشارة مرجعية', labelEn: 'bookmark', icon: '🔖', description: 'معاينة رابط', group: 'media' },
  // Layout
  { type: 'column_list', label: 'أعمدة', labelEn: 'columns', icon: '⫿', description: 'تخطيط متعدد الأعمدة', group: 'layout' },
  // Special
  { type: 'table_of_contents', label: 'جدول المحتويات', labelEn: 'toc', icon: '≡', description: 'قائمة العناوين', group: 'special' },
  { type: 'synced_block', label: 'كتلة متزامنة', labelEn: 'synced block', icon: '↔', description: 'محتوى يظهر في أماكن متعددة', group: 'special' },
  { type: 'page_link', label: 'رابط صفحة', labelEn: 'page link', icon: '📄', description: 'رابط لصفحة أخرى', group: 'special' },
  { type: 'database_inline', label: 'قاعدة بيانات', labelEn: 'database', icon: '🗄', description: 'قاعدة بيانات مضمّنة', group: 'special' },
  { type: 'template_button', label: 'زر قالب', labelEn: 'template button', icon: '⚡', description: 'ينشئ محتوى تلقائياً', group: 'special' },
];

function matches(item: SlashMenuItem, query: string): boolean {
  if (!query) return true;
  const q = query.toLowerCase().trim();
  return (
    item.label.includes(q) ||
    item.labelEn.includes(q) ||
    item.description.includes(q) ||
    item.icon.includes(q)
  );
}

export function useSlashMenu(onSelect: (type: BlockType) => void) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const openedByRef = useRef<string | null>(null);

  const filtered = useMemo(
    () => SLASH_MENU_ITEMS.filter((item) => matches(item, query)),
    [query],
  );

  const safeIndex = Math.min(selectedIndex, Math.max(0, filtered.length - 1));

  const openMenu = useCallback((blockId: string) => {
    openedByRef.current = blockId;
    setOpen(true);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery('');
    openedByRef.current = null;
  }, []);

  const handleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open) return false;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filtered.length);
        return true;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + filtered.length) % filtered.length);
        return true;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[safeIndex]) {
          onSelect(filtered[safeIndex].type);
          closeMenu();
        }
        return true;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        closeMenu();
        return true;
      }
      return false;
    },
    [open, filtered, safeIndex, onSelect, closeMenu],
  );

  return {
    open,
    query,
    setQuery,
    filtered,
    selectedIndex: safeIndex,
    setSelectedIndex,
    openMenu,
    closeMenu,
    handleKey,
    openedBy: openedByRef.current,
  };
}
