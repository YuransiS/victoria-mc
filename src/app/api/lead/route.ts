import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';
import { normalizePhone, normalizeTelegram, normalizeInstagram, normalizeCurrency, normalizeAmount, resolveProductType, extractMarketingAttribution } from '@/lib/enrichment';

const GOOGLE_SCRIPT_URL_MAIN = process.env.GOOGLE_SCRIPT_URL;
const GOOGLE_SCRIPT_URL_STVORYUI = process.env.GOOGLE_SCRIPT_URL_STVORYUI;

function cleanPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = "38" + cleaned;
  }
  if (cleaned.length === 11 && cleaned.startsWith("80")) {
    cleaned = "38" + cleaned.substring(1);
  }
  return cleaned;
}

function formatCrmPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 9) {
    cleaned = "380" + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = "38" + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith("80")) {
    cleaned = "38" + cleaned.substring(1);
  }
  return cleaned ? `+${cleaned}` : phone;
}

function formatTelegramPhone(phone: string): string {
  if (!phone) return '-';
  const trimmed = phone.trim();
  if (trimmed === '-' || trimmed === '') return '-';
  
  let cleaned = trimmed.replace(/\D/g, "");
  if (cleaned.length === 9) {
    cleaned = "380" + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith("0")) {
    cleaned = "38" + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith("80")) {
    cleaned = "38" + cleaned.substring(1);
  }
  return cleaned ? `+${cleaned}` : trimmed;
}

function formatUkrainianDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('uk-UA', {
      timeZone: 'Europe/Kiev',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  } catch (e) {
    return isoString;
  }
}

function resolveProductFunnelName(targetSheet?: string | null, pagePath?: string | null): string {
  if (targetSheet === 'Анкета передзапису' || pagePath === '/anketa') return 'Анкета передзапису';
  if (targetSheet === 'VSL Форма' || targetSheet === 'Ленд 2' || targetSheet === 'Ленд2' || pagePath === '/free-lection/vsl-form') return 'VSL Анкета (Форма)';
  if (targetSheet === 'VSL 1 етап' || targetSheet === 'Ленд 1' || targetSheet === 'VSL Воронка (старт)' || pagePath === '/free-lection') return 'VSL Воронка (Лекція)';
  if (targetSheet === 'Автовеб' || targetSheet === 'Masterclass_Leads') return 'Майстер-клас';
  if (pagePath === '/practicum') return 'Практикум';
  if (pagePath === '/rozbir' || (targetSheet && targetSheet.includes('розбір'))) return 'Персональний розбір';
  if (pagePath === '/price') return 'Сторінка тарифів';
  return targetSheet || pagePath || '';
}

interface CrmTrafficSourceResult {
  id: number;
  name: string;
}

