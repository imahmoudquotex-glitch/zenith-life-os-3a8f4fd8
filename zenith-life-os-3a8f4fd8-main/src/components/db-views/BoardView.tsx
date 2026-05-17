/**
 * packages/db-views/src/BoardView.tsx
 * Kanban board — dnd-kit columns, virtualized cards, grouped by select/status/person
 */
import React, { useMemo, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { DbRow } from '../../db-engine/src/row-repo'
import type { DbProperty } from '../../db-engine/src/property-repo'

export interface BoardViewProps {
  rows: DbRow[]
  properties: DbProperty[]
  groupByProperty: string
  onRowUpdate: (rowId: string, propertyName: string, value: unknown) => Promise<void>
  onRowCreate?: (groupValue: string) => Promise<void>
  isLoading?: boolean
  dir?: 'ltr' | 'rtl' | 'auto'
}

interface BoardGroup {
  id: string
  name: string
  color: string
  rows: DbRow[]
}

function groupRows(
  rows: DbRow[],
  groupByProp: DbProperty | undefined
): BoardGroup[] {
  if (!groupByProp) return [{ id: '__all', name: 'All', color: '#39FF14', rows }]

  const config = groupByProp.config as { options?: Array<{ id: string; name: string; color: string; group?: string }> }
  const options = config.options ?? []

  const groups: BoardGroup[] = options.map(opt => ({
    id: opt.id,
    name: opt.name,
    color: colorToHex(opt.color),
    rows: rows.filter(r => r.properties[groupByProp.name] === opt.name || r.properties[groupByProp.name] === opt.id),
  }))

  // Uncategorized group
  const categorized = new Set(groups.flatMap(g => g.rows.map(r => r.id)))
  const uncategorized = rows.filter(r => !categorized.has(r.id))
  if (uncategorized.length > 0) {
    groups.push({ id: '__none', name: 'No Status', color: '#4a4a5a', rows: uncategorized })
  }

  return groups
}

function colorToHex(color: string): string {
  const map: Record<string, string> = {
    gray: '#6b7280', blue: '#3b82f6', green: '#22c55e', red: '#ef4444',
    yellow: '#eab308', purple: '#a855f7', orange: '#f97316', pink: '#ec4899',
  }
  return map[color] ?? color
}

export function BoardView({
  rows,
  properties,
  groupByProperty,
  onRowUpdate,
  onRowCreate,
  isLoading = false,
  dir = 'auto',
}: BoardViewProps) {
  const [activeRow, setActiveRow] = useState<DbRow | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const groupProp = useMemo(
    () => properties.find(p => p.name === groupByProperty),
    [properties, groupByProperty]
  )

  const groups = useMemo(() => groupRows(rows, groupProp), [rows, groupProp])

  const handleDragStart = (event: DragStartEvent) => {
    const row = rows.find(r => r.id === event.active.id)
    setActiveRow(row ?? null)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveRow(null)

    if (!over || active.id === over.id) return

    // Find target group (dropped onto a column)
    const targetGroup = groups.find(g => g.id === over.id || g.rows.some(r => r.id === over.id))
    if (!targetGroup || !groupProp) return

    const targetValue = targetGroup.id === '__none' ? null : targetGroup.name
    await onRowUpdate(active.id as string, groupProp.name, targetValue)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#39FF14]/40 border-t-[#39FF14] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className="flex gap-4 overflow-x-auto h-full p-4"
        dir={dir}
        role="region"
        aria-label="Kanban board"
      >
        {groups.map(group => (
          <BoardColumn
            key={group.id}
            group={group}
            groupProp={groupProp}
            onRowCreate={onRowCreate}
          />
        ))}

        {/* Add group button */}
        <button className="flex-shrink-0 w-60 h-10 flex items-center justify-center gap-2 text-sm text-white/30 hover:text-white/60 border border-dashed border-white/10 rounded-lg transition-colors">
          + Add group
        </button>
      </div>

      <DragOverlay>
        {activeRow && (
          <BoardCard row={activeRow} properties={properties} isDragging />
        )}
      </DragOverlay>
    </DndContext>
  )
}

function BoardColumn({
  group,
  groupProp,
  onRowCreate,
}: {
  group: BoardGroup
  groupProp: DbProperty | undefined
  onRowCreate?: (groupValue: string) => Promise<void>
}) {
  return (
    <div className="flex-shrink-0 w-72 flex flex-col gap-2" role="group" aria-label={group.name}>
      {/* Column header */}
      <div className="flex items-center gap-2 px-1">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: group.color }} />
        <span className="text-sm font-medium text-white/80">{group.name}</span>
        <span className="ml-auto text-xs text-white/30 tabular-nums">{group.rows.length}</span>
      </div>

      {/* Cards */}
      <SortableContext items={group.rows.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 min-h-[100px]">
          {group.rows.map(row => (
            <SortableCard key={row.id} row={row} groupId={group.id} />
          ))}
        </div>
      </SortableContext>

      {/* Add card button */}
      <button
        onClick={() => onRowCreate?.(group.name)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.03] rounded-lg transition-colors"
        aria-label={`Add card to ${group.name}`}
      >
        + New
      </button>
    </div>
  )
}

function SortableCard({ row, groupId }: { row: DbRow; groupId: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: row.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <BoardCard row={row} properties={[]} />
    </div>
  )
}

function BoardCard({
  row,
  properties,
  isDragging = false,
}: {
  row: DbRow
  properties: DbProperty[]
  isDragging?: boolean
}) {
  const title = (row.properties['Task'] ?? row.properties['Title'] ?? row.properties['title'] ?? 'Untitled') as string

  return (
    <div
      className={`
        bg-[#13131F] border border-white/10 rounded-lg p-3 cursor-grab active:cursor-grabbing
        hover:border-white/20 transition-all shadow-sm
        ${isDragging ? 'shadow-xl shadow-black/40 rotate-1' : ''}
      `}
      role="article"
      aria-label={title}
    >
      <p className="text-sm font-medium text-white/90 line-clamp-2">{title}</p>
      {/* Show a few visible properties */}
      <div className="mt-2 flex flex-wrap gap-1">
        {Object.entries(row.properties)
          .filter(([key]) => key !== 'title' && key !== 'Title' && key !== 'Task')
          .slice(0, 3)
          .map(([key, val]) =>
            val ? (
              <span key={key} className="text-xs text-white/40 bg-white/5 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                {String(val)}
              </span>
            ) : null
          )}
      </div>
    </div>
  )
}
