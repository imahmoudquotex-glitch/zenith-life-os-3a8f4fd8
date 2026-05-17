/**
 * Property editors — all 19 types
 * Each editor: display mode (not editing) + edit mode (isEditing=true)
 */

// ── TextEditor.tsx ───────────────────────────────────────────
import React, { useRef, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function TextEditor({ value, isEditing, onSave, onCancel }: PropertyCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.focus()
  }, [isEditing])

  if (!isEditing) {
    return (
      <span className="text-sm text-white/80 truncate">
        {value != null ? String(value) : ''}
      </span>
    )
  }

  return (
    <input
      ref={inputRef}
      className="w-full bg-transparent text-sm text-white outline-none border-none"
      defaultValue={value != null ? String(value) : ''}
      onKeyDown={async (e) => {
        if (e.key === 'Enter') await onSave(e.currentTarget.value)
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={async (e) => await onSave(e.currentTarget.value)}
    />
  )
}
