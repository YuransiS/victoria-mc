import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Lead Proxy Request Data:', JSON.stringify(data));

    const token = process.env.TELEGRAM_BOT_TOKEN;
    let chatId = process.env.TELEGRAM_CHAT_ID;
    
    // Ensure chatId for supergroups starts with -100 if it's numeric and positive
    if (chatId && /^\d+$/.test(chatId)) {
      chatId = `-100${chatId}`;
    }

    const messageId = data.tg_msg_id;
    const isStatusUpdate = data.action === "update_status";

    // 1. CRITICAL: Immediate TG Update
    if (isStatusUpdate && messageId && token && chatId) {
      const isSuccess = data.status && data.status.toUpperCase().includes('APPROV');
      const orderId = data.order_id || data.orderId;
      
      // Get name from request or try to extract from orderId, fallback to 'Клієнт'
      let customerName = data.customer_name || 'Клієнт';
      
      if (customerName === 'Клієнт' && orderId && orderId.includes('_')) {
        const parts = orderId.split('_');
        if (parts[0] !== 'VMC') customerName = parts[0]; 
      }

      console.log(`DEBUG: Updating TG message ${messageId} in chat ${chatId}`);
      
      const utmSource = data.utm_source || '';
      const utmMedium = data.utm_medium || '';
      const utmInfo = utmSource ? `\n\n🔍 <b>Джерело:</b> ${utmSource} / ${utmMedium || '-'}` : "";

      const text = isSuccess 
        ? `✅ <b>Оплата успішна! (Практикум)</b>\n\n👤 <b>Клієнт:</b> ${customerName}\n🆔 <b>ID:</b> <code>${orderId}</code>${utmInfo}\n\nСтатус оновлено.`
        : `❌ <b>Оплата відхилена (Практикум)</b>\n\n👤 <b>Клієнт:</b> ${customerName}\n🆔 <b>ID:</b> <code>${orderId}</code>${utmInfo}\n\nСтатус оновлено.`;

      try {
        const url = `https://api.telegram.org/bot${token}/editMessageText`;
        const body = {
          chat_id: chatId,
          message_id: parseInt(messageId.toString()),
          text: text,
          parse_mode: 'HTML'
        };
        
        console.log('DEBUG: Telegram Request Body:', JSON.stringify(body));

        const tgRes = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        
        const tgResult = await tgRes.json();
        console.log('DEBUG: Telegram API Response:', JSON.stringify(tgResult));
        
        if (!tgResult.ok) {
          console.error('DEBUG: Telegram API Error Details:', tgResult.description);
        }
      } catch (tgErr) {
        console.error('DEBUG: Telegram Fetch Catch Error:', tgErr);
      }
    }

    // 2. Now talk to Google Sheets
    const response = await fetch(process.env.GOOGLE_SCRIPT_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        api_key: process.env.SHEETS_API_KEY
      }),
    });

    const resData = await response.json();
    console.log('CRM Sheet Response:', resData);

    // 3. If sheet returned an ID that we didn't have before, try updating TG now
    if (isStatusUpdate && !messageId && resData.tg_msg_id && token && chatId) {
      // (This is a fallback for when browser didn't have the ID)
      const isSuccess = data.status && data.status.toUpperCase().includes('APPROV');
      const orderId = data.order_id || data.orderId;
      const customerName = orderId ? orderId.split('_')[0] : 'Клієнт';
      
      const text = isSuccess ? "✅ Оплата успішна!" : "❌ Оплата відхилена";

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: parseInt(resData.tg_msg_id),
          text: `${text}\n\n👤 ${customerName}\n🆔 ${orderId}`
        })
      }).catch(e => console.error('Fallback TG update failed:', e));
    }

    return NextResponse.json(resData);
  } catch (error) {
    console.error('Lead Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
