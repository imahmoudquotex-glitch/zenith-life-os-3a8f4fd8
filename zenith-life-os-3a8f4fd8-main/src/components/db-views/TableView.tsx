/**
 * packages/db-views/src/TableView.tsx
 * Virtualized table — @tanstack/react-table + @tanstack/react-virtual
 * Supports: 1000+ rows, column resize, sticky header, sticky title col,
 *           keyboard nav (arrows/Enter/Esc), RTL, ARIA grid roles
 */
import React, { useCallback, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type RowData,
} from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import type { DbProperty } from '../../db-engine/src/property-repo'
import type { DbRow } from '../../db-engine/src/row-repo'
import { PropertyCell } from '../db-properties/PropertyCell'

export interface TableViewProps {
  rows: DbRow[]
  properties: DbProperty[]
  isLoading?: boolean
  onRowUpdate?: (rowId: string, propertyName: string, value: unknown) => Promise<void>
  onRowCreate?: () => Promise<void>
  onRowDelete?: (rowId: string) => Promise<void>
  onReorder?: (rowId: string, prevPos: number | null, nextPos: number | null) => Promise<void>
  rowHeight?: 'compact' | 'medium' | 'tall'
  dir?: 'ltr' | 'rtl' | 'auto'
}

const ROW_HEIGHTS: Record<string, number> = {
  compact: 32,
  medium: 48,
  tall: 64,
}

interface CellPosition { rowIdx: number; colIdx: number }

