/**
 * packages/db-engine/src/row-repo.ts
 * CRUD on db_rows — fractional indexing + soft delete + JSONB property updates
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateULID } from '../../block-engine/src/fractional-index'

export interface DbRow {
  id: string
  database_id: string
  workspace_id: string
  page_id?: string | null
  properties: Record<string, unknown>
  position: number
  is_deleted: boolean
  deleted_at?: string | null
  created_by_user_id: string
  last_edited_by_user_id: string
  created_at: string
  updated_at: string
  version: number
  search_tsv?: string
}

export interface CreateRowInput {
  database_id: string
  properties?: Record<string, unknown>
  page_id?: string
}

export interface UpdateRowInput {
  properties?: Record<string, unknown>
  page_id?: string
}

export interface RowQueryOptions {
  filter?: string        // pre-built safe SQL fragment (from filter-builder)
  filterParams?: unknown[]
  sort?: string          // pre-built ORDER BY (from sort-builder)
  limit?: number
  offset?: number
  includeDeleted?: boolean
}

export class RowRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateRowInput): Promise<DbRow> {
    // Get max position for initial ordering
    const { data: maxData } = await this.db
      .from('db_rows')
      .select('position')
      .eq('database_id', input.database_id)
      .eq('is_deleted', false)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const position = maxData ? (maxData.position as number) + 1000 : 1000

    const { data, error } = await this.db
      .from('db_rows')
      .insert({
        id: generateULID(),
        database_id: input.database_id,
        properties: input.properties ?? {},
        page_id: input.page_id ?? null,
        position,
      })
      .select()
      .single()

    if (error) throw new Error(`RowRepo.create: ${error.message}`)
    return data as DbRow
  }

  async getById(id: string): Promise<DbRow | null> {
    const { data, error } = await this.db
      .from('db_rows')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()
    if (error?.code === 'PGRST116') return null
    if (error) throw new Error(`RowRepo.getById: ${error.message}`)
    return data as DbRow
  }

  async update(id: string, input: UpdateRowInput): Promise<DbRow> {
    const patch: Record<string, unknown> = {}
    if (input.properties !== undefined) patch['properties'] = input.properties
    if (input.page_id !== undefined) patch['page_id'] = input.page_id

    const { data, error } = await this.db
      .from('db_rows')
      .update(patch)
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single()
    if (error) throw new Error(`RowRepo.update: ${error.message}`)
    return data as DbRow
  }

  async updateProperty(
    id: string,
    propertyName: string,
    value: unknown
  ): Promise<void> {
    // Use Supabase jsonb update to avoid full property overwrite race
    const { error } = await this.db.rpc('update_row_property', {
      p_row_id: id,
      p_property_name: propertyName,
      p_value: JSON.stringify(value),
    })
    if (error) {
      // Fallback: fetch + merge + update
      const row = await this.getById(id)
      if (!row) throw new Error('row_not_found')
      await this.update(id, {
        properties: { ...row.properties, [propertyName]: value },
      })
    }
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.db
      .from('db_rows')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw new Error(`RowRepo.softDelete: ${error.message}`)
  }

  async reorder(
    rowId: string,
    prevPos: number | null,
    nextPos: number | null
  ): Promise<number> {
    const { data, error } = await this.db.rpc('reorder_row', {
      p_row_id: rowId,
      p_prev_pos: prevPos,
      p_next_pos: nextPos,
    })
    if (error) throw new Error(`RowRepo.reorder: ${error.message}`)
    return data as number
  }

  async listByDatabase(
    databaseId: string,
    opts: RowQueryOptions = {}
  ): Promise<DbRow[]> {
    let q = this.db
      .from('db_rows')
      .select('id, database_id, workspace_id, page_id, properties, position, created_at, updated_at, version, created_by_user_id, last_edited_by_user_id')
      .eq('database_id', databaseId)
      .order('position', { ascending: true })

    if (!opts.includeDeleted) q = q.eq('is_deleted', false)
    if (opts.limit) q = q.limit(opts.limit)
    if (opts.offset) q = q.range(opts.offset, opts.offset + (opts.limit ?? 100) - 1)

    const { data, error } = await q
    if (error) throw new Error(`RowRepo.listByDatabase: ${error.message}`)
    return (data ?? []) as DbRow[]
  }

  async bulkCreate(
    databaseId: string,
    rows: Array<Record<string, unknown>>
  ): Promise<DbRow[]> {
    const inserts = rows.map((props, i) => ({
      id: generateULID(),
      database_id: databaseId,
      properties: props,
      position: (i + 1) * 1000,
    }))

    const { data, error } = await this.db
      .from('db_rows')
      .insert(inserts)
      .select()

    if (error) throw new Error(`RowRepo.bulkCreate: ${error.message}`)
    return (data ?? []) as DbRow[]
  }

  async search(databaseId: string, query: string, limit = 20): Promise<DbRow[]> {
    const { data, error } = await this.db
      .from('db_rows')
      .select('*')
      .eq('database_id', databaseId)
      .eq('is_deleted', false)
      .textSearch('search_tsv', query, { type: 'websearch' })
      .limit(limit)
    if (error) throw new Error(`RowRepo.search: ${error.message}`)
    return (data ?? []) as DbRow[]
  }
}
