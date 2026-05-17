import { NextRequest, NextResponse } from 'next/server';
import { DatabaseRepo } from '@/lib/db-engine/database-repo';
import { PropertyRepo } from '@/lib/db-engine/property-repo';
import { ViewRepo } from '@/lib/db-engine/view-repo';

export async function GET(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    const db = await DatabaseRepo.get(params.dbId, workspaceId);
    if (!db) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    const properties = await PropertyRepo.listByDatabase(params.dbId, workspaceId);
    const views = await ViewRepo.listByDatabase(params.dbId, workspaceId);

    return NextResponse.json({ ...db, properties, views });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    const body = await req.json();
    const updated = await DatabaseRepo.update(params.dbId, workspaceId, body);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  const userId = 'usr_default';
  try {
    await DatabaseRepo.delete(params.dbId, workspaceId, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
