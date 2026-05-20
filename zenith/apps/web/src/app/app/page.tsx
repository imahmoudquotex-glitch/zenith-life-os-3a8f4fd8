import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * /app — Redirect to first workspace or workspace creation.
 */
export default async function AppPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Fetch user's workspaces via API
  const res = await fetch(`${process.env['APP_URL']}/api/v1/workspaces`, {
    headers: {
      Cookie: ``, // handled by supabase server client automatically
    },
    cache: 'no-store',
  })

  if (res.ok) {
    const json = await res.json() as { ok: boolean; data?: { items?: Array<{ slug: string }> } }
    const first = json.data?.items?.[0]
    if (first) {
      redirect(`/app/${first.slug}`)
    }
  }

  // No workspaces — go to onboarding
  redirect('/app/onboarding')
}
