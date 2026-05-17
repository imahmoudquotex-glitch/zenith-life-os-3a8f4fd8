import { logger } from '../logger';
import { supabase } from '../supabase/client';

export class CacheRepo {
  public static async upsert(workspaceId: string, formulaId: string, rowId: string, value: unknown): Promise<void> {
    const { error } = await supabase
      .from('formula_cache')
      .upsert({
        workspace_id: workspaceId,
        formula_id: formulaId,
        row_id: rowId,
        value: value,
        is_stale: false,
        computed_at: new Date().toISOString()
      }, { onConflict: 'formula_id, row_id' });

    if (error) {
      logger.error({ error, formulaId, rowId }, 'Failed to upsert formula cache');
      throw error;
    }
  }

  public static async invalidate(formulaId: string, rowId?: string): Promise<void> {
    let query = supabase
      .from('formula_cache')
      .update({ is_stale: true })
      .eq('formula_id', formulaId);
      
    if (rowId) {
      query = query.eq('row_id', rowId);
    }

    const { error } = await query;
    if (error) {
      logger.error({ error, formulaId }, 'Failed to invalidate formula cache');
      throw error;
    }
  }

  public static async get(formulaId: string, rowId: string): Promise<unknown | null> {
    const { data, error } = await supabase
      .from('formula_cache')
      .select('value, is_stale')
      .eq('formula_id', formulaId)
      .eq('row_id', rowId)
      .single();

    if (error || !data || data.is_stale) return null;
    return data.value;
  }
}
