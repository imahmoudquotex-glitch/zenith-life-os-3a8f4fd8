/**
 * @zenith/auth — Server-side Supabase client
 * Creates authenticated Supabase client from request cookies.
 * Cookie-based auth: HttpOnly + Secure + SameSite=Lax
 */

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { env } from '@zenith/shared'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Create a Supabase client for server-side operations (RSC, Route Handlers).
 * Reads/writes auth tokens from request cookies.
 */
export function createServerSupabaseClient(
  cookieStore: {
    get: (name: string) => { value: string } | undefined
    set: (name: string, value: string, options: CookieOptions) => void
    delete: (name: string, options: CookieOptions) => void
  }
): SupabaseClient {
  const config = env()
  return createServerClient(
    config.NEXT_PUBLIC_SUPABASE_URL,
    config.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete(name, options)
        },
      },
    }
  )
}

export type { SupabaseClient }
