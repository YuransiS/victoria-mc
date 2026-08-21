import { NextResponse } from 'next/server';
import { verifyPrizeCode } from '@/app/minicourse/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');

    if (!code) {
      return NextResponse.json({ success: false, error: 'Код не вказано' }, { status: 400 });
    }

    await verifyPrizeCode(code.trim());

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Помилка при перевірці коду' }, { status: 400 });
  }
}
