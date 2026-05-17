import { supabaseAdmin } from '../supabase/admin';

export const SystemDbSeeder = {
  async seedForWorkspace(workspaceId: string, userId: string): Promise<void> {
    // This seeds the 6 system databases: Tasks, Habits, Expenses, Notes, Goals, Projects
    // Implementation uses an RPC or multiple inserts. We assume the RPC `seed_system_databases` is available.
    
    const { error } = await supabaseAdmin.rpc('seed_system_databases', {
      p_workspace_id: workspaceId,
      p_user_id: userId
    });

    if (error) {
      console.error('Failed to seed system databases:', error);
      throw error;
    }
  }
};
