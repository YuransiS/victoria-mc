import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

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

    const orderIdVal = data.order_id || data.orderId;
    if (isStatusUpdate && orderIdVal) {
      const isSuccess = data.status && data.status.toUpperCase().includes('APPROV');
      const parsedStatus = isSuccess ? 'Approved' : (data.status || 'Declined');
      
      try {
        const { error } = await supabaseAdmin.from('victoria_leads')
          .update({ status: parsedStatus })
          .eq('order_id', String(orderIdVal));
          
        if (error) {
          console.error('[CRM Status Sync] Supabase update error:', error);
        } else {
          console.log(`[CRM Status Sync] Supabase status updated to ${parsedStatus} for order ${orderIdVal}`);
        }
      } catch (err: any) {
        console.error('[CRM Status Sync] Supabase exception:', err.message || err);
      }
    }

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
      const customerPhone = data.customer_phone || '-';
      const tariff = data.tariff || '-';
      const amount = data.amount || '-';
      const currency = data.currency || 'USD';
      const utmInfo = utmSource ? `\n\n🔍 <b>Джерело:</b> ${utmSource} / ${utmMedium || '-'}` : "";

      const targetSheet = data.target_sheet || data.targetSheet || '';
      const isPracticum = targetSheet === "Практикум" || currency === "USD";
      const label = isPracticum ? "Практикум" : "Бронь";

      const statusTitle = isSuccess 
        ? `✅ <b>Оплата успішна! (${label})</b>` 
        : `❌ <b>Оплата відхилена (${label})</b>`;

      const text = `${statusTitle}\n\n` +
        `👤 <b>Клієнт:</b> ${customerName}\n` +
        `📞 <b>Телефон:</b> <code>${customerPhone}</code>\n` +
        `📦 <b>Тариф:</b> ${tariff}\n` +
        `💰 <b>Сума:</b> ${amount} ${currency}\n` +
        `🆔 <b>ID:</b> <code>${orderId}</code>` +
        utmInfo;

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
      
      let customerName = data.customer_name || resData.customerName || 'Клієнт';
      if (customerName === 'Клієнт' && orderId && orderId.includes('_')) {
        const parts = orderId.split('_');
        if (parts[0] !== 'VMC') customerName = parts[0]; 
      }
      
      const targetSheet = data.target_sheet || data.targetSheet || resData.sheetName || '';
      const isPracticum = targetSheet === "Практикум" || data.currency === "USD" || resData.sheetName === "Практикум";
      const label = isPracticum ? "Практикум" : "Бронь";
      
      const statusTitle = isSuccess ? `✅ Оплата успішна! (${label})` : `❌ Оплата відхилена (${label})`;

      const customerPhone = data.customer_phone || resData.customerPhone || '-';
      const tariff = data.tariff || resData.tariff || '-';
      const amount = data.amount || resData.amount || '-';
      const currency = data.currency || (resData.sheetName === 'Практикум' ? 'USD' : 'UAH');

      const text = `${statusTitle}\n\n` +
        `👤 Клієнт: ${customerName}\n` +
        `📞 Телефон: ${customerPhone}\n` +
        `📦 Тариф: ${tariff}\n` +
        `💰 Сума: ${amount} ${currency}\n` +
        `🆔 ID: ${orderId}`;

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: parseInt(resData.tg_msg_id),
          text: text
        })
      }).catch(e => console.error('Fallback TG update failed:', e));
    }

    return NextResponse.json(resData);
  } catch (error) {
    console.error('Lead Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
