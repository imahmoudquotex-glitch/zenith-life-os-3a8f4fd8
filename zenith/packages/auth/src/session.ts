/**
 * @zenith/auth — Session helpers
 * Extract current user from Supabase session.
 * NEVER trust JWT from localStorage — always use getUser() server-side.
 */

import type { SupabaseClient } from '@supabase/supabase-js'
import { ZenithError } from '@zenith/shared'

export interface SessionUser {
  id: string
  email: string
  emailVerified: boolean
}

/**
 * Get current authenticated user from Supabase session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(supabase: SupabaseClient): Promise<SessionUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) return null

  return {
    id: user.id,
    email: user.email!,
    emailVerified: !!user.email_confirmed_at,
  }
}

/**
 * Require authenticated user — throws AUTH_001 if not logged in.
 */
export async function requireUser(supabase: SupabaseClient): Promise<SessionUser> {
  const user = await getCurrentUser(supabase)
  if (!user) throw new ZenithError('AUTH_001', 'No active session')
  return user
}

/**
 * Require verified email — throws AUTH_003 if email not verified.
 */
export async function requireVerifiedUser(supabase: SupabaseClient): Promise<SessionUser> {
  const user = await requireUser(supabase)
  if (!user.emailVerified) {
    throw new ZenithError('AUTH_003', 'Email not verified')
  }
  return user
}
