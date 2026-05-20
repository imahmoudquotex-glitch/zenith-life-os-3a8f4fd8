/**
 * Supabase server client — for Server Components, Route Handlers, and Middleware.
 * Reads cookies from the request. Call once per request.
 */
import { createServerClient } from '@supabase/ssr'
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { env } from '@zenith/shared'

export async function createClient() {
  const cookieStore = await cookies()
  const e = env()

  return createServerClient(
    e['NEXT_PUBLIC_SUPABASE_URL'],
    e['NEXT_PUBLIC_SUPABASE_ANON_KEY'],
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Partial<ResponseCookie> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component — cookie writes are ignored (handled by middleware)
          }
        },
      },
    },
  )
}
