import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

function formatTelegramHandle(tg: string): string {
  if (!tg) return '';
  let username = tg.trim();
  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.replace('t' + '.me/', 'telegram.me/').split('telegram.me/');
      username = parts[parts.length - 1];
    }
  }
  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();
  if (username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return '';
  }
  return username ? `@${username}` : '';
}

function formatInstagramHandle(ig: string): string {
  if (!ig) return '';
  let username = ig.trim();
  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.split('instagram.com/');
      username = parts[parts.length - 1];
    }
  }
  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();
  if (username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return '';
  }
  return username ? `<a href="https://instagram.com/${username}">@${username}</a>` : '';
}

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
    let leadDbData: any = null;

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

      // Fetch the full lead record for Telegram formatting
      try {
        const { data: dbRecord, error: dbError } = await supabaseAdmin
          .from('victoria_leads')
          .select('*')
          .eq('order_id', String(orderIdVal))
          .maybeSingle();
        if (!dbError && dbRecord) {
          leadDbData = dbRecord;
          console.log(`[CRM Status Sync] Found lead in Supabase: ${JSON.stringify(dbRecord)}`);
        } else if (dbError) {
          console.error('[CRM Status Sync] Supabase select error:', dbError);
        } else {
          console.log('[CRM Status Sync] No lead found in Supabase for order_id:', orderIdVal);
        }
      } catch (err: any) {
        console.error('[CRM Status Sync] Supabase select exception:', err.message || err);
      }
    }

    // Message builder helper
    const buildMessageText = (isSuccess: boolean, orderId: string, customData: any, resDataFallback?: any) => {
      const dbName = leadDbData?.name || customData.customer_name || resDataFallback?.customerName || 'Клієнт';
      let customerName = dbName;
      if (customerName === 'Клієнт' && orderId && orderId.includes('_')) {
        const parts = orderId.split('_');
        if (parts[0] !== 'VMC') customerName = parts[0]; 
      }

      const targetSheet = leadDbData?.target_sheet || customData.target_sheet || customData.targetSheet || resDataFallback?.sheetName || '';
      const currency = customData.currency || (targetSheet === "Практикум" ? 'USD' : 'UAH');
      
      const isPracticum = targetSheet === "Практикум" || currency === "USD";
      const isRozbir = targetSheet.includes("Ленд 3") || targetSheet.includes("Розбір") || (orderId && orderId.startsWith("ROZ"));
      const label = isPracticum ? "Практикум" : (isRozbir ? "Розбір" : "Бронь");

      const statusTitle = isSuccess 
        ? `✅ <b>Оплата успішна! (${label})</b>` 
        : `❌ <b>Оплата відхилена (${label})</b>`;

      const customerPhone = leadDbData?.phone || customData.customer_phone || resDataFallback?.customerPhone || '-';
      const rawSocial = leadDbData?.social || customData.social || resDataFallback?.telegram || '';
      const social = formatTelegramHandle(rawSocial);
      const instagram = formatInstagramHandle(leadDbData?.instagram || customData.instagram || '');
      const tariff = leadDbData?.raw_payload?.tariffName || customData.tariff || resDataFallback?.tariff || (isRozbir ? 'Персональний розбір' : '-');
      const amount = leadDbData?.amount || customData.amount || resDataFallback?.amount || '-';

      const utmSource = leadDbData?.utm_source || customData.utm_source || '';
      const utmMedium = leadDbData?.utm_medium || customData.utm_medium || '';
      const utmCampaign = leadDbData?.utm_campaign || customData.utm_campaign || '';

      const utmInfo = utmSource 
        ? `\n\n🌐 <b>Джерело:</b>\nSource: ${utmSource}\nMedium: ${utmMedium || '-'}\nCampaign: ${utmCampaign || '-'}`
        : "";

      return `${statusTitle}\n\n` +
        `👤 <b>Клієнт:</b> ${customerName}\n` +
        `📞 <b>Телефон:</b> ${customerPhone}\n` +
        (social ? `📱 <b>Social:</b> ${social}\n` : '') +
        (instagram ? `📸 <b>Instagram:</b> ${instagram}\n` : '') +
        (!isRozbir ? `📦 <b>Тариф:</b> ${tariff}\n` : '') +
        `💰 <b>Сума:</b> ${amount} ${currency}\n` +
        `🆔 <b>ID:</b> <code>${orderId}</code>` +
        utmInfo;
    };

    // 1. CRITICAL: Immediate TG Update
    const finalMessageId = messageId || leadDbData?.tg_msg_id;
    if (isStatusUpdate && finalMessageId && token && chatId) {
      const isSuccess = data.status && data.status.toUpperCase().includes('APPROV');
      const orderId = data.order_id || data.orderId;
      const text = buildMessageText(isSuccess, orderId, data);

      console.log(`DEBUG: Updating TG message ${finalMessageId} in chat ${chatId}`);

      try {
        const url = `https://api.telegram.org/bot${token}/editMessageText`;
        const body = {
          chat_id: chatId,
          message_id: parseInt(finalMessageId.toString()),
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
      const text = buildMessageText(isSuccess, orderId, data, resData);

      await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: parseInt(resData.tg_msg_id),
          text: text,
          parse_mode: 'HTML'
        })
      }).catch(e => console.error('Fallback TG update failed:', e));
    }

    return NextResponse.json(resData);
  } catch (error) {
    console.error('Lead Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
