/**
 * Wave 06 — Template Button Block Renderer
 * src/components/editor/blocks/TemplateButtonBlock.tsx
 *
 * قواعد:
 * - ✅ ينشئ blocks من template عند الضغط
 * - ✅ لا يستدعي AI
 * - ✅ RTL-aware
 */
import React, { useCallback } from 'react';
import type { Block, BlockType } from '../../../lib/block-engine/block-repo';

interface TemplateItem {
  type: BlockType;
  content: Record<string, unknown>;
}

interface TemplateButtonContent {
  label?: string;
  icon?: string;
  template?: TemplateItem[];
}

interface TemplateButtonBlockProps {
  block: Block;
  onAddAfter: (type: BlockType, content?: Record<string, unknown>) => void;
}

const DEFAULT_TEMPLATE: TemplateItem[] = [
  { type: 'heading_2', content: { text: 'عنوان جديد' } },
  { type: 'paragraph', content: { text: '' } },
  { type: 'todo', content: { text: 'مهمة 1', checked: false } },
  { type: 'todo', content: { text: 'مهمة 2', checked: false } },
];

export const TemplateButtonBlock = React.memo(function TemplateButtonBlock({
  block,
  onAddAfter,
}: TemplateButtonBlockProps) {
  const content = (block.content_json ?? {}) as TemplateButtonContent;
  const label = content.label ?? 'إنشاء من القالب';
  const icon = content.icon ?? '⚡';
  const template = content.template ?? DEFAULT_TEMPLATE;

  const handleClick = useCallback(() => {
    // Insert template blocks in reverse order (each after current block)
    // The last one will end up first since we insert after the same block
    for (let i = template.length - 1; i >= 0; i--) {
      const item = template[i];
      onAddAfter(item.type, item.content);
    }
  }, [template, onAddAfter]);

  return (
    <div dir="auto">
      <button
        onClick={handleClick}
        aria-label={`زر قالب: ${label}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          background: 'hsl(220, 16%, 18%)',
          border: '1.5px dashed hsl(220, 16%, 32%)',
          borderRadius: '8px',
          color: 'hsl(210, 15%, 70%)',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'inherit',
          transition: 'background 0.15s, border-color 0.15s, color 0.15s',
        }}
        onMouseEnter={(e) => {
          const btn = e.currentTarget;
          btn.style.background = 'hsl(220, 16%, 22%)';
          btn.style.borderColor = 'hsl(267, 70%, 55%)';
          btn.style.color = 'hsl(210, 15%, 90%)';
        }}
        onMouseLeave={(e) => {
          const btn = e.currentTarget;
          btn.style.background = 'hsl(220, 16%, 18%)';
          btn.style.borderColor = 'hsl(220, 16%, 32%)';
          btn.style.color = 'hsl(210, 15%, 70%)';
        }}
      >
        <span aria-hidden style={{ fontSize: '16px' }}>{icon}</span>
        <span>{label}</span>
        <span
          style={{
            fontSize: '11px',
            opacity: 0.5,
            marginInlineStart: '4px',
          }}
          aria-hidden
        >
          {template.length} عناصر
        </span>
      </button>
    </div>
  );
});
