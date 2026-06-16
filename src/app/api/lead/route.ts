import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';

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

    const utms = {
      utm_source: data.utm_source || 'direct',
      utm_medium: data.utm_medium || '-',
      utm_campaign: data.utm_campaign || '-',
      utm_content: data.utm_content || '-',
      utm_term: data.utm_term || '-',
    };

    const isVSL = data.target_sheet === 'VSL Форма' || data.target_sheet === 'Ленд 2' || data.target_sheet === 'Ленд2';
    const isVSL1 = data.target_sheet === 'VSL 1 етап' || data.target_sheet === 'Ленд 1' || data.target_sheet === 'VSL Воронка (старт)';
    const isAutoweb = data.target_sheet === 'Автовеб' || data.target_sheet === 'Masterclass_Leads' || data.sheet_id === '726331330';
    const isAnketa = data.target_sheet === 'Анкета передзапису';
    const formTitle = isVSL ? 'АНКЕТА VSL (ФОРМА)' : (isVSL1 ? 'ЛЕКЦІЯ (VSL Воронка)' : (isAutoweb ? 'АВТОВЕБ' : (isAnketa ? 'АНКЕТА ПЕРЕДЗАПИСУ' : 'ЗАЯВКА')));

    let message = `🔥 <b>Новий лід: ${formTitle}</b>\n`;
    message += `📅 <b>Місяць входу:</b> ${entryMonth}\n\n`;
    message += `👤 <b>Ім'я:</b> ${name || '-'}\n`;
    message += `📞 <b>Телефон:</b> ${phone || '-'}\n`;
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

    // Define notification tasks
    const tasks = [];

    // 1. Telegram Task (For all incoming leads EXCEPT stage 1 VSL)
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

    // 1.5 BaseCRM Task (For VSL form and Anketa leads)
    if (isVSL || isAnketa) {
      const crmPhone = phone || '';
      const formattedCrmPhone = formatCrmPhone(crmPhone);
      const crmEmail = `noemail-${formattedCrmPhone.replace(/\D/g, '') || Math.random().toString(36).substring(2, 9)}@example.com`;
      
      // Form comment string from questionnaire fields if they exist
      const commentLines: string[] = [];
      if (niche) commentLines.push(`Ніша: ${niche}`);
      if (purpose) commentLines.push(`Мета: ${purpose}`);
      if (difficulties) commentLines.push(`Складнощі: ${difficulties}`);
      if (readiness) commentLines.push(`Готовність: ${readiness}`);
      if (subscription_duration) commentLines.push(`Підписка: ${subscription_duration}`);
      const crmComment = commentLines.join('\n');

      const crmPayload = {
        pipeline_id: 110,
        dev_key: "DF5-6E",
        name: name || 'Без імені',
        email: crmEmail,
        phone: formattedCrmPhone,
        telegram: social || '',
        instagram: instagram || '',
        comment: crmComment || '',
        utm_source: utms.utm_source === '-' ? '' : (utms.utm_source || ''),
        utm_medium: utms.utm_medium === '-' ? '' : (utms.utm_medium || ''),
        utm_campaign: utms.utm_campaign === '-' ? '' : (utms.utm_campaign || ''),
        utm_content: data.utm_content === '-' ? '' : (data.utm_content || '')
      };

      tasks.push(
        fetch('https://prosales.base-crm.1-todo.com/api/client/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(crmPayload),
        })
        .then(async (res) => {
          const text = await res.text();
          console.log(`[BaseCRM] Lead sent. Status: ${res.status}, Response: ${text}`);
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

    // Determine target scripts and payloads
    const submissions: Array<{url: string, body: any}> = [];
    const apiKey = process.env.SHEETS_API_KEY;

    if (data.target_sheet === 'VSL 1 етап' || data.target_sheet === 'Ленд 1' || data.target_sheet === 'VSL Воронка (старт)') {
      if (GOOGLE_SCRIPT_URL_STVORYUI) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_STVORYUI,
          body: { ...data, ...utms, entry_month: entryMonth, sheetName: 'VSL 1 етап', api_key: apiKey }
        });
      }
      if (GOOGLE_SCRIPT_URL_MAIN) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_MAIN,
          body: { ...data, ...utms, entry_month: entryMonth, target_sheet: 'VSL 1 етап', sheet_id: '43961418', api_key: apiKey }
        });
      }
    } else if (data.target_sheet === 'VSL Форма' || data.target_sheet === 'Ленд 2' || data.target_sheet === 'Ленд2') {
      if (GOOGLE_SCRIPT_URL_STVORYUI) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_STVORYUI,
          body: { ...data, ...utms, entry_month: entryMonth, target_sheet: 'Ленд 2', api_key: apiKey }
        });
      }
      if (GOOGLE_SCRIPT_URL_MAIN) {
        submissions.push({
          url: GOOGLE_SCRIPT_URL_MAIN,
          body: { ...data, ...utms, entry_month: entryMonth, target_sheet: 'VSL Форма', api_key: apiKey }
        });
      }
    } else {
      let scriptUrl = GOOGLE_SCRIPT_URL_MAIN;
      if (scriptUrl) {
        submissions.push({
          url: scriptUrl,
          body: { ...data, ...utms, entry_month: entryMonth, api_key: apiKey }
        });
      }
    }

    // 2. Google Sheets Tasks
    const sheetsPromise = Promise.allSettled(
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

    // 3. Supabase Integration & Lead Stitching
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

    const dbPayload = {
      name: name || null,
      phone: normalizedPhone || null,
      social: social || null,
      instagram: instagram || null,
      niche: niche || null,
      amount: 0,
      status: 'Зареєстровано',
      is_free: true,
      utm_source: utms.utm_source,
      utm_medium: utms.utm_medium,
      utm_campaign: utms.utm_campaign,
      utm_content: data.utm_content || '',
      utm_term: data.utm_term || '',
      target_sheet: data.target_sheet || null,
      sheet_id: data.sheet_id || null,
      page_path: data.page_path || '',
      page_url: data.full_url || '',
      visitor_uuid: resolvedUuid,
      raw_payload: { ...data, entry_month: entryMonth, vsl_sendpulse_stage: sp_contact_id ? 3 : undefined }
    };

    const supabasePromise = supabaseAdmin.from("victoria_leads").insert(dbPayload);

    // Await all parallel jobs
    const results = await Promise.allSettled([sheetsPromise, supabasePromise, ...tasks]);

    // Log sheets results
    let uuid = null;
    const sheetsResult = results[0];
    if (sheetsResult.status === 'fulfilled') {
      const sheetsData = sheetsResult.value;
      sheetsData.forEach(res => {
        if (res.status === 'fulfilled' && res.value?.uuid) {
          uuid = res.value.uuid;
        }
      });
    }

    // Log Supabase results
    const supabaseResult = results[1];
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

    return NextResponse.json({ success: true, uuid, visitor_uuid: resolvedUuid });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
