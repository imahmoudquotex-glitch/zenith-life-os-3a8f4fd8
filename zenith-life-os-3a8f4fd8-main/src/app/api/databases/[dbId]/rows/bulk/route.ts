import { NextRequest, NextResponse } from 'next/server';
import { RowRepo } from '@/lib/db-engine/row-repo';

export async function POST(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  const userId = 'usr_default';
  
  try {
    const body = await req.json();
    if (!Array.isArray(body.rows)) {
      return NextResponse.json({ error: 'rows must be an array' }, { status: 400 });
    }

    const createdRows = await RowRepo.createBulk(params.dbId, workspaceId, body.rows, userId);
    return NextResponse.json({ rows: createdRows }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
