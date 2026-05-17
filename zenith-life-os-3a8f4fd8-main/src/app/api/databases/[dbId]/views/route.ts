import { NextRequest, NextResponse } from 'next/server';
import { ViewRepo } from '@/lib/db-engine/view-repo';

export async function GET(req: NextRequest, { params }: { params: { dbId: string } }) {
  // In a real implementation, workspaceId would come from the auth envelope
  const workspaceId = 'ws_default'; 
  try {
    const views = await ViewRepo.listByDatabase(params.dbId, workspaceId);
    return NextResponse.json(views);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    const body = await req.json();
    const view = await ViewRepo.create({
      id: crypto.randomUUID(),
      databaseId: params.dbId,
      workspaceId,
      name: body.name || 'Untitled View',
      type: body.type || 'table',
      config: body.config || {},
    });
    return NextResponse.json(view, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
