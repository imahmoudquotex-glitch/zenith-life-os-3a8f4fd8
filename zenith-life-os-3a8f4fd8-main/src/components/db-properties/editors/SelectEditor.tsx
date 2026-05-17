import React, { useState } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

interface SelectOption { id: string; name: string; color: string }

export default function SelectEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const config = property.config as { options?: SelectOption[] }
  const options = config.options ?? []
  const selected = options.find(o => o.name === value || o.id === value)

  if (!isEditing) {
    return selected ? (
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium`}
        style={{ backgroundColor: colorToBg(selected.color), color: colorToText(selected.color) }}>
        {selected.name}
      </span>
    ) : <span className="text-white/20 text-sm">—</span>
  }

  return (
    <div className="flex flex-col gap-1 bg-[#1A1A2E] border border-white/20 rounded-lg p-1.5 shadow-xl z-50 w-48">
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={async () => { await onSave(opt.name); }}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left transition-colors"
        >
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colorToBg(opt.color) }} />
          <span className="text-sm text-white/80">{opt.name}</span>
        </button>
      ))}
      <button onClick={() => onSave(null)} className="text-xs text-white/30 hover:text-white/60 px-2 py-1 text-left">Clear</button>
    </div>
  )
}

export function colorToBg(color: string): string {
  const m: Record<string, string> = { gray:'#374151',blue:'#1d4ed8',green:'#15803d',red:'#b91c1c',yellow:'#a16207',purple:'#7e22ce',orange:'#c2410c',pink:'#be185d' }
  return m[color] ?? color
}
export function colorToText(color: string): string {
  return '#fff'
}
