import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    // Calling the duplicate_database_rpc
    const { data, error } = await supabaseAdmin.rpc('duplicate_database', {
      p_db_id: params.dbId,
      p_workspace_id: workspaceId
    });

    if (error) throw error;
    return NextResponse.json({ id: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
