import { supabaseAdmin } from '../supabase/admin';

export type DbViewType = 'table' | 'board' | 'gallery' | 'calendar' | 'timeline' | 'list' | 'gantt';

export interface DbViewConfig {
  filters?: any; // AND/OR tree
  sorts?: any[]; // [{ propertyId: string, direction: 'asc'|'desc' }]
  groupBy?: any; // { propertyId: string, type: string }
  hiddenProperties?: string[];
  columnWidths?: Record<string, number>;
  rowHeight?: 'compact' | 'medium' | 'tall';
}

export interface DbView {
  id: string;
  databaseId: string;
  workspaceId: string;
  name: string;
  type: DbViewType;
  config: DbViewConfig;
  position: number;
}

export const ViewRepo = {
  async listByDatabase(databaseId: string, workspaceId: string): Promise<DbView[]> {
    const { data, error } = await supabaseAdmin
      .from('db_views')
      .select('*')
      .eq('database_id', databaseId)
      .eq('workspace_id', workspaceId)
      .order('position', { ascending: true });

    if (error) throw error;

    return data.map(mapViewRow);
  },

  async create(view: Omit<DbView, 'position'>): Promise<DbView> {
    const { data, error } = await supabaseAdmin
      .from('db_views')
      .insert({
        id: view.id,
        database_id: view.databaseId,
        workspace_id: view.workspaceId,
        name: view.name,
        type: view.type,
        config: view.config,
        // Optional: fractional position logic here if needed, keeping simple for now
      })
      .select()
      .single();

    if (error) throw error;
    return mapViewRow(data);
  },

  async update(id: string, workspaceId: string, updates: Partial<DbView>): Promise<DbView> {
    const payload: any = {};
    if (updates.name !== undefined) payload.name = updates.name;
    if (updates.type !== undefined) payload.type = updates.type;
    if (updates.config !== undefined) payload.config = updates.config;
    if (updates.position !== undefined) payload.position = updates.position;

    const { data, error } = await supabaseAdmin
      .from('db_views')
      .update(payload)
      .eq('id', id)
      .eq('workspace_id', workspaceId)
      .select()
      .single();

    if (error) throw error;
    return mapViewRow(data);
  },

  async delete(id: string, workspaceId: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('db_views')
      .delete()
      .eq('id', id)
      .eq('workspace_id', workspaceId);

    if (error) throw error;
  }
};

function mapViewRow(row: any): DbView {
  return {
    id: row.id,
    databaseId: row.database_id,
    workspaceId: row.workspace_id,
    name: row.name,
    type: row.type as DbViewType,
    config: row.config || {},
    position: row.position,
  };
}
