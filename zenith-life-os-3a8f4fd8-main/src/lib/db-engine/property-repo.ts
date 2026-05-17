/**
 * packages/db-engine/src/property-repo.ts
 * CRUD on db_properties — config validation per type
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import { generateULID } from '../../block-engine/src/fractional-index'

export type DbPropertyType =
  | 'title' | 'text' | 'number' | 'select' | 'multi_select' | 'status'
  | 'date' | 'datetime' | 'person' | 'file' | 'checkbox' | 'url'
  | 'email' | 'phone' | 'formula' | 'relation' | 'rollup'
  | 'created_at' | 'updated_at' | 'created_by' | 'last_edited_by'
  | 'place' | 'auto_increment_id'

/** Closed set — 19 types + system computed types = 23 total */
export const ALLOWED_PROPERTY_TYPES: DbPropertyType[] = [
  'title', 'text', 'number', 'select', 'multi_select', 'status',
  'date', 'datetime', 'person', 'file', 'checkbox', 'url',
  'email', 'phone', 'formula', 'relation', 'rollup',
  'created_at', 'updated_at', 'created_by', 'last_edited_by',
  'place', 'auto_increment_id',
]

/** Types that are vault-sensitive (blocked from AI context) */
export const VAULT_SENSITIVE_TYPES: DbPropertyType[] = ['email', 'phone', 'place']

/** Types that cannot be user-edited (read-only computed) */
export const COMPUTED_TYPES: DbPropertyType[] = [
  'created_at', 'updated_at', 'created_by', 'last_edited_by', 'auto_increment_id', 'rollup',
]

export interface DbProperty {
  id: string
  database_id: string
  workspace_id: string
  name: string
  type: DbPropertyType
  config: Record<string, unknown>
  position: number
  is_primary: boolean
  is_hidden: boolean
  is_system: boolean
  created_at: string
  updated_at: string
}

export interface SelectOption {
  id: string
  name: string
  color: string
  group?: 'todo' | 'in_progress' | 'done'
}

export interface PropertyConfig {
  // select / multi_select / status
  options?: SelectOption[]
  // number
  format?: 'number' | 'currency_cents' | 'percent' | 'integer'
  // date
  include_time?: boolean
  // url
  show_preview?: boolean
  // formula — placeholder for W08
  formula_expression?: string
  // relation
  target_database_id?: string
  limit?: number
  // rollup
  relation_property_id?: string
  target_property_name?: string
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'percent_checked' | 'percent_empty' | 'earliest' | 'latest'
}

function validateConfig(type: DbPropertyType, config: Record<string, unknown>): void {
  if (type === 'select' || type === 'multi_select' || type === 'status') {
    if (config['options'] !== undefined && !Array.isArray(config['options'])) {
      throw new Error('property_config: options must be array')
    }
  }
  if (type === 'number') {
    const fmt = config['format']
    if (fmt && !['number', 'currency_cents', 'percent', 'integer'].includes(fmt as string)) {
      throw new Error('property_config: invalid number format')
    }
  }
  if (type === 'formula') {
    // Placeholder — formula eval blocked until W08
    if (config['formula_expression']) {
      throw new Error('formula_eval_blocked_until_w08')
    }
  }
  if (type === 'relation') {
    if (!config['target_database_id']) {
      throw new Error('property_config: relation requires target_database_id')
    }
  }
}

export class PropertyRepo {
  constructor(private readonly db: SupabaseClient) {}

  async create(
    databaseId: string,
    name: string,
    type: DbPropertyType,
    config: PropertyConfig = {}
  ): Promise<DbProperty> {
    if (!ALLOWED_PROPERTY_TYPES.includes(type)) {
      throw new Error(`unknown_property_type: ${type}`)
    }
    validateConfig(type, config as Record<string, unknown>)

    // Get next position
    const { data: last } = await this.db
      .from('db_properties')
      .select('position')
      .eq('database_id', databaseId)
      .order('position', { ascending: false })
      .limit(1)
      .single()

    const position = last ? (last.position as number) + 1000 : 1000

    const { data, error } = await this.db
      .from('db_properties')
      .insert({
        id: generateULID(),
        database_id: databaseId,
        name,
        type,
        config,
        position,
        is_primary: false,
      })
      .select()
      .single()

    if (error) throw new Error(`PropertyRepo.create: ${error.message}`)
    return data as DbProperty
  }

  async update(
    id: string,
    patch: Partial<Pick<DbProperty, 'name' | 'is_hidden' | 'position'> & { config: PropertyConfig }>
  ): Promise<DbProperty> {
    if (patch.config) {
      const existing = await this.getById(id)
      if (existing) validateConfig(existing.type, patch.config as Record<string, unknown>)
    }

    const { data, error } = await this.db
      .from('db_properties')
      .update(patch)
      .eq('id', id)
      .eq('is_system', false) // system props are immutable
      .select()
      .single()
    if (error) throw new Error(`PropertyRepo.update: ${error.message}`)
    return data as DbProperty
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.db
      .from('db_properties')
      .delete()
      .eq('id', id)
      .eq('is_primary', false)  // primary property cannot be deleted
      .eq('is_system', false)   // system properties cannot be deleted
    if (error) throw new Error(`PropertyRepo.delete: ${error.message}`)
  }

  async getById(id: string): Promise<DbProperty | null> {
    const { data, error } = await this.db
      .from('db_properties')
      .select('*')
      .eq('id', id)
      .single()
    if (error?.code === 'PGRST116') return null
    if (error) throw new Error(`PropertyRepo.getById: ${error.message}`)
    return data as DbProperty
  }

  async listByDatabase(databaseId: string): Promise<DbProperty[]> {
    const { data, error } = await this.db
      .from('db_properties')
      .select('*')
      .eq('database_id', databaseId)
      .order('position', { ascending: true })
    if (error) throw new Error(`PropertyRepo.listByDatabase: ${error.message}`)
    return (data ?? []) as DbProperty[]
  }

  /** Assert no vault-sensitive property gets AI context */
  isVaultSensitive(property: DbProperty): boolean {
    return (
      VAULT_SENSITIVE_TYPES.includes(property.type) ||
      (property.config as Record<string, unknown>)['is_vault_sensitive'] === true
    )
  }
}
