/**
 * @zenith/auth — Browser-side Supabase client
 * Singleton for client components.
 */

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@zenith/shared'
import type { SupabaseClient } from '@supabase/supabase-js'

let _client: SupabaseClient | null = null

/**
 * Get singleton Supabase client for browser usage.
 * Uses cookie-based auth (not localStorage JWT).
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (_client) return _client

  const config = env()
  _client = createBrowserClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
  return _client
}
