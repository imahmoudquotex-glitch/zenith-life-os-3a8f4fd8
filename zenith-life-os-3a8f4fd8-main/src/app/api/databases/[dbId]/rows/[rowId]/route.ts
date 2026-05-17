/**
 * app/api/databases/[dbId]/rows/[rowId]/route.ts — PATCH + DELETE row
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { RowRepo } from '@/lib/db-engine/row-repo'
import { withIdempotency } from '@/lib/idempotency'
import { z } from 'zod'

const PatchRowSchema = z.object({
  properties: z.record(z.unknown()).optional(),
  page_id: z.string().nullable().optional(),
})

export const PATCH = withIdempotency(async (
  req: NextRequest,
  { params }: { params: { dbId: string; rowId: string } }
) => {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = PatchRowSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const repo = new RowRepo(supabase)
  const row = await repo.update(params.rowId, parsed.data)
  return NextResponse.json({ row })
})

export async function DELETE(
  req: NextRequest,
  { params }: { params: { dbId: string; rowId: string } }
) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const repo = new RowRepo(supabase)
  await repo.softDelete(params.rowId)
  return new NextResponse(null, { status: 204 })
}
