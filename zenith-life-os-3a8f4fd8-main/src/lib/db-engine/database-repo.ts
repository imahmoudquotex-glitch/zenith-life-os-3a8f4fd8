/**
 * @zenith/db-engine — DatabaseRepo
 * CRUD on databases table — NO SQL in routes, all SQL here
 *
 * FIXED:
 * - ❌ throw → ✅ Result pattern
 * - ❌ new Date() → ✅ Clock abstraction
 * - ❌ relative import → ✅ @zenith/shared
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Result, AppError } from '@zenith/shared/result'
import { generateUlid } from '@zenith/shared/ids/ulid'
import { SystemClock } from '@zenith/shared/time/clock'

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

const clock = new SystemClock()

export class DatabaseRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(input: CreateDatabaseInput): Promise<Result<Database, AppError>> {
    const id = generateUlid()
    const { data, error } = await this.db
      .from('databases')
      .insert({ id, ...input, layout_mode: 'full_page' })
      .select()
      .single()
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.create: ${error.message}` } }
    }
    return { ok: true, value: data as Database }
  }

  async getById(id: string): Promise<Result<Database | null, AppError>> {
    const { data, error } = await this.db
      .from('databases')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()
    if (error?.code === 'PGRST116') return { ok: true, value: null }
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.getById: ${error.message}` } }
    }
    return { ok: true, value: data as Database }
  }

  async update(id: string, patch: Partial<Pick<Database,
    'title' | 'icon_kind' | 'icon_value' | 'cover_url' | 'description' | 'default_template_id'
  >>): Promise<Result<Database, AppError>> {
    const { data, error } = await this.db
      .from('databases')
      .update(patch)
      .eq('id', id)
      .eq('is_deleted', false)
      .select()
      .single()
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.update: ${error.message}` } }
    }
    return { ok: true, value: data as Database }
  }

  async softDelete(id: string): Promise<Result<void, AppError>> {
    const { error } = await this.db
      .from('databases')
      .update({ is_deleted: true, deleted_at: clock.now().toISOString() })
      .eq('id', id)
      .eq('is_system', false) // system DBs cannot be deleted
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.softDelete: ${error.message}` } }
    }
    return { ok: true, value: undefined }
  }

  async listByWorkspace(includeDeleted = false): Promise<Result<Database[], AppError>> {
    let q = this.db.from('databases').select('*').order('created_at', { ascending: true })
    if (!includeDeleted) q = q.eq('is_deleted', false)
    const { data, error } = await q
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.listByWorkspace: ${error.message}` } }
    }
    return { ok: true, value: (data ?? []) as Database[] }
  }

  async convertLayout(
    dbId: string,
    targetMode: 'full_page' | 'inline',
    targetPageId?: string
  ): Promise<Result<void, AppError>> {
    const { error } = await this.db.rpc('convert_database_layout', {
      p_db_id: dbId,
      p_target_mode: targetMode,
      p_target_page_id: targetPageId ?? null,
    })
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.convertLayout: ${error.message}` } }
    }
    return { ok: true, value: undefined }
  }

  async duplicate(id: string, newTitle?: string, copyRows = false): Promise<Result<string, AppError>> {
    const { data, error } = await this.db.rpc('duplicate_database', {
      p_source_db_id: id,
      p_new_title: newTitle ?? null,
      p_copy_rows: copyRows,
    })
    if (error) {
      return { ok: false, error: { code: 'DB_ERROR', message: `DatabaseRepo.duplicate: ${error.message}` } }
    }
    return { ok: true, value: data as string }
  }
}
