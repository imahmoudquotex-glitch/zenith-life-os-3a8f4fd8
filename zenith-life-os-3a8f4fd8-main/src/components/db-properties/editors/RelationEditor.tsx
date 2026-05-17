// RelationEditor.tsx — picker for linked rows
import React, { useState, useEffect } from 'react'
import type { PropertyCellProps } from '../PropertyCell'

export default function RelationEditor({ value, isEditing, onSave, onCancel, property }: PropertyCellProps) {
  const linked: string[] = Array.isArray(value) ? (value as string[]) : []
  if (!isEditing) {
    return (
      <div className="flex flex-wrap gap-1">
        {linked.length > 0
          ? linked.map(id => <span key={id} className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-white/70">{id.slice(0, 8)}…</span>)
          : <span className="text-white/20 text-sm">—</span>}
      </div>
    )
  }
  // In edit mode, display linked IDs (full picker implemented in W08 via linked-db modal)
  return (
    <div className="text-xs text-white/40 italic px-2 py-1 bg-[#1A1A2E] border border-white/20 rounded">
      Relation picker (W08) — {linked.length} linked
    </div>
  )
}
