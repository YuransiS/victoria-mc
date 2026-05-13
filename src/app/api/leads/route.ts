import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (!scriptUrl) {
      return NextResponse.json({ error: 'Google Script URL not configured' }, { status: 500 });
    }

    // 1. Forward the request to Google Apps Script
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...data,
        api_key: apiKey
      }),
    });

    const resData = await response.json();
    const messageId = resData.tg_msg_id;

    // 2. If it's a status update and we have a message ID, update Telegram too
    if (data.action === "update_status" && messageId) {
      const isSuccess = data.status && data.status.toUpperCase().includes('APPROV');
      const orderId = data.order_id || data.orderId;
      const customerName = orderId ? orderId.split('_')[0] : 'Клієнт';
      
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (token && chatId) {
        const text = isSuccess 
          ? `✅ Оплата успішна! (Практикум)\n\n👤 Клієнт: ${customerName}\n🆔 ID: ${orderId}\n\nСтатус оновлено через редирект.`
          : `❌ Оплата відхилена (Практикум)\n\n👤 Клієнт: ${customerName}\n🆔 ID: ${orderId}\n\nСтатус: ${data.status || 'Declined'}`;

        try {
          await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              message_id: parseInt(messageId.toString()),
              text: text
            })
          });
        } catch (err) {
          console.error('Failed to update TG from redirect proxy:', err);
        }
      }
    }

    return NextResponse.json(resData);

  } catch (error) {
    console.error('Lead proxy error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}
