// DateEditor.tsx
import React, { useRef, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function DateEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const isDatetime = property.type === 'datetime'

  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])

  const displayValue = value ? new Date(value as string).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  }) : ''

  if (!isEditing) {
    return <span className="text-sm text-white/80">{displayValue || ''}</span>
  }

  const inputType = isDatetime ? 'datetime-local' : 'date'
  const isoValue = value ? new Date(value as string).toISOString().slice(0, isDatetime ? 16 : 10) : ''

  return (
    <input
      ref={inputRef}
      type={inputType}
      className="bg-[#1A1A2E] text-white text-sm border border-white/20 rounded px-2 py-1 outline-none"
      defaultValue={isoValue}
      onKeyDown={async (e) => {
        if (e.key === 'Enter') await onSave(e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={async (e) => {
        await onSave(e.currentTarget.value ? new Date(e.currentTarget.value).toISOString() : null)
      }}
    />
  )
}
