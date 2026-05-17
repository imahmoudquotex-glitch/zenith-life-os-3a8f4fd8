// UrlEditor.tsx
import React, { useRef, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function UrlEditor({ value, isEditing, onSave, onCancel }: PropertyCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])
  if (!isEditing) {
    return value ? (
      <a href={String(value)} target="_blank" rel="noopener noreferrer"
        onClick={e => e.stopPropagation()}
        className="text-sm text-blue-400 hover:underline truncate">{String(value)}</a>
    ) : <span className="text-white/20 text-sm">—</span>
  }
  return (
    <input ref={inputRef} type="url" placeholder="https://"
      className="w-full bg-transparent text-sm text-white outline-none"
      defaultValue={value != null ? String(value) : ''}
      onKeyDown={async e => { if (e.key === 'Enter') await onSave(e.currentTarget.value || null); if (e.key === 'Escape') onCancel() }}
      onBlur={async e => await onSave(e.currentTarget.value || null)} />
  )
}
