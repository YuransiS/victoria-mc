import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitor_id, seconds_watched, current_time, played, status, sp_contact_id } = body;

    if (!visitor_id) {
      return NextResponse.json({ success: false, error: 'Missing visitor_id' }, { status: 400 });
    }

    // 1. Find the latest lead record for this visitor
    const { data: leads, error: fetchError } = await supabaseAdmin
      .from('victoria_leads')
      .select('*')
      .eq('visitor_uuid', visitor_id)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('[Video Progress] Supabase fetch error:', fetchError);
      return NextResponse.json({ success: false, error: 'Database fetch error' }, { status: 500 });
    }

    const lead = leads && leads.length > 0 ? leads[0] : null;
    const currentStatus = lead ? lead.status : null;

    // Determine new status
    let newStatus = currentStatus || 'Клик';
    const isPaymentStatus = currentStatus && ['Approved', 'Settled', 'Paid', 'Купив', 'Оплачено'].some(s => currentStatus.includes(s));

    if (!isPaymentStatus) {
      if (status === 'полностью посмотрел') {
        newStatus = 'полностью посмотрел';
      } else if (played && (!currentStatus || currentStatus === 'Клик' || currentStatus === 'КликФормы')) {
        newStatus = 'Дивився відео';
      }
    }

    // SendPulse Integration (State 2: Watched video)
    const resolvedSpContactId = sp_contact_id || (lead?.raw_payload as any)?.sp_contact_id || null;
    const currentSendPulseStage = (lead?.raw_payload as any)?.vsl_sendpulse_stage || 0;

    const hasWatchedEnough = (seconds_watched && seconds_watched >= 900) || (current_time && current_time >= 900) || status === 'полностью посмотрел';

    let nextSendPulseStage = currentSendPulseStage;
    if (resolvedSpContactId) {
      if (hasWatchedEnough && currentSendPulseStage < 2) {
        nextSendPulseStage = 2;
        updateSendPulseStatus(resolvedSpContactId, '2. Подивився відео').catch(err => 
          console.error('[Video Progress SendPulse] Failed to update status:', err)
        );
      } else if (currentSendPulseStage < 1) {
        nextSendPulseStage = 1;
        updateSendPulseStatus(resolvedSpContactId, '1. Зайшов на сайт').catch(err =>
          console.error('[Video Progress SendPulse] Failed to update status:', err)
        );
      }
    }

    const videoProgressPayload = {
      seconds_watched: seconds_watched || 0,
      current_time: current_time || 0,
      played: !!played,
      last_updated: new Date().toISOString()
    };

    const rawPayload = lead?.raw_payload && typeof lead.raw_payload === 'object'
      ? { 
          ...(lead.raw_payload as object), 
          sp_contact_id: resolvedSpContactId, 
          vsl_sendpulse_stage: nextSendPulseStage, 
          video_progress: videoProgressPayload 
        }
      : { 
          sp_contact_id: resolvedSpContactId, 
          vsl_sendpulse_stage: nextSendPulseStage, 
          video_progress: videoProgressPayload 
        };

    let dbResult;
    if (lead) {
      // Update existing lead
      dbResult = await supabaseAdmin
        .from('victoria_leads')
        .update({
          status: newStatus,
          raw_payload: rawPayload
        })
        .eq('id', lead.id);
    } else {
      // Create a temporary/visitor record if no lead exists yet
      dbResult = await supabaseAdmin
        .from('victoria_leads')
        .insert({
          visitor_uuid: visitor_id,
          status: newStatus,
          raw_payload: rawPayload,
          is_free: true,
          amount: 0,
          page_path: '/free-lection/vsl-form'
        });
    }

    if (dbResult.error) {
      console.error('[Video Progress] Supabase save error:', dbResult.error);
    }

    // 2. If status upgraded to 'полностью посмотрел' and it is a new milestone transition
    const isNewMilestone = status === 'полностью посмотрел' && currentStatus !== 'полностью посмотрел';

    if (isNewMilestone) {
      const token = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;
      const topicId = process.env.TOPIC_ID;

      if (token && chatId) {
        let message = `🎥 <b>Відео переглянуто повністю! (> 20 хв)</b>\n\n`;
        message += `👤 <b>Ім'я:</b> ${lead?.name || 'Анонім (до заповнення анкети)'}\n`;
        message += `📞 <b>Телефон:</b> <code>${lead?.phone || '-'}</code>\n`;
        message += `📱 <b>Social/Telegram:</b> ${lead?.social || '-'}\n`;
        if (lead?.instagram) {
          message += `📸 <b>Instagram:</b> ${lead.instagram}\n`;
        }
        if (lead?.niche) {
          message += `💼 <b>Ніша:</b> ${lead.niche}\n`;
        }
        
        message += `\n🌐 <b>Джерело:</b>\n`;
        message += `Source: ${lead?.utm_source || 'direct'}\n`;
        message += `Medium: ${lead?.utm_medium || '-'}\n`;
        message += `Campaign: ${lead?.utm_campaign || '-'}\n`;

        fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_thread_id: topicId,
            text: message,
            parse_mode: 'HTML',
          }),
        }).catch(err => console.error('[Video Progress] Telegram notification failed:', err));
      }
    }

    // 3. Sync to Google Sheets
    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          api_key: process.env.SHEETS_API_KEY,
          orderId: lead?.visitor_uuid || visitor_id,
          status: newStatus,
          targetSheet: lead?.target_sheet || 'VSL Форма'
        })
      }).catch(err => console.error('[Video Progress] Sheets sync error:', err));
    }

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('[Video Progress] API Route error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
