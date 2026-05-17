// CheckboxEditor.tsx
import React from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function CheckboxEditor({ value, isEditing, onSave }: PropertyCellProps) {
  const checked = Boolean(value)
  return (
    <button
      className={`w-4 h-4 rounded flex items-center justify-center border transition-colors
        ${checked ? 'bg-[#39FF14] border-[#39FF14]' : 'border-white/30 bg-transparent hover:border-white/50'}`}
      onClick={async (e) => { e.stopPropagation(); await onSave(!checked) }}
      role="checkbox"
      aria-checked={checked}
    >
      {checked && <span className="text-black text-[10px] font-bold">✓</span>}
    </button>
  )
}

// ── UrlEditor ────────────────────────────────────────────────
// UrlEditor.tsx
export function UrlEditorDisplay({ value }: { value: unknown }) {
  if (!value) return <span className="text-white/20 text-sm">—</span>
  return (
    <a href={String(value)} target="_blank" rel="noopener noreferrer"
      className="text-sm text-blue-400 hover:text-blue-300 underline truncate"
      onClick={e => e.stopPropagation()}>
      {String(value)}
    </a>
  )
}
