import { supabaseAdmin } from '../supabase/admin';

export const TemplateSeeder = {
  async seedTemplate(databaseId: string, workspaceId: string, templateName: string, properties: any): Promise<void> {
    // In a real implementation this would create a row with a specific 'is_template' flag 
    // or add it to a dedicated db_templates table based on migration 0716.
    
    // Using an RPC call or direct insert
    // Example:
    const { error } = await supabaseAdmin.from('db_templates').insert({
      id: crypto.randomUUID(),
      database_id: databaseId,
      workspace_id: workspaceId,
      name: templateName,
      default_properties: properties
    });

    if (error) {
      console.error('Failed to seed template:', error);
    }
  }
};
