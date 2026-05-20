/**
 * Supabase service-role client — for server-side operations that bypass RLS.
 * Only use in server-only contexts (Route Handlers, Server Actions).
 * Never import in client components — enforced by 'server-only'.
 */
import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@zenith/shared';

let _adminClient: ReturnType<typeof createSupabaseClient> | null = null;

/**
 * Get the service-role client (singleton per server process).
 * Uses SUPABASE_SERVICE_ROLE_KEY — must never appear in client bundle.
 */
export function createAdminClient() {
  if (_adminClient) return _adminClient;

  const e = env();
  _adminClient = createSupabaseClient(
    e['NEXT_PUBLIC_SUPABASE_URL'],
    e['SUPABASE_SERVICE_ROLE_KEY'],
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    },
  );
  return _adminClient;
}
