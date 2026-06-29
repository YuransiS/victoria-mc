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

    // 2. Fetch all leads and clicks in this window (selecting raw_payload for video/form telemetry)
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('victoria_leads')
      .select('created_at, status, target_sheet, page_path, utm_source, utm_medium, amount, visitor_uuid, phone, name, raw_payload')
      .gte('created_at', startTime.toISOString())
      .lte('created_at', endTime.toISOString());

    if (fetchError) {
      console.error('[Cron Report] Supabase fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Database error fetching records' }, { status: 500 });
    }

    const safeLeads = leads || [];

    // --- AGGREGATIONS ---

    // 1. VSL Funnel (Free Lection) - detailed visitor tracking & cohort analysis
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

    const vslVisitorGroups: Record<string, any[]> = {};
    safeLeads.forEach(lead => {
      const uuid = lead.visitor_uuid;
      if (!uuid) return;
      const path = lead.page_path || '';
      const targetSheet = lead.target_sheet || '';
      const isVslPath = path.startsWith('/free-lection');
      const isVslSheet = ['VSL 1 етап', 'Ленд 1', 'VSL Воронка (старт)', 'VSL Форма', 'Ленд 2', 'Ленд2'].includes(targetSheet);
      
      if (isVslPath || isVslSheet) {
        if (!vslVisitorGroups[uuid]) {
          vslVisitorGroups[uuid] = [];
        }
        vslVisitorGroups[uuid].push(lead);
      }
    });

    let totalLandedStart = 0;
    let totalLandedVideo = 0;
    let totalPressedPlay = 0;
    let totalWatchedEnd = 0;
    let watchDurations: number[] = [];
    let wantsToFillTimes: number[] = [];
    let totalWantsToFill = 0;
    let totalRegistered = 0;

    const fillBuckets = {
      '0-5': 0,
      '5-10': 0,
      '10-15': 0,
      '15-20': 0,
      '20+': 0
    };

    Object.entries(vslVisitorGroups).forEach(([uuid, rows]) => {
      let landedStart = false;
      let landedVideo = false;
      let pressedPlay = false;
      let watchedEnd = false;
      let maxSecondsWatched = 0;
      let registered = false;
      let fillTime: number | null = null;
      let clickedForm = false;

      rows.forEach(row => {
        const path = row.page_path || '';
        const status = row.status || '';
        const targetSheet = row.target_sheet || '';

        if (path === '/free-lection') landedStart = true;
        if (path === '/free-lection/vsl-form') landedVideo = true;

        if (status === 'Дивився відео' || status === 'полностью посмотрел' || status === 'КликФормы') {
          pressedPlay = true;
        }
        const prog = row.raw_payload?.video_progress;
        if (prog?.played) {
          pressedPlay = true;
        }
        const secWatched = prog?.seconds_watched || 0;
        if (secWatched > maxSecondsWatched) {
          maxSecondsWatched = secWatched;
        }
        const curTime = prog?.current_time || 0;
        if (status === 'полностью посмотрел' || curTime >= 1200) {
          watchedEnd = true;
        }

        if (status === 'КликФормы' || row.raw_payload?.wants_to_fill !== undefined) {
          clickedForm = true;
        }
        if (row.raw_payload?.wants_to_fill?.video_time !== undefined) {
          fillTime = row.raw_payload.wants_to_fill.video_time;
        }

        if (status === 'Зареєстровано' && ['VSL Форма', 'Ленд 2', 'Ленд2'].includes(targetSheet)) {
          registered = true;
        }
      });

      if (landedStart) totalLandedStart++;
      if (landedVideo) totalLandedVideo++;
      if (pressedPlay) {
        totalPressedPlay++;
        watchDurations.push(maxSecondsWatched);
      }
      if (watchedEnd) totalWatchedEnd++;
      if (clickedForm) {
        totalWantsToFill++;
        if (fillTime !== null) {
          wantsToFillTimes.push(fillTime);
          const minutes = fillTime / 60;
          if (minutes < 5) fillBuckets['0-5']++;
          else if (minutes < 10) fillBuckets['5-10']++;
          else if (minutes < 15) fillBuckets['10-15']++;
          else if (minutes < 20) fillBuckets['15-20']++;
          else fillBuckets['20+']++;
        }
      }
      if (registered) {
        totalRegistered++;
      }
    });

    const avgWatchSeconds = watchDurations.length > 0
      ? Math.round(watchDurations.reduce((a, b) => a + b, 0) / watchDurations.length)
      : 0;
    const avgWatchMinutes = Math.floor(avgWatchSeconds / 60);
    const avgWatchSecRest = avgWatchSeconds % 60;


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

    // VSL Form path attribution details
    const vslFormHitsInPeriod = safeLeads.filter(l => l.page_path === '/free-lection/vsl-form');
    const uniqueVslFormVisitors = Array.from(new Set(vslFormHitsInPeriod.map(l => l.visitor_uuid).filter(Boolean))) as string[];

    const visitorHistories: Record<string, any[]> = {};
    if (uniqueVslFormVisitors.length > 0) {
      const { data: historyData } = await supabaseAdmin
        .from('victoria_leads')
        .select('visitor_uuid, page_path, created_at, utm_source, utm_medium, status')
        .in('visitor_uuid', uniqueVslFormVisitors)
        .order('created_at', { ascending: true });
        
      if (historyData) {
        historyData.forEach(row => {
          if (row.visitor_uuid) {
            if (!visitorHistories[row.visitor_uuid]) {
              visitorHistories[row.visitor_uuid] = [];
            }
            visitorHistories[row.visitor_uuid].push(row);
          }
        });
      }
    }

    const utmSourceGroups: Record<string, Set<string>> = {};
    const visitorFirstHitTime: Record<string, string> = {};
    
    vslFormHitsInPeriod.forEach(hit => {
      const src = hit.utm_source || 'direct';
      const uuid = hit.visitor_uuid;
      if (uuid) {
        if (!utmSourceGroups[src]) {
          utmSourceGroups[src] = new Set();
        }
        utmSourceGroups[src].add(uuid);
        
        if (!visitorFirstHitTime[uuid] || new Date(hit.created_at) < new Date(visitorFirstHitTime[uuid])) {
          visitorFirstHitTime[uuid] = hit.created_at;
        }
      }
    });

    const vslFormSourceStats: Record<string, {
      total: number;
      fromFreeLection: Record<string, number>;
      fromOther: Record<string, number>;
      directNew: number;
    }> = {};

    Object.entries(utmSourceGroups).forEach(([src, uuidsSet]) => {
      vslFormSourceStats[src] = {
        total: uuidsSet.size,
        fromFreeLection: {},
        fromOther: {},
        directNew: 0
      };
      
      uuidsSet.forEach(uuid => {
        const fullHistory = visitorHistories[uuid] || [];
        const firstHitTime = visitorFirstHitTime[uuid];
        const priorHistory = fullHistory.filter(h => new Date(h.created_at) < new Date(firstHitTime));
        
        const freeLectionHit = priorHistory.find(h => h.page_path === '/free-lection');
        if (freeLectionHit) {
          const origSrc = freeLectionHit.utm_source || 'direct';
          vslFormSourceStats[src].fromFreeLection[origSrc] = (vslFormSourceStats[src].fromFreeLection[origSrc] || 0) + 1;
          return;
        }
        
        const otherHit = priorHistory.find(h => ['/practicum', '/rozbir', '/anketa', '/price', '/'].includes(h.page_path || ''));
        if (otherHit) {
          const pageName = otherHit.page_path || '/';
          vslFormSourceStats[src].fromOther[pageName] = (vslFormSourceStats[src].fromOther[pageName] || 0) + 1;
          return;
        }
        
        vslFormSourceStats[src].directNew++;
      });
    });

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

    // Offer variants performance tracking
    const getOfferVariant = (lead: any, isClick: boolean = false): 'offer1' | 'offer2' | 'offer3' | 'unknown' => {
      const rawVar = lead.raw_payload?.offer_variant;
      if (rawVar === 'offer1' || rawVar === 'offer2' || rawVar === 'offer3') return rawVar;
      
      const content = (lead.utm_content || '').toLowerCase();
      if (content.includes('offer3') || content.includes('v3')) return 'offer3';
      if (content.includes('offer2') || content.includes('v2')) return 'offer2';
      if (content.includes('offer1') || content.includes('v1')) return 'offer1';
      
      if (isClick && lead.page_path === '/') return 'offer1';
      if (!isClick && ['Автовеб', 'Masterclass_Leads'].includes(lead.target_sheet || '')) return 'offer1';
      return 'unknown';
    };

    const offerStats = {
      offer1: { clicks: 0, leads: 0 },
      offer2: { clicks: 0, leads: 0 },
      offer3: { clicks: 0, leads: 0 },
      unknown: { clicks: 0, leads: 0 }
    };

    coreClicks.forEach(c => {
      const v = getOfferVariant(c, true);
      offerStats[v].clicks++;
    });

    autowebLeads.forEach(l => {
      const v = getOfferVariant(l, false);
      offerStats[v].leads++;
    });

    // --- TELEGRAM MESSAGE BUILDER ---

    const formattedStart = formatKyivTime(startTime);
    const formattedEnd = formatKyivTime(endTime);

    let message = `📊 <b>${isWeekly ? 'Тижневий' : 'Щоденний'} зведений звіт по проектах</b>\n`;
    message += `📅 <b>Період:</b> <code>${formattedStart}</code> — <code>${formattedEnd}</code> (Київ)\n\n`;

    // 1. VSL
    if (vsl1Leads.length > 0 || vsl2Leads.length > 0 || totalLandedStart > 0 || totalLandedVideo > 0 || totalPressedPlay > 0) {
      message += `🔥 <b>1. VSL ВОРОНКА (Лекція)</b>\n`;
      message += `🌐 <b>Перейшли на сайт (унікальні):</b>\n`;
      message += `  • Старт воронки: <code>${totalLandedStart}</code>\n`;
      message += `  • Сторінка відео: <code>${totalLandedVideo}</code>\n`;
      message += `🎥 <b>Натиснули дивитися:</b> <code>${totalPressedPlay}</code>\n`;
      message += `🏁 <b>Додивилися до кінця (20+ хв):</b> <code>${totalWatchedEnd}</code>\n`;
      message += `⏳ <b>Сер. тривалість перегляду:</b> <code>${avgWatchMinutes} хв ${avgWatchSecRest} сек</code>\n`;
      message += `📝 <b>Клікнули на анкету:</b> <code>${totalWantsToFill}</code>\n`;
      message += `🕒 <b>Момент кліку на анкету:</b>\n`;
      message += `  • 0-5 хв: <code>${fillBuckets['0-5']}</code>\n`;
      message += `  • 5-10 хв: <code>${fillBuckets['5-10']}</code>\n`;
      message += `  • 10-15 хв: <code>${fillBuckets['10-15']}</code>\n`;
      message += `  • 15-20 хв: <code>${fillBuckets['15-20']}</code>\n`;
      message += `  • 20+ хв: <code>${fillBuckets['20+']}</code>\n`;
      message += `👤 <b>Успішно відправили анкету:</b> <code>${vsl2Leads.length}</code>\n`;
      message += `👤 <b>Реєстрацій (Етап 1):</b> <code>${vsl1Leads.length}</code>\n`;
      message += `🔄 <b>Конверсія до форми:</b> <code>${conversionRate}%</code> (когорта: <code>${step2CohortCount}</code>)\n`;
      message += `🏷️ <b>Найкраще джерело (Етап 1):</b> <code>${getBestSource(vsl1Leads)}</code>\n`;
      message += `📊 <b>Джерела на VSL Form (Сторінка відео):</b>\n`;
      if (Object.keys(vslFormSourceStats).length === 0) {
        message += `  • немає даних\n\n`;
      } else {
        Object.entries(vslFormSourceStats).forEach(([src, stats]) => {
          message += `  • <b>${src}</b>: <code>${stats.total}</code> унікальних\n`;
          Object.entries(stats.fromFreeLection).forEach(([origSrc, count]) => {
            message += `    ↳ з /free-lection (${origSrc}): <code>${count}</code>\n`;
          });
          Object.entries(stats.fromOther).forEach(([page, count]) => {
            message += `    ↳ з іншої сторінки (${page}): <code>${count}</code>\n`;
          });
          if (stats.directNew > 0) {
            message += `    ↳ вхід одразу на форму: <code>${stats.directNew}</code>\n`;
          }
        });
        message += `\n`;
      }
    }


    // 2. Practicum
    if (practicumLeads.length > 0 || practicumClicks.length > 0) {
      message += `🎓 <b>2. ПРАКТИКУМ</b>\n`;
      message += `👤 <b>Всього заявок:</b> <code>${practicumLeads.length}</code>\n`;
      message += `💰 <b>Оплачено:</b> <code>${practicumPaid.length}</code>\n`;
      message += `💵 <b>Оплачена сума:</b> <code>${practicumRevenue} UAH</code>\n`;
      message += `📈 <b>Трафік (Кліки):</b> <code>${practicumClicks.length}</code>\n`;
      message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(practicumLeads)}</code>\n\n`;
    }

    // 3. Anketa
    if (anketaLeads.length > 0 || anketaClicks.length > 0) {
      message += `📝 <b>3. АНКЕТА ПРЕДЗАПИСУ</b>\n`;
      message += `👤 <b>Заповнено анкет:</b> <code>${anketaLeads.length}</code>\n`;
      message += `📈 <b>Трафік (Кліки):</b> <code>${anketaClicks.length}</code>\n`;
      message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(anketaLeads)}</code>\n\n`;
    }

    // 4. Rozbir
    if (rozbirLeads.length > 0 || rozbirClicks.length > 0) {
      message += `🔍 <b>4. РОЗБОРИ (Відеорозбір)</b>\n`;
      message += `👤 <b>Всього заявок:</b> <code>${rozbirLeads.length}</code>\n`;
      message += `💰 <b>Оплачено:</b> <code>${rozbirPaid.length}</code>\n`;
      message += `💵 <b>Оплачена сума:</b> <code>${rozbirRevenue} UAH</code>\n`;
      message += `📈 <b>Трафік (Кліки):</b> <code>${rozbirClicks.length}</code>\n`;
      message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(rozbirLeads)}</code>\n\n`;
    }

    // 5. Booking
    if (bookingLeads.length > 0 || bookingClicks.length > 0) {
      message += `💳 <b>5. БРОНЮВАННЯ / ЦІНИ</b>\n`;
      message += `👤 <b>Всього заявок:</b> <code>${bookingLeads.length}</code>\n`;
      message += `💰 <b>Оплачено:</b> <code>${bookingPaid.length}</code>\n`;
      message += `💵 <b>Оплачена сума:</b> <code>${bookingRevenue} UAH</code>\n`;
      message += `📈 <b>Трафік (Кліки):</b> <code>${bookingClicks.length}</code>\n`;
      message += `🏷️ <b>Найкраще джерело:</b> <code>${getBestSource(bookingLeads)}</code>\n\n`;
    }

    // 6. Masterclass (Майстер-клас)
    if (autowebLeads.length > 0 || coreClicks.length > 0) {
      message += `🎓 <b>6. МАЙСТЕР-КЛАС</b>\n`;
      message += `👤 <b>Реєстрацій:</b> <code>${autowebLeads.length}</code>\n`;
      message += `📈 <b>Трафік (Кліки):</b> <code>${coreClicks.length}</code>\n`;
      message += `🏷️ <b>Найкраще джерело (реєстрації):</b> <code>${getBestSource(autowebLeads)}</code>\n`;
      
      message += `📊 <b>Ефективність офферів (Кліки → Реєстрації):</b>\n`;
      const offerNames = {
        offer1: "Оффер 1 (Знати що постити)",
        offer2: "Оффер 2 (Блог приносив заявки)",
        offer3: "Оффер 3 (Перестати вести навмання)",
        unknown: "Інші / Невизначено"
      };

      Object.entries(offerStats).forEach(([key, stats]) => {
        if (stats.clicks > 0 || stats.leads > 0) {
          const conv = stats.clicks > 0 ? Math.round((stats.leads / stats.clicks) * 100) : 0;
          message += `  • ${offerNames[key as keyof typeof offerNames]}:\n`;
          message += `    кліки: <code>${stats.clicks}</code> | рег: <code>${stats.leads}</code> | конв: <code>${conv}%</code>\n`;
        }
      });
      message += `\n`;
    }

    // 3. Dispatch to Telegram Bot API
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.REPORT_TOPIC_ID || '2518';

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
        vslPlayCount: totalPressedPlay,
        vslWatchedCount: totalWatchedEnd,
        vslCohortConversion: conversionRate,
        vslLandedStart: totalLandedStart,
        vslLandedVideo: totalLandedVideo,
        vslAvgWatchSeconds: avgWatchSeconds,
        vslWantsToFill: totalWantsToFill,
        vslFillBuckets: fillBuckets,

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
        coreClicksCount: coreClicks.length,
        offerStats
      }
    });

  } catch (error: any) {
    console.error('[Cron Report] Unhandled exception:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
