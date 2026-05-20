/**
 * Supabase browser client — SSR-safe singleton.
 * Use in Client Components only.
 */
import { createBrowserClient } from '@supabase/ssr'
import { env } from '@zenith/shared'

export function createClient() {
  const e = env()
  return createBrowserClient(
    e['NEXT_PUBLIC_SUPABASE_URL'],
    e['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
  )
}
