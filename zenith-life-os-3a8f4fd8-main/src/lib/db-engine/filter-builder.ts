/**
 * packages/db-engine/src/filter-builder.ts
 * AND/OR filter groups → parametrized SQL (NO string concat with user values)
 */

export type FilterOperator =
  // text
  | 'contains' | 'not_contains' | 'equals' | 'not_equals'
  | 'starts_with' | 'ends_with' | 'is_empty' | 'is_not_empty'
  // number
  | 'number_equals' | 'number_not_equals' | 'greater_than' | 'less_than'
  | 'greater_or_equal' | 'less_or_equal' | 'between'
  // date
  | 'date_is' | 'date_before' | 'date_after'
  | 'date_this_week' | 'date_last_30d' | 'date_is_empty' | 'date_is_not_empty'
  // select
  | 'select_is' | 'select_is_not' | 'select_is_empty'
  // multi_select
  | 'multi_contains_any' | 'multi_contains_all' | 'multi_is_empty'
  // person
  | 'person_is_me' | 'person_is' | 'person_is_empty'
  // checkbox
  | 'checkbox_checked' | 'checkbox_unchecked'
  // relation
  | 'relation_contains' | 'relation_is_empty'

export interface FilterCondition {
  type: 'condition'
  property: string
  operator: FilterOperator
  value?: unknown
}

export interface FilterGroup {
  type: 'group'
  logic: 'AND' | 'OR'
  children: Array<FilterCondition | FilterGroup>
}

export type Filter = FilterCondition | FilterGroup

const MAX_NESTING_DEPTH = 3

function buildConditionSql(
  cond: FilterCondition,
  params: unknown[],
  depth: number
): string {
  if (depth > MAX_NESTING_DEPTH) throw new Error('filter_nesting_too_deep')

  const prop = cond.property.replace(/[^a-zA-Z0-9_]/g, '') // sanitize property name

  const pushParam = (v: unknown): string => {
    params.push(v)
    return `$${params.length}`
  }

  const propPath = `(properties->>${pushParam(prop)})`

  switch (cond.operator) {
    case 'contains':
      return `${propPath} ILIKE ${pushParam(`%${cond.value}%`)}`
    case 'not_contains':
      return `${propPath} NOT ILIKE ${pushParam(`%${cond.value}%`)}`
    case 'equals':
    case 'number_equals':
    case 'select_is':
      return `${propPath} = ${pushParam(String(cond.value))}`
    case 'not_equals':
    case 'number_not_equals':
    case 'select_is_not':
      return `${propPath} != ${pushParam(String(cond.value))}`
    case 'starts_with':
      return `${propPath} ILIKE ${pushParam(`${cond.value}%`)}`
    case 'ends_with':
      return `${propPath} ILIKE ${pushParam(`%${cond.value}`)}`
    case 'is_empty':
    case 'select_is_empty':
    case 'date_is_empty':
    case 'person_is_empty':
    case 'relation_is_empty':
    case 'multi_is_empty':
      return `(${propPath} IS NULL OR ${propPath} = '')`
    case 'is_not_empty':
    case 'date_is_not_empty':
      return `(${propPath} IS NOT NULL AND ${propPath} != '')`
    case 'greater_than':
      return `(${propPath})::NUMERIC > ${pushParam(Number(cond.value))}`
    case 'less_than':
      return `(${propPath})::NUMERIC < ${pushParam(Number(cond.value))}`
    case 'greater_or_equal':
      return `(${propPath})::NUMERIC >= ${pushParam(Number(cond.value))}`
    case 'less_or_equal':
      return `(${propPath})::NUMERIC <= ${pushParam(Number(cond.value))}`
    case 'between': {
      const [min, max] = cond.value as [number, number]
      return `(${propPath})::NUMERIC BETWEEN ${pushParam(min)} AND ${pushParam(max)}`
    }
    case 'date_is':
      return `(${propPath})::DATE = ${pushParam(cond.value)}`
    case 'date_before':
      return `(${propPath})::TIMESTAMPTZ < ${pushParam(cond.value)}`
    case 'date_after':
      return `(${propPath})::TIMESTAMPTZ > ${pushParam(cond.value)}`
    case 'date_this_week':
      return `(${propPath})::DATE BETWEEN date_trunc('week',now())::DATE AND (date_trunc('week',now())+INTERVAL'6 days')::DATE`
    case 'date_last_30d':
      return `(${propPath})::DATE >= (now()-INTERVAL'30 days')::DATE`
    case 'checkbox_checked':
      return `(${propPath})::BOOLEAN = TRUE`
    case 'checkbox_unchecked':
      return `((${propPath})::BOOLEAN = FALSE OR ${propPath} IS NULL)`
    case 'person_is_me':
      return `properties->${pushParam(prop)} @> current_user_id()::jsonb`
    case 'person_is':
      return `properties->${pushParam(prop)} @> ${pushParam(JSON.stringify([cond.value]))}::jsonb`
    case 'multi_contains_any':
      return `properties->${pushParam(prop)} ?| ARRAY[${(cond.value as string[]).map(v => pushParam(v)).join(',')}]`
    case 'multi_contains_all':
      return `properties->${pushParam(prop)} ?& ARRAY[${(cond.value as string[]).map(v => pushParam(v)).join(',')}]`
    case 'relation_contains':
      return `EXISTS (SELECT 1 FROM db_relation_values rv WHERE rv.source_row_id = db_rows.id AND rv.target_row_id = ${pushParam(cond.value)})`
    default:
      throw new Error(`unknown_filter_operator: ${cond.operator}`)
  }
}

function buildFilterSqlInner(
  filter: Filter,
  params: unknown[],
  depth = 0
): string {
  if (depth > MAX_NESTING_DEPTH) throw new Error('filter_nesting_too_deep')

  if (filter.type === 'condition') {
    return buildConditionSql(filter, params, depth)
  }

  if (filter.children.length === 0) return '1=1'

  const parts = filter.children.map(child => buildFilterSqlInner(child, params, depth + 1))
  return `(${parts.join(` ${filter.logic} `)})`
}

/**
 * Builds a parametrized SQL WHERE clause from a filter tree.
 * Returns { sql, params } — use with Supabase RPC or query builder.
 * NEVER concatenates user values directly into SQL strings.
 */
export function buildFilterSql(filter: Filter | null | undefined): { sql: string; params: unknown[] } {
  if (!filter) return { sql: '1=1', params: [] }
  const params: unknown[] = []
  const sql = buildFilterSqlInner(filter, params, 0)
  return { sql, params }
}
