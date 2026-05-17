import { NextRequest, NextResponse } from 'next/server';
import { RollupEngine } from '@/lib/db-engine/rollup-engine';

export async function GET(req: NextRequest, { params }: { params: { dbId: string } }) {
  const url = new URL(req.url);
  const rowId = url.searchParams.get('row');
  const propertyId = url.searchParams.get('property');
  const targetProperty = url.searchParams.get('targetProperty');
  const aggregation = url.searchParams.get('aggregation');

  if (!rowId || !propertyId || !targetProperty || !aggregation) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }

  try {
    const value = await RollupEngine.compute(propertyId, rowId, targetProperty, aggregation);
    return NextResponse.json({ value });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
