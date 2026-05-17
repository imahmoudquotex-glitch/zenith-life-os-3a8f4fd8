/**
 * packages/db-properties/src/PropertyCell.tsx
 * Router by type — renders the right editor for each property type
 * 19 types + computed types
 */
import React, { Suspense, lazy } from 'react'
import type { DbProperty } from '../../db-engine/src/property-repo'

// Lazy-load editors to keep initial bundle small
const TextEditor = lazy(() => import('./editors/TextEditor'))
const NumberEditor = lazy(() => import('./editors/NumberEditor'))
const SelectEditor = lazy(() => import('./editors/SelectEditor'))
const MultiSelectEditor = lazy(() => import('./editors/MultiSelectEditor'))
const StatusEditor = lazy(() => import('./editors/StatusEditor'))
const DateEditor = lazy(() => import('./editors/DateEditor'))
const CheckboxEditor = lazy(() => import('./editors/CheckboxEditor'))
const UrlEditor = lazy(() => import('./editors/UrlEditor'))
const EmailEditor = lazy(() => import('./editors/EmailEditor'))
const PhoneEditor = lazy(() => import('./editors/PhoneEditor'))
const RelationEditor = lazy(() => import('./editors/RelationEditor'))
const PersonEditor = lazy(() => import('./editors/PersonEditor'))

export interface PropertyCellProps {
  property: DbProperty
  value: unknown
  isEditing: boolean
  onSave: (value: unknown) => Promise<void>
  onCancel: () => void
}

export function PropertyCell({ property, value, isEditing, onSave, onCancel }: PropertyCellProps) {
  const { type } = property

  // Computed / read-only types
  if (['created_at', 'updated_at'].includes(type)) {
    const date = value ? new Date(value as string).toLocaleDateString() : '—'
    return <span className="text-xs text-white/40">{date}</span>
  }

  if (['created_by', 'last_edited_by'].includes(type)) {
    return <span className="text-xs text-white/40">{String(value ?? '—')}</span>
  }

  if (type === 'auto_increment_id') {
    return <span className="text-xs font-mono text-white/30">{String(value ?? '—')}</span>
  }

  if (type === 'formula') {
    // Formula eval blocked until W08 — show placeholder
    return <span className="text-xs text-amber-400/60 italic">formula (W08)</span>
  }

  if (type === 'rollup') {
    // Rollup is always read-only — computed server-side
    const result = value as { value: unknown; agg: string } | null
    return (
      <span className="text-xs text-white/70 font-mono">
        {result?.value != null ? String(result.value) : '—'}
      </span>
    )
  }

  return (
    <Suspense fallback={<span className="text-white/20 text-xs">…</span>}>
      {renderEditor(type, { value, isEditing, onSave, onCancel, property })}
    </Suspense>
  )
}

function renderEditor(
  type: string,
  props: { value: unknown; isEditing: boolean; onSave: (v: unknown) => Promise<void>; onCancel: () => void; property: DbProperty }
) {
  switch (type) {
    case 'title':
    case 'text':
      return <TextEditor {...props} />
    case 'number':
      return <NumberEditor {...props} />
    case 'select':
      return <SelectEditor {...props} />
    case 'multi_select':
      return <MultiSelectEditor {...props} />
    case 'status':
      return <StatusEditor {...props} />
    case 'date':
    case 'datetime':
      return <DateEditor {...props} />
    case 'checkbox':
      return <CheckboxEditor {...props} />
    case 'url':
      return <UrlEditor {...props} />
    case 'email':
      return <EmailEditor {...props} />
    case 'phone':
      return <PhoneEditor {...props} />
    case 'relation':
      return <RelationEditor {...props} />
    case 'person':
      return <PersonEditor {...props} />
    default:
      return <span className="text-white/30 text-xs">{String(props.value ?? '—')}</span>
  }
}
