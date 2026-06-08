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

function getBestSource(items: any[]): string {
  if (!items || items.length === 0) return 'немає даних';
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const src = item.utm_source || 'direct';
    counts[src] = (counts[src] || 0) + 1;
  });
  let maxCount = 0;
  let best = 'direct';
  Object.entries(counts).forEach(([src, count]) => {
    if (count > maxCount) {
      maxCount = count;
      best = src;
    }
  });
  return `${best} (${maxCount})`;
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
    const useNow = searchParams.get('now') === 'true';

    // 1.5. Automatically delete QA/test leads from the database before generating stats
    const { error: deleteError } = await supabaseAdmin
      .from('victoria_leads')
      .delete()
      .or('utm_source.eq.qa-test,utm_medium.eq.qa-test,utm_medium.eq.test-runner,visitor_uuid.in.(33333333-3333-3333-3333-333333333333,44444444-4444-4444-4444-444444444444),name.ilike.QA %,phone.like.%380990000%');

    if (deleteError) {
      console.error('[Cron Report] Error deleting QA leads:', deleteError);
    } else {
      console.log('[Cron Report] Successfully cleaned up QA leads.');
    }

    // Helper to get exact Date object for target hour in Europe/Kyiv time
    const getKyivDateAtHour = (baseDate: Date, hour: number): Date => {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Europe/Kyiv',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).formatToParts(baseDate);

      const year = parseInt(parts.find(p => p.type === 'year')!.value);
      const month = parseInt(parts.find(p => p.type === 'month')!.value) - 1;
      const day = parseInt(parts.find(p => p.type === 'day')!.value);

      const testDate = new Date(Date.UTC(year, month, day, hour, 0, 0));
      const kyivHourStr = testDate.toLocaleTimeString('en-US', {
        timeZone: 'Europe/Kyiv',
        hour12: false,
        hour: 'numeric',
      });
      const kyivHour = parseInt(kyivHourStr);
      const offsetHours = kyivHour - hour;
      return new Date(Date.UTC(year, month, day, hour - offsetHours, 0, 0));
    };

    const now = new Date();
    const currentKyivHour = parseInt(
      now.toLocaleTimeString('en-US', { timeZone: 'Europe/Kyiv', hour12: false, hour: 'numeric' })
    );

    let endTime: Date;
    let startTime: Date;

    if (useNow) {
      endTime = now;
      startTime = isWeekly
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else {
      const reportHour = isWeekly ? 10 : 9;
      let baseDate = now;
      if (currentKyivHour < reportHour) {
        baseDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }
      endTime = getKyivDateAtHour(baseDate, reportHour);
      startTime = isWeekly
        ? new Date(endTime.getTime() - 7 * 24 * 60 * 60 * 1000)
        : new Date(endTime.getTime() - 24 * 60 * 60 * 1000);
    }

    // 2. Fetch all leads and clicks in this window
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('victoria_leads')
      .select('created_at, status, target_sheet, page_path, utm_source, utm_medium, amount, visitor_uuid, phone, name')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString());

    if (fetchError) {
      console.error('[Cron Report] Supabase fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Database error fetching records' }, { status: 500 });
    }

    const safeLeads = leads || [];

    // --- AGGREGATIONS ---

    // 1. VSL Funnel (Free Lection)
    const vsl1Clicks = safeLeads.filter(l => l.page_path === '/free-lection' && l.status === 'Клик');
    const vsl2Clicks = safeLeads.filter(l => l.page_path === '/free-lection/vsl-form' && l.status === 'Клик');
    const vsl1Leads = safeLeads.filter(l => 
      ['VSL 1 етап', 'Ленд 1', 'VSL Воронка (старт)'].includes(l.target_sheet || '') &&
      l.status === 'Зареєстровано'
    );
    const vsl2Leads = safeLeads.filter(l => 
      ['VSL Форма', 'Ленд 2', 'Ленд2'].includes(l.target_sheet || '') &&
      l.status === 'Зареєстровано'
    );
    const vslPlay = safeLeads.filter(l => l.page_path === '/free-lection/vsl-form' && l.status === 'Дивився відео');
    const vslWatched = safeLeads.filter(l => l.page_path === '/free-lection/vsl-form' && l.status === 'полностью посмотрел');

    // VSL Cohort conversion
    let step2CohortCount = 0;
    if (vsl1Leads.length > 0) {
      const visitorUuids = vsl1Leads.map(l => l.visitor_uuid).filter(Boolean) as string[];
      const phones = vsl1Leads.map(l => l.phone).filter(Boolean) as string[];
      
      const cohortStart = new Date(startTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      const { data: step2LeadsAll } = await supabaseAdmin
        .from('victoria_leads')
        .select('visitor_uuid, phone')
        .in('target_sheet', ['VSL Форма', 'Ленд 2', 'Ленд2'])
        .eq('status', 'Зареєстровано')
        .gte('created_at', cohortStart.toISOString())
        .lte('created_at', endTime.toISOString());

      if (step2LeadsAll) {
        const uuidsSet = new Set(visitorUuids);
        const phonesSet = new Set(phones);
        const matched = new Set<string>();
        step2LeadsAll.forEach(s2 => {
          if (s2.visitor_uuid && uuidsSet.has(s2.visitor_uuid)) {
            matched.add(s2.visitor_uuid);
          } else if (s2.phone && phonesSet.has(s2.phone)) {
            matched.add(s2.phone);
          }
        });
        step2CohortCount = matched.size;
      }
    }
    const conversionRate = vsl1Leads.length > 0 ? Math.round((step2CohortCount / vsl1Leads.length) * 100) : 0;

    // 2. Practicum Funnel
    const practicumClicks = safeLeads.filter(l => l.page_path === '/practicum' && l.status === 'Клик');
    const practicumLeads = safeLeads.filter(l => l.target_sheet === 'Практикум' && !['Клик', 'КликФормы'].includes(l.status || ''));
    const practicumPaid = practicumLeads.filter(l => l.status === 'Approved');
    const practicumRevenue = practicumPaid.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 3. Pre-registration Questionnaire (Анкета передзапису)
    const anketaClicks = safeLeads.filter(l => l.page_path === '/anketa' && l.status === 'Клик');
    const anketaLeads = safeLeads.filter(l => l.target_sheet === 'Анкета передзапису' && l.status === 'Зареєстровано');

    // 4. Video Breakdown (Розбір)
    const rozbirClicks = safeLeads.filter(l => l.page_path === '/rozbir' && l.status === 'Клик');
    const rozbirLeads = safeLeads.filter(l => l.target_sheet === 'Ленд 3' && !['Клик', 'КликФормы'].includes(l.status || ''));
    const rozbirPaid = rozbirLeads.filter(l => l.status === 'Approved');
    const rozbirRevenue = rozbirPaid.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 5. Booking / Prices (Бронювання)
    const bookingClicks = safeLeads.filter(l => l.page_path === '/price' && l.status === 'Клик');
    const bookingLeads = safeLeads.filter(l => l.target_sheet === 'Бронювання' && !['Клик', 'КликФормы'].includes(l.status || ''));
    const bookingPaid = bookingLeads.filter(l => l.status === 'Approved');
    const bookingRevenue = bookingPaid.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // 6. Autoweb (Автовеб)
    const autowebLeads = safeLeads.filter(l => 
      ['Автовеб', 'Masterclass_Leads'].includes(l.target_sheet || '') &&
      l.status === 'Зареєстровано'
    );

    // 7. Core Landing Page
    const coreClicks = safeLeads.filter(l => l.page_path === '/' && l.status === 'Клик');

    // --- TELEGRAM MESSAGE BUILDER ---

    const formattedStart = formatKyivTime(startTime);
    const formattedEnd = formatKyivTime(endTime);

    let message = `📊 <b>${isWeekly ? 'Тижневий' : 'Щоденний'} зведений звіт по проектах</b>\n`;
    message += `📅 <b>Період:</b> <code>${formattedStart}</code> — <code>${formattedEnd}</code> (Київ)\n\n`;

    // 1. VSL
    message += `🔥 <b>1. VSL ВОРОНКА (Лекція)</b>\n`;
    message += `👤 <b>Реєстрацій (Етап 1):</b> <code>${vsl1Leads.length}</code>\n`;
    message += `🎥 <b>Дійшли до форми (Етап 2):</b> <code>${vsl2Leads.length}</code>\n`;
    message += `🔄 <b>Конверсія до форми:</b> <code>${conversionRate}%</code> (когорта: <code>${step2CohortCount}</code>)\n`;
    message += `👀 <b>Перегляд відео:</b>\n`;
    message += `  • Почали: <code>${vslPlay.length}</code>\n`;
    message += `  • Додивились (20+ хв): <code>${vslWatched.length}</code>\n`;
    message += `📈 <b>Трафік (Унікальні кліки):</b>\n`;
    message += `  • Лендінг старту: <code>${vsl1Clicks.length}</code>\n`;
    message += `  • Сторінка відео: <code>${vsl2Clicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело (Етап 1):</b> <code>${getBestSource(vsl1Leads)}</code>\n\n`;

    // 2. Practicum
    message += `🎓 <b>2. ПРАКТИКУМ</b>\n`;
    message += `👤 <b>Всього заявок:</b> <code>${practicumLeads.length}</code>\n`;
    message += `💰 <b>Оплачено:</b> <code>${practicumPaid.length}</code>\n`;
    message += `💵 <b>Оплачена сума:</b> <code>${practicumRevenue} UAH</code>\n`;
    message += `📈 <b>Трафік (Кліки):</b> <code>${practicumClicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(practicumLeads)}</code>\n\n`;

    // 3. Anketa
    message += `📝 <b>3. АНКЕТА ПРЕДЗАПИСУ</b>\n`;
    message += `👤 <b>Заповнено анкет:</b> <code>${anketaLeads.length}</code>\n`;
    message += `📈 <b>Трафік (Кліки):</b> <code>${anketaClicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(anketaLeads)}</code>\n\n`;

    // 4. Rozbir
    message += `🔍 <b>4. РОЗБОРИ (Відеорозбір)</b>\n`;
    message += `👤 <b>Всього заявок:</b> <code>${rozbirLeads.length}</code>\n`;
    message += `💰 <b>Оплачено:</b> <code>${rozbirPaid.length}</code>\n`;
    message += `💵 <b>Оплачена сума:</b> <code>${rozbirRevenue} UAH</code>\n`;
    message += `📈 <b>Трафік (Кліки):</b> <code>${rozbirClicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(rozbirLeads)}</code>\n\n`;

    // 5. Booking
    message += `💳 <b>5. БРОНЮВАННЯ / ЦІНИ</b>\n`;
    message += `👤 <b>Всього заявок:</b> <code>${bookingLeads.length}</code>\n`;
    message += `💰 <b>Оплачено:</b> <code>${bookingPaid.length}</code>\n`;
    message += `💵 <b>Оплачена сума:</b> <code>${bookingRevenue} UAH</code>\n`;
    message += `📈 <b>Трафік (Кліки):</b> <code>${bookingClicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(bookingLeads)}</code>\n\n`;

    // 6. Autoweb
    message += `🌐 <b>6. АВТОВЕБ</b>\n`;
    message += `👤 <b>Реєстрацій:</b> <code>${autowebLeads.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(autowebLeads)}</code>\n\n`;

    // 7. Core
    message += `🏠 <b>7. ГОЛОВНА СТОРІНКА</b>\n`;
    message += `📈 <b>Трафік (Кліки):</b> <code>${coreClicks.length}</code>\n`;
    message += `🏷️ <b>Найкраще джерело (кліки):</b> <code>${getBestSource(coreClicks)}</code>\n`;

    // 3. Dispatch to Telegram Bot API
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
        console.error('[Cron Report] Telegram API call failed:', resText);
        return NextResponse.json({ success: false, error: 'Telegram dispatch failed', details: resText });
      }
    } else {
      console.warn('[Cron Report] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID environment variables');
    }

    return NextResponse.json({
      success: true,
      period: { start: startTime, end: endTime },
      stats: {
        vsl1LeadsCount: vsl1Leads.length,
        vsl2LeadsCount: vsl2Leads.length,
        vslPlayCount: vslPlay.length,
        vslWatchedCount: vslWatched.length,
        vslCohortConversion: conversionRate,
        practicumLeadsCount: practicumLeads.length,
        practicumPaidCount: practicumPaid.length,
        practicumRevenue,
        anketaLeadsCount: anketaLeads.length,
        rozbirLeadsCount: rozbirLeads.length,
        rozbirPaidCount: rozbirPaid.length,
        rozbirRevenue,
        bookingLeadsCount: bookingLeads.length,
        bookingPaidCount: bookingPaid.length,
        bookingRevenue,
        autowebLeadsCount: autowebLeads.length,
        coreClicksCount: coreClicks.length
      }
    });

  } catch (error: any) {
    console.error('[Cron Report] Unhandled exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
