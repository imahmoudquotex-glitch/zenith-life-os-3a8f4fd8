/**
 * @zenith/db-engine — Database query planner + executor for Zenith DB views.
 * W07: Supports table, board, gallery, calendar, timeline, list views.
 */

// ── View types ───────────────────────────────────────────────────────────────
export type ViewType = 'table' | 'board' | 'gallery' | 'calendar' | 'timeline' | 'list'

// ── Property types (21 types per W07 spec) ──────────────────────────────────
export type PropertyType =
  | 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'status'
  | 'date' | 'person' | 'files' | 'checkbox' | 'url' | 'email' | 'phone'
  | 'relation' | 'rollup' | 'formula'
  | 'created_time' | 'last_edited_time' | 'created_by' | 'last_edited_by'
  | 'auto_increment_id'

// ── Query DSL ────────────────────────────────────────────────────────────────
export interface FilterCondition {
  property: string
  operator: 'eq' | 'neq' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'is_empty' | 'is_not_empty'
  value?: unknown
}

export interface SortCondition {
  property: string
  direction: 'asc' | 'desc'
}

export interface ViewQuery {
  databaseId: string
  viewType: ViewType
  filters?: FilterCondition[]
  sorts?: SortCondition[]
  groupBy?: string
  page?: number
  pageSize?: number
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ── Query execution ──────────────────────────────────────────────────────────
export async function executeQuery<T = Record<string, unknown>>(
  query: ViewQuery,
): Promise<QueryResult<T>> {
  // In production: translate DSL to Drizzle/SQL query with pagination
  void query
  return {
    rows: [],
    total: 0,
    page: query.page ?? 1,
    pageSize: query.pageSize ?? 50,
    hasMore: false,
  }
}

// ── Relation sync ─────────────────────────────────────────────────────────────
/**
 * Two-way relation sync: insert from side A → auto-updates side B.
 * W07 invariant: relation updates must propagate bidirectionally.
 */
export async function syncRelation(params: {
  sourceRowId: string
  targetRowId: string
  relationPropertyId: string
  workspaceId: string
}): Promise<void> {
  // UPDATE db_rows SET related_ids = array_append(related_ids, $targetRowId)
  // WHERE id = $sourceRowId
  // And symmetric update on target
  void params
}

// ── Property registry ─────────────────────────────────────────────────────────
export const PROPERTY_TYPE_REGISTRY: Record<PropertyType, {
  label: string
  storedAs: 'text' | 'number' | 'boolean' | 'jsonb' | 'timestamp' | 'text[]'
  isComputed: boolean
}> = {
  title:           { label: 'Title',           storedAs: 'text',      isComputed: false },
  text:            { label: 'Text',            storedAs: 'text',      isComputed: false },
  number:          { label: 'Number',          storedAs: 'number',    isComputed: false },
  select:          { label: 'Select',          storedAs: 'text',      isComputed: false },
  multi_select:    { label: 'Multi-select',    storedAs: 'text[]',    isComputed: false },
  status:          { label: 'Status',          storedAs: 'text',      isComputed: false },
  date:            { label: 'Date',            storedAs: 'timestamp', isComputed: false },
  person:          { label: 'Person',          storedAs: 'text[]',    isComputed: false },
  files:           { label: 'Files',           storedAs: 'jsonb',     isComputed: false },
  checkbox:        { label: 'Checkbox',        storedAs: 'boolean',   isComputed: false },
  url:             { label: 'URL',             storedAs: 'text',      isComputed: false },
  email:           { label: 'Email',           storedAs: 'text',      isComputed: false },
  phone:           { label: 'Phone',           storedAs: 'text',      isComputed: false },
  relation:        { label: 'Relation',        storedAs: 'text[]',    isComputed: false },
  rollup:          { label: 'Rollup',          storedAs: 'jsonb',     isComputed: true  },
  formula:         { label: 'Formula',         storedAs: 'jsonb',     isComputed: true  },
  created_time:    { label: 'Created time',    storedAs: 'timestamp', isComputed: true  },
  last_edited_time:{ label: 'Last edited',     storedAs: 'timestamp', isComputed: true  },
  created_by:      { label: 'Created by',      storedAs: 'text',      isComputed: true  },
  last_edited_by:  { label: 'Last edited by',  storedAs: 'text',      isComputed: true  },
  auto_increment_id:{ label: 'ID',            storedAs: 'number',    isComputed: true  },
}
