/**
 * packages/db-engine/src/rollup-engine.ts
 * Server-side rollup wrapper — NEVER compute client-side
 */
import type { SupabaseClient } from '@supabase/supabase-js'

export type RollupAggregation =
  | 'count' | 'sum' | 'avg' | 'min' | 'max'
  | 'percent_checked' | 'percent_empty'
  | 'earliest' | 'latest'

export interface RollupResult {
  value: number | string | null
  agg: RollupAggregation
}

export class RollupEngine {
  constructor(private readonly db: SupabaseClient) {}

  /**
   * Compute rollup on server via RPC.
   * This is the ONLY place rollup values are computed — NEVER on client.
   */
  async compute(
    propertyId: string,
    sourceRowId: string,
    targetPropertyName: string,
    aggregation: RollupAggregation
  ): Promise<RollupResult> {
    const { data, error } = await this.db.rpc('compute_rollup', {
      p_property_id: propertyId,
      p_source_row_id: sourceRowId,
      p_target_property_name: targetPropertyName,
      p_agg: aggregation,
    })
    if (error) throw new Error(`RollupEngine.compute: ${error.message}`)
    return data as RollupResult
  }

  /**
   * Batch compute rollups for multiple source rows.
   * Used to populate table cells efficiently.
   */
  async batchCompute(
    propertyId: string,
    sourceRowIds: string[],
    targetPropertyName: string,
    aggregation: RollupAggregation
  ): Promise<Map<string, RollupResult>> {
    const results = new Map<string, RollupResult>()
    // Parallel but capped at 10 concurrent RPCs to avoid connection saturation
    const CONCURRENCY = 10
    for (let i = 0; i < sourceRowIds.length; i += CONCURRENCY) {
      const batch = sourceRowIds.slice(i, i + CONCURRENCY)
      const promises = batch.map(rowId =>
        this.compute(propertyId, rowId, targetPropertyName, aggregation)
          .then(result => results.set(rowId, result))
          .catch(() => results.set(rowId, { value: null, agg: aggregation }))
      )
      await Promise.all(promises)
    }
    return results
  }
}

/**
 * relation-repo.ts — relations link/unlink with auto-synced property
 */
export interface RelationLink {
  id: string
  workspace_id: string
  property_id: string
  source_row_id: string
  target_row_id: string
  created_at: string
}

export class RelationRepo {
  constructor(private readonly db: SupabaseClient) {}

  async link(
    propertyId: string,
    sourceRowId: string,
    targetRowId: string
  ): Promise<RelationLink> {
    const { data, error } = await this.db
      .from('db_relation_values')
      .insert({
        id: crypto.randomUUID(),
        property_id: propertyId,
        source_row_id: sourceRowId,
        target_row_id: targetRowId,
      })
      .select()
      .single()
    if (error) throw new Error(`RelationRepo.link: ${error.message}`)
    return data as RelationLink
  }

  async unlink(
    propertyId: string,
    sourceRowId: string,
    targetRowId: string
  ): Promise<void> {
    const { error } = await this.db
      .from('db_relation_values')
      .delete()
      .eq('property_id', propertyId)
      .eq('source_row_id', sourceRowId)
      .eq('target_row_id', targetRowId)
    if (error) throw new Error(`RelationRepo.unlink: ${error.message}`)
  }

  async getLinkedRows(
    propertyId: string,
    sourceRowId: string
  ): Promise<string[]> {
    const { data, error } = await this.db
      .from('db_relation_values')
      .select('target_row_id')
      .eq('property_id', propertyId)
      .eq('source_row_id', sourceRowId)
    if (error) throw new Error(`RelationRepo.getLinkedRows: ${error.message}`)
    return (data ?? []).map((r: { target_row_id: string }) => r.target_row_id)
  }

  async getBacklinks(
    syncedPropertyId: string,
    targetRowId: string
  ): Promise<string[]> {
    const { data, error } = await this.db
      .from('db_relation_values')
      .select('source_row_id')
      .eq('property_id', syncedPropertyId)
      .eq('target_row_id', targetRowId)
    if (error) throw new Error(`RelationRepo.getBacklinks: ${error.message}`)
    return (data ?? []).map((r: { source_row_id: string }) => r.source_row_id)
  }
}