function resolveBaseCrmTrafficSource(params: {
  isVSL: boolean;
  isAnketa: boolean;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  page_path?: string | null;
}): CrmTrafficSourceResult {
  const src = (params.utm_source || '').toLowerCase().trim();
  const med = (params.utm_medium || '').toLowerCase().trim();
  const camp = (params.utm_campaign || '').toLowerCase().trim();
  const cnt = (params.utm_content || '').toLowerCase().trim();
  const path = (params.page_path || '').toLowerCase().trim();
  const fullText = `${src} ${med} ${camp} ${cnt} ${path}`;

  // 1. Stories / Відповідь на сторіс (1094)
  if (
    src.includes('stori') || src.includes('story') ||
    med.includes('stori') || med.includes('story') ||
    camp.includes('stori') || camp.includes('story') ||
    fullText.includes('vidpovid') || fullText.includes('reply')
  ) {
    return { id: 1094, name: 'Відповідь на сторіс' };
  }

  // 2. Чат / Direct / Передані в чаті (1088)
  if (
    src.includes('direct') || src.includes('chat') || src.includes('dm') || src.includes('pm') ||
    med.includes('direct') || med.includes('chat') ||
    camp.includes('direct') || camp.includes('chat') ||
    fullText.includes('peredan') || fullText.includes('manual')
  ) {
    return { id: 1088, name: 'Передані в чаті' };
  }

  // 3. Бот / Telegram Bot (1092)
  if (
    src.includes('bot') || src.includes('tg_bot') || src.includes('telegram_bot') ||
    src.includes('manychat') || src.includes('smartsender') ||
    med.includes('bot') || camp.includes('bot')
  ) {
    return { id: 1092, name: 'Анкета Бот' };
  }

  // 4. Ефір / Вебінар (1091)
  if (
    src.includes('efir') || src.includes('veb') || src.includes('web') || src.includes('live') ||
    med.includes('efir') || med.includes('veb') || med.includes('web') ||
    camp.includes('efir') || camp.includes('veb') || camp.includes('web') ||
    fullText.includes('stream') || fullText.includes('zoom')
  ) {
    return { id: 1091, name: 'Анкети ефір' };
  }

  // 5. Розсилка база / Email / SendPulse (1093)
  if (
    src.includes('baza') || src.includes('base') || src.includes('email') || src.includes('mail') ||
    src.includes('sendpulse') || src.includes('sp') ||
    med.includes('baza') || med.includes('base') || med.includes('email') || med.includes('mail') ||
    camp.includes('baza') || camp.includes('base') || camp.includes('email') ||
    fullText.includes('newsletter') || fullText.includes('rozsylka')
  ) {
    return { id: 1093, name: 'Анкети "розсилка база"' };
  }

  // 6. Анкета Блог (1089)
  // Covers organic Instagram bio/profile, blog, and followers retargeting traffic (traff + RETARG_FOLLOWERS, LEEDS_RETATG, etc.)
  if (
    src.includes('blog') || src.includes('shapka') || src.includes('bio') || src.includes('profile') ||
    src.includes('insta') || src.includes('reels') || src.includes('post') || src.includes('feed') ||
    fullText.includes('follower') || fullText.includes('retarg') ||
    (src === 'traff' && (camp.includes('blog') || camp.includes('follower') || camp.includes('retarg') || med.includes('retatg') || med.includes('blog')))
  ) {
    return { id: 1089, name: 'Анкета Блог' };
  }

  // 7. VSL (1090)
  if (params.isVSL || path.includes('free-lection') || fullText.includes('vsl')) {
    return { id: 1090, name: 'VSL' };
  }

  // 8. General Анкета передзапису (1095)
  if (params.isAnketa) {
    return { id: 1095, name: 'АНКЕТА ПЕРЕДЗАПИСУ' };
  }

  // Default fallback
  return { id: 1095, name: 'АНКЕТА ПЕРЕДЗАПИСУ' };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, social, niche, instagram, purpose, difficulties, readiness, sp_contact_id, subscription_duration } = data;

    const ukrainianMonths = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    const entryMonth = ukrainianMonths[new Date().getMonth()];

    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    const marketingAttr = extractMarketingAttribution(
      data,
      undefined,
      data.page_path || '',
      data.full_url || data.page_url || ''
    );

    const utms = {
      utm_source: marketingAttr.utm_source || data.utm_source || 'direct',
      utm_medium: marketingAttr.utm_medium || data.utm_medium || '-',
      utm_campaign: marketingAttr.utm_campaign || data.utm_campaign || '-',
      utm_content: marketingAttr.utm_content || data.utm_content || '-',
      utm_term: marketingAttr.utm_term || data.utm_term || '-',
    };

    const isVSL = data.target_sheet === 'VSL Форма' || data.target_sheet === 'Ленд 2' || data.target_sheet === 'Ленд2';
    const isVSL1 = data.target_sheet === 'VSL 1 етап' || data.target_sheet === 'Ленд 1' || data.target_sheet === 'VSL Воронка (старт)';
    const isAutoweb = data.target_sheet === 'Автовеб' || data.target_sheet === 'Masterclass_Leads' || data.sheet_id === '726331330';
    const isAnketa = data.target_sheet === 'Анкета передзапису';
    const formTitle = isVSL ? 'АНКЕТА VSL (ФОРМА)' : (isVSL1 ? 'ЛЕКЦІЯ (VSL Воронка)' : (isAutoweb ? 'Майстер-клас 28.07' : (isAnketa ? 'АНКЕТА ПЕРЕДЗАПИСУ' : 'ЗАЯВКА')));

    let message = `🔥 <b>Новий лід: ${formTitle}</b>\n\n`;
    message += `👤 <b>Ім'я:</b> ${name || '-'}\n`;
    message += `📞 <b>Телефон:</b> ${formatTelegramPhone(phone)}\n`;
    message += `📱 <b>Social:</b> ${social || '-'}\n`;
    if (instagram) {
      message += `📸 <b>Instagram:</b> ${instagram}\n`;
    }
    
    if (niche) {
      message += `💼 <b>Ніша:</b> ${niche}\n`;
    }

    if (purpose) {
      message += `🎯 <b>Мета:</b> ${purpose}\n`;
    }

    if (difficulties) {
      message += `⚠️ <b>Складнощі:</b> ${difficulties}\n`;
    }

    if (readiness) {
      message += `⚡ <b>Готовність:</b> ${readiness}\n`;
    }

    if (subscription_duration) {
      message += `📅 <b>Підписка:</b> ${subscription_duration}\n`;
    }

    message += `\n🌐 <b>Джерело:</b>\n`;
    message += `Source: ${utms.utm_source}\n`;
    message += `Medium: ${utms.utm_medium}\n`;
    message += `Campaign: ${utms.utm_campaign}\n`;

    // 1. Supabase Visitor Resolution & Lead Stitching
    const clientUuid = data.visitor_id || data.visitorId || null;
    const phoneOrSocial = phone || social || '';
    const isPhone = phoneOrSocial && !phoneOrSocial.startsWith('@') && phoneOrSocial.replace(/\D/g, '').length >= 7;
    const normalizedPhone = isPhone ? cleanPhone(phoneOrSocial) : phoneOrSocial;

    let resolvedUuid = clientUuid;

    if (normalizedPhone) {
      try {
        const { data: existingLeads, error: searchError } = await supabaseAdmin
          .from("victoria_leads")
          .select("visitor_uuid")
          .eq("phone", normalizedPhone)
          .not("visitor_uuid", "is", null)
          .order("created_at", { ascending: true })
          .limit(1);

        if (searchError) {
          console.error("[Lead Ingest] Supabase stitch search error:", searchError);
        } else if (existingLeads && existingLeads.length > 0) {
          resolvedUuid = existingLeads[0].visitor_uuid;
          console.log(`[Lead Ingest] Stitched visitor from ${clientUuid} to ${resolvedUuid} based on phone ${normalizedPhone}`);
        }
      } catch (e: any) {
        console.error("[Lead Ingest] Stitch exception:", e.message);
      }
    }

    if (!resolvedUuid) {
      resolvedUuid = crypto.randomUUID();
    }

    // Merge session logs from temporary clientUuid to resolved stitched UUID
    if (clientUuid && resolvedUuid && clientUuid !== resolvedUuid) {
      try {
        const { error: mergeError } = await supabaseAdmin
          .from("victoria_leads")
          .update({ visitor_uuid: resolvedUuid })
          .eq("visitor_uuid", clientUuid);
        
        if (mergeError) {
          console.error("[Lead Ingest] Error merging visitor history:", mergeError);
        } else {
          console.log(`[Lead Ingest] Successfully merged history from ${clientUuid} to ${resolvedUuid}`);
        }
      } catch (e: any) {
        console.error("[Lead Ingest] Merge exception:", e.message);
      }
    }

    // 2. Fetch Visitor's Prior Interaction History across Products/Funnels
    let previousProductsList: { funnel: string; date: string }[] = [];
    try {
      const orConditions: string[] = [];
      if (normalizedPhone) orConditions.push(`phone.eq.${normalizedPhone}`);
      if (resolvedUuid) orConditions.push(`visitor_uuid.eq.${resolvedUuid}`);
      if (clientUuid && clientUuid !== resolvedUuid) orConditions.push(`visitor_uuid.eq.${clientUuid}`);

      if (orConditions.length > 0) {
        const { data: historyRecords } = await supabaseAdmin
          .from("victoria_leads")
          .select("created_at, target_sheet, page_path")
          .or(orConditions.join(','))
          .order("created_at", { ascending: true });

        if (historyRecords && historyRecords.length > 0) {
          const currentFunnelName = resolveProductFunnelName(data.target_sheet, data.page_path);
          const seenKeys = new Set<string>();

          for (const item of historyRecords) {
            const funnelName = resolveProductFunnelName(item.target_sheet, item.page_path);
            if (!funnelName || funnelName === 'Лендінг' || funnelName === '/') continue;

            const formattedDate = formatUkrainianDate(item.created_at);
            const dateDay = formattedDate.split(' ')[0];
            const uniqueKey = `${funnelName}_${dateDay}`;

            if (!seenKeys.has(uniqueKey)) {
              seenKeys.add(uniqueKey);
              previousProductsList.push({
                funnel: funnelName,
                date: formattedDate
              });
            }
          }
        }
      }
    } catch (err: any) {
      console.error('[Lead Ingest] Error fetching visitor history:', err.message || err);
    }

    // Define notification tasks
    const tasks = [];

    // 3. Telegram Task (For all incoming leads EXCEPT stage 1 VSL)
    if (token && chatId && !isVSL1) {
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

    // 4. BaseCRM Task (For VSL form and Anketa leads)
    if (isVSL || isAnketa) {
      const crmPhone = phone || '';
      const formattedCrmPhone = formatCrmPhone(crmPhone);
      const crmEmail = `noemail-${formattedCrmPhone.replace(/\D/g, '') || Math.random().toString(36).substring(2, 9)}@example.com`;
      
      const { id: trafficSourceId, name: trafficSourceName } = resolveBaseCrmTrafficSource({
        isVSL,
        isAnketa,
        utm_source: utms.utm_source,
        utm_medium: utms.utm_medium,
        utm_campaign: utms.utm_campaign,
        utm_content: utms.utm_content,
        page_path: marketingAttr.page_path || data.page_path
      });

      // Form comment string from questionnaire fields, UTM tags, and prior products history
      const commentLines: string[] = [];
      commentLines.push(`Джерело: [${trafficSourceName}]`);
      commentLines.push(`Форма: ${formTitle}`);
      if (niche) commentLines.push(`Ніша: ${niche}`);
      if (purpose) commentLines.push(`Мета: ${purpose}`);
      if (difficulties) commentLines.push(`Складнощі: ${difficulties}`);
      if (readiness) commentLines.push(`Готовність: ${readiness}`);
      if (subscription_duration) commentLines.push(`Підписка: ${subscription_duration}`);

      // Add UTM parameters to comment
      commentLines.push('');
      commentLines.push('UTM-мітки:');
      commentLines.push(`Source: ${utms.utm_source}`);
      commentLines.push(`Medium: ${utms.utm_medium}`);
      commentLines.push(`Campaign: ${utms.utm_campaign}`);
      if (utms.utm_content && utms.utm_content !== '-') {
        commentLines.push(`Content: ${utms.utm_content}`);
      }
      if (utms.utm_term && utms.utm_term !== '-') {
        commentLines.push(`Term: ${utms.utm_term}`);
      }

      // Add history of other products/funnels if the user was on other products before
      if (previousProductsList.length > 0) {
        commentLines.push('');
        commentLines.push('Бул(а) на інших продуктах/воронках: Так');
        commentLines.push('Історія відвідувань:');
        previousProductsList.forEach((item) => {
          commentLines.push(`• [${item.date}] ${item.funnel}`);
        });
      }

      const crmComment = commentLines.join('\n');

      const cleanSrc = utms.utm_source === '-' ? '' : (utms.utm_source || '');
      const cleanMed = utms.utm_medium === '-' ? '' : (utms.utm_medium || '');
      const cleanCamp = utms.utm_campaign === '-' ? '' : (utms.utm_campaign || '');
      const cleanCnt = utms.utm_content === '-' ? '' : (utms.utm_content || '');

      const crmTags = [
        trafficSourceName,
        cleanSrc ? `src:${cleanSrc}` : '',
        cleanCamp ? `camp:${cleanCamp}` : '',
        cleanMed ? `med:${cleanMed}` : '',
      ].filter(Boolean);

      const crmPayload = {
        pipeline_id: 127,
        dev_key: "1B9D-7F",
        name: name || 'Без імені',
        email: crmEmail,
        phone: formattedCrmPhone,
        telegram: social || '',
        instagram: instagram || '',
        comment: crmComment || '',
        traffic_source_id: trafficSourceId,
        tags: crmTags,
        utm_source: cleanSrc,
        utm_medium: cleanMed,
        utm_campaign: cleanCamp,
        utm_content: cleanCnt
      };

      tasks.push(
        fetch('https://prosales.base-crm.1-todo.com/api/client/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crmPayload),
        })
        .then(async (res) => {
          const text = await res.text();
          console.log(`[BaseCRM] Lead sent (${trafficSourceName}, ID: ${trafficSourceId}). Status: ${res.status}, Response: ${text}`);
          return text;
        })
        .catch(err => console.error('[BaseCRM] Failed to send lead:', err))
      );
    }

    // SendPulse Task (State 3: Submitted form)
    if (sp_contact_id) {
      tasks.push(
        updateSendPulseStatus(sp_contact_id, '3. Заповнив анкету').catch(err =>
          console.error('[Lead API SendPulse] Failed to update status:', err)
        )
      );
    }

    const canonicalCurrency = normalizeCurrency(data.currency);
    const floatAmount = normalizeAmount(data.amount);
    const resolvedProdType = resolveProductType({
      productType: data.product_type,
      tariffName: formTitle,
      targetSheet: data.target_sheet,
      pagePath: data.page_path,
      amount: floatAmount
    });

    const canonicalPhone = normalizePhone(phone) || (normalizedPhone ? `+${normalizedPhone}` : null);
    const canonicalTelegram = normalizeTelegram(social);
    const canonicalInstagram = normalizeInstagram(instagram);

    const dbPayload = {
      name: name ? String(name).trim() : null,
      phone: canonicalPhone,
      social: canonicalTelegram ? `@${canonicalTelegram}` : (social || null),
      instagram: canonicalInstagram || (instagram || null),
      niche: niche || null,
      amount: floatAmount,
      status: 'Зареєстровано',
      is_free: floatAmount === 0,
      utm_source: marketingAttr.utm_source || utms.utm_source,
      utm_medium: marketingAttr.utm_medium || utms.utm_medium,
      utm_campaign: marketingAttr.utm_campaign || utms.utm_campaign,
      utm_content: marketingAttr.utm_content || data.utm_content || '',
      utm_term: marketingAttr.utm_term || data.utm_term || '',
      target_sheet: data.target_sheet || null,
      sheet_id: data.sheet_id || null,
      page_path: marketingAttr.page_path || data.page_path || '',
      page_url: marketingAttr.page_url || data.full_url || '',
      visitor_uuid: resolvedUuid,
      raw_payload: {
        ...data,
        ...marketingAttr,
        currency: canonicalCurrency,
        product_type: resolvedProdType,
        product_name: formTitle,
        entry_month: entryMonth,
        vsl_sendpulse_stage: sp_contact_id ? 3 : undefined,
        metadata: {
          currency: canonicalCurrency,
          product_type: resolvedProdType,
          product_name: formTitle,
          entry_month: entryMonth
        }
      }
    };

    const supabasePromise = supabaseAdmin.from("victoria_leads").insert(dbPayload);

    // Await all parallel jobs (Supabase and notifications/CRM tasks)
    const results = await Promise.allSettled([supabasePromise, ...tasks]);

    // Log Supabase results
    const supabaseResult = results[0];
    if (supabaseResult.status === 'rejected') {
      console.error('[Lead Ingest] Supabase insert failed:', supabaseResult.reason);
    } else {
      const dbErr = (supabaseResult.value as any)?.error;
      if (dbErr) {
        console.error('[Lead Ingest] Supabase insert error payload:', dbErr);
      } else {
        console.log('[Lead Ingest] Successfully saved lead in Supabase');
      }
    }

    return NextResponse.json({ success: true, uuid: null, visitor_uuid: resolvedUuid });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
