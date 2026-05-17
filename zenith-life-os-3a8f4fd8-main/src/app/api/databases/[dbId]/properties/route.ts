/**
 * app/api/databases/[dbId]/properties/route.ts — GET + POST property
 */
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase/server'
import { PropertyRepo, ALLOWED_PROPERTY_TYPES, type DbPropertyType } from '@/lib/db-engine/property-repo'
import { withIdempotency } from '@/lib/idempotency'
import { z } from 'zod'

const CreatePropertySchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(ALLOWED_PROPERTY_TYPES as [DbPropertyType, ...DbPropertyType[]]),
  config: z.record(z.unknown()).default({}),
})

export async function GET(_req: NextRequest, { params }: { params: { dbId: string } }) {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const repo = new PropertyRepo(supabase)
  const properties = await repo.listByDatabase(params.dbId)
  return NextResponse.json({ properties })
}

export const POST = withIdempotency(async (
  req: NextRequest,
  { params }: { params: { dbId: string } }
) => {
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = CreatePropertySchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const repo = new PropertyRepo(supabase)
  try {
    const property = await repo.create(params.dbId, parsed.data.name, parsed.data.type, parsed.data.config)
    return NextResponse.json({ property }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 422 })
  }
})
