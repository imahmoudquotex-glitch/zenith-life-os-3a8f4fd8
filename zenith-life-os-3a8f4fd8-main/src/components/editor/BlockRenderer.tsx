/**
 * Wave 06 — Block Renderer
 * src/components/editor/BlockRenderer.tsx
 */
import React, { memo } from 'react';
import type { Block, BlockType } from '../../lib/block-engine/block-repo';

interface BlockRendererProps {
  block: Block;
  editable?: boolean;
  onChange?: (content: Record<string, unknown>) => void;
  onFocus?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onDelete?: () => void;
  onAddAfter?: (type: BlockType) => void;
}

function EditableText({ value, onChange, onKeyDown, onFocus, placeholder, dir = 'auto' }: {
  value: string; onChange: (v: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  onFocus?: () => void; placeholder?: string; dir?: 'auto' | 'ltr' | 'rtl';
}) {
  return (
    <div contentEditable suppressContentEditableWarning dir={dir}
      data-placeholder={placeholder}
      onInput={(e) => onChange((e.target as HTMLElement).textContent ?? '')}
      onKeyDown={onKeyDown} onFocus={onFocus}
      role="textbox" aria-multiline="true"
      style={{ outline: 'none', minHeight: '1.4em' }}>
      {value}
    </div>
  );
}

export const BlockRenderer = memo(function BlockRenderer({ block, editable, onChange, onFocus, onKeyDown }: BlockRendererProps) {
  const text = String(block.content_json?.text ?? '');
  const code = String(block.content_json?.code ?? '');
  const lang = String(block.content_json?.language ?? '');
  const url = String(block.content_json?.url ?? '');
  const caption = String(block.content_json?.caption ?? '');
  const icon = String(block.content_json?.icon ?? '💡');
  const checked = block.content_json?.checked === true;
  const handleChange = (t: string) => onChange?.({ ...block.content_json, text: t });
  const editProps = editable ? { onChange: handleChange, onKeyDown, onFocus } : null;

  switch (block.type) {
    case 'paragraph':
      return editable ? <EditableText value={text} placeholder="اكتب / للأوامر..." {...editProps!} /> : <p dir="auto">{text}</p>;
    case 'heading_1':
      return editable ? <EditableText value={text} placeholder="عنوان" {...editProps!} /> : <h1 dir="auto">{text}</h1>;
    case 'heading_2':
      return editable ? <EditableText value={text} {...editProps!} /> : <h2 dir="auto">{text}</h2>;
    case 'heading_3':
      return editable ? <EditableText value={text} {...editProps!} /> : <h3 dir="auto">{text}</h3>;
    case 'bulleted_list':
      return <div dir="auto" style={{ display: 'flex', gap: '0.5rem' }}><span>•</span>{editable ? <EditableText value={text} {...editProps!} /> : <span>{text}</span>}</div>;
    case 'numbered_list':
      return <div dir="auto" style={{ display: 'flex', gap: '0.5rem' }}><span>{Number(block.content_json?.number ?? 1)}.</span>{editable ? <EditableText value={text} {...editProps!} /> : <span>{text}</span>}</div>;
    case 'todo':
      return <div dir="auto" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}><input type="checkbox" checked={checked} onChange={(e) => onChange?.({ ...block.content_json, checked: e.target.checked })} disabled={!editable} />{editable ? <EditableText value={text} {...editProps!} /> : <span style={{ textDecoration: checked ? 'line-through' : 'none' }}>{text}</span>}</div>;
    case 'quote':
      return <blockquote dir="auto" style={{ borderRight: '3px solid hsl(220,15%,30%)', padding: '0.25rem 0.75rem' }}>{editable ? <EditableText value={text} {...editProps!} /> : <p>{text}</p>}</blockquote>;
    case 'callout':
      return <div role="note" dir="auto" style={{ display: 'flex', gap: '0.5rem', background: 'hsl(220,15%,12%)', borderRadius: '6px', padding: '0.75rem' }}><span>{icon}</span>{editable ? <EditableText value={text} {...editProps!} /> : <p style={{ margin: 0 }}>{text}</p>}</div>;
    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid hsl(220,15%,20%)', margin: '1rem 0' }} />;
    case 'code':
      return <pre dir="ltr" style={{ background: 'hsl(220,15%,8%)', borderRadius: '6px', padding: '1rem', overflow: 'auto' }}><code className={lang ? `language-${lang}` : ''}>{editable ? <EditableText value={code} dir="ltr" onChange={(v) => onChange?.({ ...block.content_json, code: v })} onKeyDown={onKeyDown} onFocus={onFocus} /> : code}</code></pre>;
    case 'image':
      return <figure style={{ margin: 0 }}><img src={url} alt={caption} loading="lazy" style={{ maxWidth: '100%', borderRadius: '6px' }} />{caption && <figcaption style={{ textAlign: 'center', fontSize: '0.8rem', color: 'hsl(210,10%,60%)' }}>{caption}</figcaption>}</figure>;
    case 'video':
      return <figure style={{ margin: 0 }}><video src={url} controls playsInline style={{ maxWidth: '100%', borderRadius: '6px' }} /></figure>;
    case 'embed':
      return <div style={{ borderRadius: '6px', overflow: 'hidden', height: '400px' }}><iframe src={url} sandbox="allow-scripts allow-same-origin allow-popups" title={caption || 'embed'} loading="lazy" style={{ width: '100%', height: '100%', border: 'none' }} /></div>;
    case 'bookmark':
      return <a href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '0.75rem', background: 'hsl(220,15%,12%)', borderRadius: '6px', color: 'inherit', textDecoration: 'none' }}>{String(block.content_json?.title ?? url)}</a>;
    case 'page_link':
      return <div dir="auto" style={{ display: 'flex', gap: '0.5rem', padding: '0.5rem', background: 'hsl(220,15%,12%)', borderRadius: '4px' }}><span>📄</span><span>{String(block.content_json?.title ?? '')}</span></div>;
    case 'divider': return <hr />;
    case 'table_of_contents':
      return <nav aria-label="جدول المحتويات" style={{ padding: '0.5rem', background: 'hsl(220,15%,12%)', borderRadius: '4px', fontSize: '0.85rem', color: 'hsl(210,10%,60%)' }}>جدول المحتويات — يُولَّد تلقائياً</nav>;
    case 'database_inline':
      return <div role="region" aria-label="قاعدة بيانات" style={{ padding: '0.75rem', background: 'hsl(220,15%,10%)', borderRadius: '6px', display: 'flex', gap: '0.5rem' }}><span>🗃️</span><span>قاعدة بيانات — متاح في المرحلة 07</span></div>;
    case 'synced_block':
      return <div role="region" style={{ padding: '0.5rem', border: '1px dashed hsl(220,15%,30%)', borderRadius: '4px' }}><span>🔗 كتلة متزامنة</span></div>;
    case 'audio':
      return <figure style={{ margin: 0 }}><audio src={url} controls style={{ width: '100%', borderRadius: '6px' }} />{caption && <figcaption style={{ textAlign: 'center', fontSize: '0.8rem', color: 'hsl(210,10%,60%)' }}>{caption}</figcaption>}</figure>;
    case 'file':
      return <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'hsl(220,15%,12%)', borderRadius: '6px' }}><span>📎</span><a href={url} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>{String(block.content_json?.title ?? 'Download File')}</a></div>;
    case 'column_list':
      return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', padding: '0.5rem' }}>{/* Children render here via BlockTree / parent component */} <span style={{color: 'hsl(210,10%,40%)', fontSize: '0.8rem'}}>قائمة أعمدة (Column List)</span> </div>;
    case 'column':
      return <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>{/* Children render here via BlockTree */} <span style={{color: 'hsl(210,10%,40%)', fontSize: '0.8rem'}}>عمود (Column)</span> </div>;

    default:
      return <div>نوع غير مدعوم: {block.type}</div>;
  }
});
