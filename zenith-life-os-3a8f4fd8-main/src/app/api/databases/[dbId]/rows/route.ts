/**
 * app/api/databases/[dbId]/rows/route.ts — GET list + POST create row
 * ❌ NO SQL here
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { RowRepo } from '@/lib/db-engine/row-repo'
import { withIdempotency } from '@/lib/idempotency'
import { z } from 'zod'

const CreateRowSchema = z.object({
  properties: z.record(z.unknown()).default({}),
  page_id: z.string().optional(),
})

export async function GET(req: NextRequest, { params }: { params: { dbId: string } }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const url = new URL(req.url)
  const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100'), 500)
  const offset = parseInt(url.searchParams.get('offset') ?? '0')

  const repo = new RowRepo(supabase)
  const rows = await repo.listByDatabase(params.dbId, { limit, offset })
  return NextResponse.json({ rows })
}

export const POST = withIdempotency(async (req: NextRequest, { params }: { params: { dbId: string } }) => {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreateRowSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const repo = new RowRepo(supabase)
  const row = await repo.create({ database_id: params.dbId, ...parsed.data })
  return NextResponse.json({ row }, { status: 201 })
})