export function TableView({
  rows,
  properties,
  isLoading = false,
  onRowUpdate,
  onRowCreate,
  onRowDelete,
  rowHeight = 'compact',
  dir = 'auto',
}: TableViewProps) {
  const parentRef = useRef<HTMLDivElement>(null)
  const [activeCell, setActiveCell] = useState<CellPosition | null>(null)
  const [editingCell, setEditingCell] = useState<CellPosition | null>(null)

  const estimatedRowHeight = ROW_HEIGHTS[rowHeight] ?? 32

  // Build columns from properties
  const columns = useMemo<ColumnDef<DbRow>[]>(() => {
    const cols: ColumnDef<DbRow>[] = properties.map((prop, propIdx) => ({
      id: prop.id,
      accessorFn: (row) => row.properties[prop.name],
      header: () => (
        <span className="flex items-center gap-1.5 text-xs font-medium text-white/60 uppercase tracking-wider select-none">
          <PropertyTypeIcon type={prop.type} />
          {prop.name}
        </span>
      ),
      cell: ({ row, getValue }) => {
        const rowIdx = rows.indexOf(row.original)
        const isActive = activeCell?.rowIdx === rowIdx && activeCell?.colIdx === propIdx
        const isEditing = editingCell?.rowIdx === rowIdx && editingCell?.colIdx === propIdx
        return (
          <div
            className={`h-full flex items-center px-2 cursor-pointer transition-colors
              ${isActive ? 'ring-1 ring-inset ring-[#39FF14]/60' : ''}
              ${isEditing ? 'ring-2 ring-inset ring-[#39FF14]' : ''}
            `}
            onClick={() => {
              setActiveCell({ rowIdx, colIdx: propIdx })
            }}
            onDoubleClick={() => {
              setEditingCell({ rowIdx, colIdx: propIdx })
            }}
            role="gridcell"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
          >
            <PropertyCell
              property={prop}
              value={getValue() as unknown}
              isEditing={isEditing}
              onSave={async (newVal) => {
                await onRowUpdate?.(row.original.id, prop.name, newVal)
                setEditingCell(null)
              }}
              onCancel={() => setEditingCell(null)}
            />
          </div>
        )
      },
      size: prop.type === 'title' ? 300 : 180,
      minSize: 80,
      maxSize: 800,
      enableResizing: true,
    }))
    return cols
  }, [properties, rows, activeCell, editingCell, onRowUpdate])

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: 'onChange',
  })

  const { rows: tableRows } = table.getRowModel()

  const rowVirtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimatedRowHeight,
    overscan: 10,
  })

  const virtualRows = rowVirtualizer.getVirtualItems()
  const totalHeight = rowVirtualizer.getTotalSize()
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0
  const paddingBottom =
    virtualRows.length > 0
      ? totalHeight - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!activeCell) return
      const { rowIdx, colIdx } = activeCell
      const maxRow = rows.length - 1
      const maxCol = properties.length - 1

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setActiveCell({ rowIdx: Math.min(rowIdx + 1, maxRow), colIdx })
          break
        case 'ArrowUp':
          e.preventDefault()
          setActiveCell({ rowIdx: Math.max(rowIdx - 1, 0), colIdx })
          break
        case 'ArrowRight':
          e.preventDefault()
          setActiveCell({ rowIdx, colIdx: Math.min(colIdx + 1, maxCol) })
          break
        case 'ArrowLeft':
          e.preventDefault()
          setActiveCell({ rowIdx, colIdx: Math.max(colIdx - 1, 0) })
          break
        case 'Enter':
          e.preventDefault()
          if (editingCell) {
            setEditingCell(null)
          } else {
            setEditingCell(activeCell)
          }
          break
        case 'Escape':
          e.preventDefault()
          setEditingCell(null)
          break
        case 'Tab':
          e.preventDefault()
          const nextCol = colIdx + (e.shiftKey ? -1 : 1)
          if (nextCol < 0) {
            setActiveCell({ rowIdx: Math.max(rowIdx - 1, 0), colIdx: maxCol })
          } else if (nextCol > maxCol) {
            setActiveCell({ rowIdx: Math.min(rowIdx + 1, maxRow), colIdx: 0 })
          } else {
            setActiveCell({ rowIdx, colIdx: nextCol })
          }
          break
      }
    },
    [activeCell, editingCell, rows.length, properties.length]
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#39FF14]/40 border-t-[#39FF14] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#0A0A0F] rounded-xl border border-white/10">
      {/* Scrollable container */}
      <div
        ref={parentRef}
        className="overflow-auto flex-1"
        role="grid"
        aria-label="Database table"
        aria-rowcount={rows.length}
        dir={dir}
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        {/* Sticky header */}
        <div
          className="sticky top-0 z-10 bg-[#0F0F18] border-b border-white/10 flex"
          role="row"
        >
          {table.getHeaderGroups().map(headerGroup =>
            headerGroup.headers.map((header, idx) => (
              <div
                key={header.id}
                className={`
                  flex-shrink-0 px-2 py-2 border-r border-white/10 select-none relative
                  ${idx === 0 ? 'sticky left-0 z-20 bg-[#0F0F18]' : ''}
                `}
                style={{ width: header.getSize() }}
                role="columnheader"
                aria-sort="none"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
                {/* Column resize handle */}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-[#39FF14]/40 transition-colors"
                  onMouseDown={header.getResizeHandler()}
                  onTouchStart={header.getResizeHandler()}
                />
              </div>
            ))
          )}
          {/* Add property button */}
          <div className="flex-shrink-0 px-3 py-2 flex items-center">
            <button
              className="text-white/30 hover:text-white/60 text-sm transition-colors"
              aria-label="Add property"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Virtualized rows */}
        <div style={{ height: totalHeight, position: 'relative' }}>
          {paddingTop > 0 && <div style={{ height: paddingTop }} />}
          {virtualRows.map(virtualRow => {
            const tableRow = tableRows[virtualRow.index]
            if (!tableRow) return null
            const rowIdx = virtualRow.index
            const isActiveRow = activeCell?.rowIdx === rowIdx
            return (
              <div
                key={tableRow.id}
                className={`flex border-b border-white/5 hover:bg-white/[0.02] transition-colors
                  ${isActiveRow ? 'bg-white/[0.03]' : ''}
                `}
                style={{ height: estimatedRowHeight }}
                role="row"
                aria-rowindex={rowIdx + 1}
              >
                {tableRow.getVisibleCells().map((cell, colIdx) => (
                  <div
                    key={cell.id}
                    className={`
                      flex-shrink-0 border-r border-white/5
                      ${colIdx === 0 ? 'sticky left-0 z-10 bg-[#0A0A0F]' : ''}
                    `}
                    style={{ width: cell.column.getSize(), height: '100%' }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                ))}
              </div>
            )
          })}
          {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
        </div>

        {/* New row button */}
        <button
          onClick={onRowCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.02] w-full transition-colors border-t border-white/5"
          aria-label="Add new row"
        >
          <span aria-hidden>+</span> New
        </button>
      </div>
    </div>
  )
}

function PropertyTypeIcon({ type }: { type: string }) {
  const icons: Record<string, string> = {
    title: 'T', text: 'Aa', number: '#', select: '◉', multi_select: '◈',
    status: '◎', date: '📅', datetime: '🕐', person: '👤', file: '📎',
    checkbox: '☑', url: '🔗', email: '✉', phone: '📞', formula: 'ƒ',
    relation: '↗', rollup: '∑', created_at: '🕐', updated_at: '🕑',
    created_by: '👤', last_edited_by: '✏', place: '📍', auto_increment_id: '🔢',
  }
  return <span className="text-white/40 text-xs font-mono">{icons[type] ?? '?'}</span>
}
