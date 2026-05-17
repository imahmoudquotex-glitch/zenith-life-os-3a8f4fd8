// PersonEditor.tsx
import React from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function PersonEditor({ value, isEditing, onSave }: PropertyCellProps) {
  const persons: string[] = Array.isArray(value) ? (value as string[]) : []
  if (!isEditing) {
    return (
      <div className="flex gap-1">
        {persons.map(p => (
          <span key={p} className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold" title={p}>
            {p.slice(0, 2).toUpperCase()}
          </span>
        ))}
        {persons.length === 0 && <span className="text-white/20 text-sm">—</span>}
      </div>
    )
  }
  return <div className="text-xs text-white/40 italic px-2 py-1">Person picker (W09)</div>
}
