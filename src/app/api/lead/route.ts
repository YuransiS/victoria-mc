import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL_MAIN = process.env.GOOGLE_SCRIPT_URL;
const GOOGLE_SCRIPT_URL_STVORYUI = process.env.GOOGLE_SCRIPT_URL_STVORYUI;

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, social, niche, utm_source, utm_medium, utm_campaign } = data;

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID || "800";

    const message = `
🔥 <b>Новий лід VSL</b>

🔹 <b>Name:</b> ${name}
🔹 <b>Phone:</b> ${phone}
🔹 <b>Social:</b> ${social}
🔹 <b>Niche:</b> ${niche}
    `;

    // Define notification tasks
    const tasks = [];

    // 1. Telegram Task
    if (token && chatId) {
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

    const utms = {
      utm_source: data.utm_source || 'direct',
      utm_medium: data.utm_medium || '-',
      utm_campaign: data.utm_campaign || '-',
      utm_content: data.utm_content || '-',
      utm_term: data.utm_term || '-',
    };

    // Determine which script to send to
    let scriptUrl = GOOGLE_SCRIPT_URL_MAIN;
    if (data.target_sheet === 'Ленд2') {
      scriptUrl = GOOGLE_SCRIPT_URL_STVORYUI;
    }

    if (!scriptUrl) {
      console.error('No Google Script URL configured for this lead source');
    }

    // 2. Google Sheets Task
    tasks.push(
      fetch(scriptUrl || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...utms,
          phone: phone,
          api_key: process.env.SHEETS_API_KEY || 'secret_booking_token_2026',
        }),
        signal: AbortSignal.timeout(15000)
      })
      .catch(err => console.error('Sheets failed or timed out:', err))
    );

    // Run both in parallel
    await Promise.allSettled(tasks);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
