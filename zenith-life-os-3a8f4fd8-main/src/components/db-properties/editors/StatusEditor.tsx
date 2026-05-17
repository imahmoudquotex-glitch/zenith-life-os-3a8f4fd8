// StatusEditor.tsx — like SelectEditor but with todo/in_progress/done groups
import React from 'react'
import type { PropertyCellProps } from '../PropertyCell'

interface StatusOption { id: string; name: string; color: string; group?: 'todo' | 'in_progress' | 'done' }

const GROUP_LABELS = { todo: 'Todo', in_progress: 'In Progress', done: 'Done' }

export default function StatusEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const config = property.config as { options?: StatusOption[] }
  const options = config.options ?? []
  const selected = options.find(o => o.name === value || o.id === value)

  const statusDot = (color: string) => {
    const colors: Record<string, string> = { gray: '#9ca3af', blue: '#60a5fa', green: '#4ade80', yellow: '#facc15', red: '#f87171' }
    return colors[color] ?? color
  }

  if (!isEditing) {
    return selected ? (
      <div className="flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusDot(selected.color) }} />
        <span className="text-sm text-white/80">{selected.name}</span>
      </div>
    ) : <span className="text-white/20 text-sm">—</span>
  }

  const groups = ['todo', 'in_progress', 'done'] as const
  return (
    <div className="flex flex-col gap-0.5 bg-[#1A1A2E] border border-white/20 rounded-lg p-2 shadow-xl z-50 w-48">
      {groups.map(g => {
        const groupOpts = options.filter(o => o.group === g)
        if (!groupOpts.length) return null
        return (
          <div key={g}>
            <p className="text-[10px] text-white/30 uppercase font-semibold px-2 pt-1">{GROUP_LABELS[g]}</p>
            {groupOpts.map(opt => (
              <button key={opt.id} onClick={async () => { await onSave(opt.name) }}
                className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/10 w-full text-left transition-colors">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusDot(opt.color) }} />
                <span className="text-sm text-white/80">{opt.name}</span>
              </button>
            ))}
          </div>
        )
      })}
    </div>
  )
}
