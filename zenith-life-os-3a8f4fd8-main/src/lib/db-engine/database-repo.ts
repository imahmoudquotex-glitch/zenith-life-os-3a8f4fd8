/**
 * packages/db-engine/src/database-repo.ts
 * CRUD on databases table — NO SQL in routes, all SQL here
 */
import { createClient } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateULID } from '../../block-engine/src/fractional-index'

export interface Database {
  id: string
  workspace_id: string
  inline_block_id?: string | null
  title: string
  icon_kind?: string | null
  icon_value?: string | null
  cover_url?: string | null
  description?: string | null
  is_system: boolean
  default_template_id?: string | null
  is_deleted: boolean
  deleted_at?: string | null
  layout_mode: 'full_page' | 'inline'
  host_block_id?: string | null
  host_page_id?: string | null
  created_by_user_id: string
  created_at: string
  updated_at: string
}

export interface CreateDatabaseInput {
  title: string
  icon_kind?: string
  icon_value?: string
  cover_url?: string
  description?: string
}

export class DatabaseRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateDatabaseInput): Promise<Database> {
    const id = generateULID()
    const { data, error } = await this.db
      .from('databases')
      .insert({ id, ...input, layout_mode: 'full_page' })
      .select()
      .single()
    if (error) throw new Error(`DatabaseRepo.create: ${error.message}`)
    return data as Database
  }

  async getById(id: string): Promise<Database | null> {
    const { data, error } = await this.db
      .from('databases')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()
    if (error?.code === 'PGRST116') return null
    if (error) throw new Error(`DatabaseRepo.getById: ${error.message}`)
    return data as Database
  }

  async update(id: string, patch: Partial<Pick<Database,
    'title' | 'icon_kind' | 'icon_value' | 'cover_url' | 'description' | 'default_template_id'
  >>): Promise<Database> {
    const { data, error } = await this.db
      .from('databases')
      .update(patch)
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single()
    if (error) throw new Error(`DatabaseRepo.update: ${error.message}`)
    return data as Database
  }

  async softDelete(id: string): Promise<void> {
    const { error } = await this.db
      .from('databases')
      .update({ is_deleted: true, deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('is_system', false) // system DBs cannot be deleted
    if (error) throw new Error(`DatabaseRepo.softDelete: ${error.message}`)
  }

  async listByWorkspace(includeDeleted = false): Promise<Database[]> {
    let q = this.db.from('databases').select('*').order('created_at', { ascending: true })
    if (!includeDeleted) q = q.eq('is_deleted', false)
    const { data, error } = await q
    if (error) throw new Error(`DatabaseRepo.listByWorkspace: ${error.message}`)
    return (data ?? []) as Database[]
  }

  async convertLayout(
    dbId: string,
    targetMode: 'full_page' | 'inline',
    targetPageId?: string
  ): Promise<void> {
    const { error } = await this.db.rpc('convert_database_layout', {
      p_db_id: dbId,
      p_target_mode: targetMode,
      p_target_page_id: targetPageId ?? null,
    })
    if (error) throw new Error(`DatabaseRepo.convertLayout: ${error.message}`)
  }

  async duplicate(id: string, newTitle?: string, copyRows = false): Promise<string> {
    const { data, error } = await this.db.rpc('duplicate_database', {
      p_source_db_id: id,
      p_new_title: newTitle ?? null,
      p_copy_rows: copyRows,
    })
    if (error) throw new Error(`DatabaseRepo.duplicate: ${error.message}`)
    return data as string
  }
}
