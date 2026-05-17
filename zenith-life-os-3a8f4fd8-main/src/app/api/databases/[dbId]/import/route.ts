import { NextRequest, NextResponse } from 'next/server';
import { CsvImporter } from '@/lib/db-engine/csv-importer';

export async function POST(req: NextRequest, { params }: { params: { dbId: string } }) {
  const workspaceId = 'ws_default';
  const userId = 'usr_default';
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const mapping = JSON.parse(formData.get('mapping') as string || '{}');

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const stream = file.stream() as unknown as NodeJS.ReadableStream;
    const result = await CsvImporter.importCsvRows(stream, params.dbId, workspaceId, userId, mapping);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
