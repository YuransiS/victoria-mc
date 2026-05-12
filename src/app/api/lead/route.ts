import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL_MAIN = process.env.GOOGLE_SCRIPT_URL;
const GOOGLE_SCRIPT_URL_STVORYUI = process.env.GOOGLE_SCRIPT_URL_STVORYUI;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, social, niche } = data;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    const utms = {
      utm_source: data.utm_source || 'direct',
      utm_medium: data.utm_medium || '-',
      utm_campaign: data.utm_campaign || '-',
      utm_content: data.utm_content || '-',
      utm_term: data.utm_term || '-',
    };

    const isVSL = data.target_sheet === 'Ленд2' || data.target_sheet === 'Ленд 2';
    const formTitle = isVSL ? 'АНКЕТА VSL (СТВОРЮЙ)' : 'ЛЕКЦІЯ (ЛЕНД 1)';

    let message = `🔥 <b>Новий лід: ${formTitle}</b>\n\n`;
    message += `👤 <b>Ім'я:</b> ${name || '-'}\n`;
    message += `📞 <b>Телефон:</b> ${phone || '-'}\n`;
    message += `📱 <b>Social:</b> ${social || '-'}\n`;
    
    if (niche) {
      message += `💼 <b>Ніша:</b> ${niche}\n`;
    }

    message += `\n🌐 <b>Джерело:</b>\n`;
    message += `Source: ${utms.utm_source}\n`;
    message += `Medium: ${utms.utm_medium}\n`;
    message += `Campaign: ${utms.utm_campaign}\n`;

    // Define notification tasks
    const tasks = [];

    // 1. Telegram Task (Only for VSL Form)
    if (token && chatId && isVSL) {
      tasks.push(
        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_thread_id: topicId,
            text: message,
            parse_mode: 'HTML',
          }),
        }).catch(err => console.error('Telegram failed:', err))
      );
    }

    // Determine target scripts and payloads
    const submissions: Array<{url: string, body: any}> = [];
    const apiKey = process.env.SHEETS_API_KEY;

    if (data.target_sheet === 'Ленд 1') {
      // Parallel submission as requested by the user
      // 1. To google_apps_script_stvoryui.js (primary for Lend 1)
      if (GOOGLE_SCRIPT_URL_STVORYUI) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_STVORYUI,
          body: { ...data, ...utms, sheetName: 'Ленд 1', api_key: apiKey }
        });
      }
      // 2. To google_apps_script.js (Unified CRM) with specific sheet ID
      if (GOOGLE_SCRIPT_URL_MAIN) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_MAIN,
          body: { ...data, ...utms, sheet_id: '43961418', api_key: apiKey }
        });
      }
    } else if (data.target_sheet === 'Ленд2' || data.target_sheet === 'Ленд 2') {
      // Parallel submission for VSL
      // 1. To google_apps_script_stvoryui.js (primary for Lend 2)
      if (GOOGLE_SCRIPT_URL_STVORYUI) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_STVORYUI,
          body: { ...data, ...utms, target_sheet: 'Ленд 2', api_key: apiKey }
        });
      }
      // 2. To google_apps_script.js (Unified CRM)
      if (GOOGLE_SCRIPT_URL_MAIN) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_MAIN,
          body: { ...data, ...utms, target_sheet: 'VSL Форма', api_key: apiKey }
        });
      }
    } else {
      // Normal single submission logic
      let scriptUrl = GOOGLE_SCRIPT_URL_MAIN;
      if (scriptUrl) {
        submissions.push({
          url: scriptUrl,
          body: { ...data, ...utms, api_key: apiKey }
        });
      }
    }

    // 2. Google Sheets Tasks
    const results = await Promise.allSettled(
      submissions.map(async (sub) => {
        try {
          const res = await fetch(sub.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub.body),
            signal: AbortSignal.timeout(30000)
          });
          return await res.json();
        } catch (err) {
          console.error(`Sheets submission failed for ${sub.url}:`, err);
          throw err;
        }
      })
    );

    let uuid = null;
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value?.uuid) {
        uuid = res.value.uuid;
      }
    });

    return NextResponse.json({ success: true, uuid });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
