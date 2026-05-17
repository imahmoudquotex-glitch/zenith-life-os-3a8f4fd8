/**
 * app/api/databases/route.ts — GET list + POST create
 * ❌ NO SQL here — uses DatabaseRepo
 * ✅ Idempotency-Key on POST
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { DatabaseRepo } from '@/lib/db-engine/database-repo'
import { withIdempotency } from '@/lib/idempotency'
import { z } from 'zod'

const CreateDatabaseSchema = z.object({
  title: z.string().min(1).max(200),
  icon_kind: z.enum(['emoji', 'lucide', 'image', 'custom']).optional(),
  icon_value: z.string().max(200).optional(),
  cover_url: z.string().url().optional(),
  description: z.string().max(2000).optional(),
})

export async function GET(req: NextRequest) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const repo = new DatabaseRepo(supabase)
  const databases = await repo.listByWorkspace()
  return NextResponse.json({ databases })
}

export const POST = withIdempotency(async (req: NextRequest) => {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateDatabaseSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const repo = new DatabaseRepo(supabase)
  const db = await repo.create(parsed.data)
  return NextResponse.json({ database: db }, { status: 201 })
})
