import { NextRequest, NextResponse } from 'next/server';
import { RelationRepo } from '@/lib/db-engine/relation-repo';

export async function POST(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    const body = await req.json();
    const link = await RelationRepo.linkRows(workspaceId, body.propertyId, body.sourceRowId, body.targetRowId);
    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  try {
    const body = await req.json();
    await RelationRepo.unlinkRows(workspaceId, body.propertyId, body.sourceRowId, body.targetRowId);
    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
