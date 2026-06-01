import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { project_slug, api_key, sheet_name, rows } = body;

    // 1. Валидация входных данных
    if (!project_slug || !api_key || !sheet_name || !Array.isArray(rows)) {
      return NextResponse.json(
        { error: 'Missing required parameters: project_slug, api_key, sheet_name, and rows (array) are mandatory.' },
        { status: 400 }
      );
    }

    // 2. Аутентификация проекта в реестре
    const { data: project, error: authError } = await supabaseAdmin
      .from('projects')
      .select('id')
      .eq('slug', project_slug)
      .eq('api_key_hash', api_key)
      .maybeSingle();

    if (authError || !project) {
      return NextResponse.json(
        { error: 'Authentication failed. Invalid project_slug or api_key.' },
        { status: 401 }
      );
    }

    // 3. Подготовка пачки записей для массовой вставки
    const batchData = rows.map((row: any) => ({
      project_slug,
      sheet_name,
      row_index: Number(row.row_index),
      raw_payload: row.raw_payload || {}
    }));

    // 4. Массовая вставка в сырую промежуточную таблицу (ELT паттерн)
    const { error: insertError } = await supabaseAdmin
      .from('raw_import_leads')
      .insert(batchData);

    if (insertError) {
      throw new Error(`Failed to batch insert raw records: ${insertError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Batch of ${rows.length} raw rows ingested successfully.`
    });

  } catch (error: any) {
    console.error('Raw Import API Gateway Ingest Error:', error);
    return NextResponse.json(
      { error: 'Internal server error.', details: error.message },
      { status: 500 }
    );
  }
}
