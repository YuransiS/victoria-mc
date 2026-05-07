import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwSaSkvHXzOlz-7N1eQQWW8Rt7k-dWSNoZrTmcZ0TMOUg7n6VGPDTyK66ed2eD1Uk6f/exec';

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

    // 2. Google Sheets Task
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    tasks.push(
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          utm_source: utm_source || 'direct',
          utm_medium: utm_medium || '-',
          utm_campaign: utm_campaign || '-',
          target_sheet: 'Ленд2'
        }),
        signal: controller.signal
      })
      .then(() => clearTimeout(timeoutId))
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
