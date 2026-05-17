import React, { useRef, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function NumberEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const config = property.config as { format?: string }
  const isMoney = config.format === 'currency_cents'

  useEffect(() => { if (isEditing) inputRef.current?.focus() }, [isEditing])

  const display = value != null
    ? isMoney
      ? `${((value as number) / 100).toFixed(2)}`
      : String(value)
    : ''

  if (!isEditing) {
    return <span className="text-sm text-white/80 tabular-nums font-mono">{display || ''}</span>
  }

  return (
    <input
      ref={inputRef}
      type="number"
      className="w-full bg-transparent text-sm text-white outline-none font-mono"
      defaultValue={isMoney ? ((value as number ?? 0) / 100) : (value as number ?? '')}
      step={isMoney ? '0.01' : 'any'}
      onKeyDown={async (e) => {
        if (e.key === 'Enter') {
          const n = parseFloat(e.currentTarget.value)
          await onSave(isMoney ? Math.round(n * 100) : n)
        }
        if (e.key === 'Escape') onCancel()
      }}
      onBlur={async (e) => {
        const n = parseFloat(e.currentTarget.value)
        await onSave(isNaN(n) ? null : isMoney ? Math.round(n * 100) : n)
      }}
    />
  )
}
