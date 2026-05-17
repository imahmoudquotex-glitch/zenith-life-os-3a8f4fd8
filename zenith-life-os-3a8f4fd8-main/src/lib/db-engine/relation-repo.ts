import { supabaseAdmin } from '../supabase/admin';

export interface RelationLink {
  id: string;
  workspaceId: string;
  propertyId: string;
  sourceRowId: string;
  targetRowId: string;
}

export const RelationRepo = {
  async linkRows(workspaceId: string, propertyId: string, sourceRowId: string, targetRowId: string): Promise<RelationLink> {
    const { data, error } = await supabaseAdmin
      .from('db_relation_values')
      .insert({
        workspace_id: workspaceId,
        property_id: propertyId,
        source_row_id: sourceRowId,
        target_row_id: targetRowId,
      })
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      workspaceId: data.workspace_id,
      propertyId: data.property_id,
      sourceRowId: data.source_row_id,
      targetRowId: data.target_row_id,
    };
  },

  async unlinkRows(workspaceId: string, propertyId: string, sourceRowId: string, targetRowId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('db_relation_values')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('property_id', propertyId)
      .eq('source_row_id', sourceRowId)
      .eq('target_row_id', targetRowId);

    if (error) throw error;
  },

  async getLinkedRows(workspaceId: string, propertyId: string, sourceRowId: string): Promise<string[]> {
    const { data, error } = await supabaseAdmin
      .from('db_relation_values')
      .select('target_row_id')
      .eq('workspace_id', workspaceId)
      .eq('property_id', propertyId)
      .eq('source_row_id', sourceRowId);

    if (error) throw error;
    return data.map((r: any) => r.target_row_id);
  }
};
