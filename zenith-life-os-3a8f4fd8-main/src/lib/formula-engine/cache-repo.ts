import { supabase } from '../supabase/client';

export class CacheRepo {
  public static async upsert(workspaceId: string, formulaId: string, rowId: string, value: any) {
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
      console.error('Failed to upsert cache', error);
      throw error;
    }
  }

  public static async invalidate(formulaId: string, rowId?: string) {
    let query = supabase
      .from('formula_cache')
      .update({ is_stale: true })
      .eq('formula_id', formulaId);
      
    if (rowId) {
      query = query.eq('row_id', rowId);
    }

    const { error } = await query;
    if (error) throw error;
  }
}
