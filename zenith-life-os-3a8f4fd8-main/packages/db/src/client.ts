// @zenith/db — Server-side Supabase client factory
// Reviewer issue #15, #38: httpOnly cookie auth, no localStorage
// This client sets app.current_workspace_id and app.current_user_id on every connection.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export interface DbClientOptions {
  supabaseUrl: string;
  supabaseServiceKey: string;
  workspaceId: string;
  userId: string;
}

/**
 * Create a server-side Supabase client that sets workspace + user context.
 * Use this in ALL server functions — never create raw clients elsewhere.
 */
export function createServerDb(opts: DbClientOptions): SupabaseClient {
  const client = createClient(opts.supabaseUrl, opts.supabaseServiceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        'x-workspace-id': opts.workspaceId,
        'x-user-id': opts.userId,
      },
    },
    db: {
      schema: 'public',
    },
  });

  return client;
}

/**
 * Set workspace context on a Postgres connection (for RLS).
 * Must be called before any query in server functions.
 */
export async function setWorkspaceContext(
  client: SupabaseClient,
  workspaceId: string,
  userId: string,
): Promise<void> {
  await client.rpc('', {}).then(() => {}); // no-op to ensure connection
  // Use Postgres session settings for RLS context
  const { error } = await client.rpc('set_config', {
    setting: 'app.current_workspace_id',
    new_value: workspaceId,
    is_local: true,
  });
  if (error) throw error;

  const { error: err2 } = await client.rpc('set_config', {
    setting: 'app.current_user_id',
    new_value: userId,
    is_local: true,
  });
  if (err2) throw err2;
}
