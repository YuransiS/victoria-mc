import { NextResponse } from 'next/server';
import { sendTelegramNotification } from '@/app/minicourse/bot';

export async function POST(req: Request) {
  try {
    const { chatId, messageType, templateData } = await req.json();

    if (!chatId) {
      return NextResponse.json({ success: false, error: 'chatId is required' }, { status: 400 });
    }

    const res = await sendTelegramNotification(chatId, messageType, templateData);
    return NextResponse.json({ success: res.success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
