import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Native formatter for Europe/Kyiv timezone
function formatKyivTime(date: Date): string {
  return date.toLocaleString('uk-UA', {
    timeZone: 'Europe/Kyiv',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function GET(req: Request) {
  try {
    // 1. Verify Authorization Header from Vercel Cron, or ?secret parameter
    const authHeader = req.headers.get('authorization');
    const { searchParams } = new URL(req.url);
    const secretParam = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
      const isParamValid = secretParam === cronSecret;
      if (!isHeaderValid && !isParamValid) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const type = searchParams.get('type') || 'daily';
    const isWeekly = type === 'weekly';

    // 2. Define timezone-agnostic window (7 days for weekly, 24h for daily)
    const endTime = new Date();
    const startTime = isWeekly
      ? new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000)
      : new Date(endTime.getTime() - 24 * 60 * 60 * 1000);

    // 3. Fetch Stage 1 VSL leads within this window
    const { data: step1Leads, error: step1Error } = await supabaseAdmin
      .from('victoria_leads')
      .select('visitor_uuid, phone, utm_source')
      .in('target_sheet', ['VSL Воронка (старт)', 'Ленд 1', 'VSL 1 етап'])
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString());

    if (step1Error) {
      console.error('[Cron VSL Report] Supabase Step 1 error:', step1Error);
      return NextResponse.json({ success: false, error: 'Database error fetching Step 1' }, { status: 500 });
    }

    const totalRegistered = step1Leads?.length || 0;
    let step2Count = 0;
    let bestSource = 'не визначено';

    if (totalRegistered > 0 && step1Leads) {
      const visitorUuids = step1Leads.map(l => l.visitor_uuid).filter(Boolean) as string[];
      const phones = step1Leads.map(l => l.phone).filter(Boolean) as string[];

      // 4. Fetch all VSL Step 2 Form submissions to check matching cohorts
      const { data: step2Leads, error: step2Error } = await supabaseAdmin
        .from('victoria_leads')
        .select('visitor_uuid, phone')
        .in('target_sheet', ['VSL Форма', 'Ленд 2', 'Ленд2']);

      if (step2Error) {
        console.error('[Cron VSL Report] Supabase Step 2 error:', step2Error);
      } else if (step2Leads) {
        const step1UuidsSet = new Set(visitorUuids);
        const step1PhonesSet = new Set(phones);
        const matchedIdentifiers = new Set<string>();

        step2Leads.forEach(s2 => {
          if (s2.visitor_uuid && step1UuidsSet.has(s2.visitor_uuid)) {
            matchedIdentifiers.add(s2.visitor_uuid);
          } else if (s2.phone && step1PhonesSet.has(s2.phone)) {
            matchedIdentifiers.add(s2.phone);
          }
        });

        step2Count = matchedIdentifiers.size;
      }

      // 5. Determine the best performing UTM source
      const sourceCounts: Record<string, number> = {};
      step1Leads.forEach(lead => {
        const source = lead.utm_source || 'direct';
        sourceCounts[source] = (sourceCounts[source] || 0) + 1;
      });

      let maxCount = 0;
      Object.entries(sourceCounts).forEach(([src, count]) => {
        if (count > maxCount) {
          maxCount = count;
          bestSource = `${src} (${count} лід${count === 1 ? '' : count >= 2 && count <= 4 ? 'и' : 'ів'})`;
        }
      });
    }

    const conversionRate = totalRegistered > 0 ? Math.round((step2Count / totalRegistered) * 100) : 0;

    // 6. Build the elegant report message
    const formattedStart = formatKyivTime(startTime);
    const formattedEnd = formatKyivTime(endTime);

    let message = isWeekly
      ? `📊 <b>Тижневий звіт по воронці /free-lection</b>\n`
      : `📊 <b>Звіт по воронці /free-lection</b>\n`;
    message += `📅 <b>Період:</b> з <code>${formattedStart}</code>\n`;
    message += `📅 <b>по:</b> <code>${formattedEnd}</code> (Київ)\n\n`;
    message += `👤 <b>Зареєстровано нових лідів:</b> <code>${totalRegistered}</code>\n`;
    message += `🎥 <b>Дійшли до VSL-форми:</b> <code>${step2Count}</code> (${conversionRate}%)\n`;
    message += `🔥 <b>Найкраще джерело:</b> <code>${bestSource}</code>\n`;

    // 7. Dispatch directly to Telegram Bot API
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    if (token && chatId) {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: message,
          parse_mode: 'HTML',
        }),
      });

      const resText = await response.text();
      if (!response.ok) {
        console.error('[Cron VSL Report] Telegram API call failed:', resText);
        return NextResponse.json({ success: false, error: 'Telegram dispatch failed', details: resText });
      }
    } else {
      console.warn('[Cron VSL Report] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
    }

    return NextResponse.json({
      success: true,
      period: { start: startTime, end: endTime },
      stats: {
        totalRegistered,
        reachedStep2: step2Count,
        conversionRate,
        bestSource
      }
    });

  } catch (error: any) {
    console.error('[Cron VSL Report] Unhandled exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
