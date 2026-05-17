// EmailEditor.tsx
import React, { useRef, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function EmailEditor({ value, isEditing, onSave, onCancel }: PropertyCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])
  if (!isEditing) {
    return value ? (
      <a href={`mailto:${value}`} onClick={e => e.stopPropagation()}
        className="text-sm text-blue-400 hover:underline">{String(value)}</a>
    ) : <span className="text-white/20 text-sm">—</span>
  }
  return (
    <input ref={inputRef} type="email" placeholder="name@example.com"
      className="w-full bg-transparent text-sm text-white outline-none"
      defaultValue={value != null ? String(value) : ''}
      onKeyDown={async e => { if (e.key === 'Enter') await onSave(e.currentTarget.value || null); if (e.key === 'Escape') onCancel() }}
      onBlur={async e => await onSave(e.currentTarget.value || null)} />
  )
}
