// MultiSelectEditor.tsx
import React, { useState } from 'react'
import type { PropertyCellProps } from '../PropertyCell'
import { colorToBg } from './SelectEditor'

interface SelectOption { id: string; name: string; color: string }

export default function MultiSelectEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const config = property.config as { options?: SelectOption[] }
  const options = config.options ?? []
  const selected: string[] = Array.isArray(value) ? (value as string[]) : []

  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-1">
        {selected.map(s => {
          const opt = options.find(o => o.name === s || o.id === s)
          return opt ? (
            <span key={s} className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: colorToBg(opt.color), color: '#fff' }}>
              {opt.name}
            </span>
          ) : null
        })}
        {selected.length === 0 && <span className="text-white/20 text-sm">—</span>}
      </div>
    )
  }

  const [current, setCurrent] = useState<string[]>(selected)

  const toggle = (name: string) => {
    setCurrent(prev => prev.includes(name) ? prev.filter(v => v !== name) : [...prev, name])
  }

  return (
    <div className="flex flex-col gap-1 bg-[#1A1A2E] border border-white/20 rounded-lg p-1.5 shadow-xl z-50 w-48">
      {options.map(opt => (
        <button key={opt.id} onClick={() => toggle(opt.name)}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 text-left transition-colors">
          <span className="w-3 h-3 rounded-sm border border-white/30 flex items-center justify-center"
            style={current.includes(opt.name) ? { backgroundColor: colorToBg(opt.color) } : {}}>
            {current.includes(opt.name) && <span className="text-white text-[10px]">✓</span>}
          </span>
          <span className="text-sm text-white/80">{opt.name}</span>
        </button>
      ))}
      <button onClick={async () => { await onSave(current); }}
        className="mt-1 text-xs text-[#39FF14] hover:text-[#39FF14]/70 px-2 py-1 text-left">
        Apply
      </button>
    </div>
  )
}
