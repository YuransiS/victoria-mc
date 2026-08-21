import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitor_id, seconds_watched, current_time, played, status, sp_contact_id, wants_to_fill } = body;

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
    const isRegistered = currentStatus && currentStatus.includes('Зареєстровано');

    if (!isPaymentStatus && !isRegistered) {
      if (status === 'полностью посмотрел') {
        newStatus = 'полностью посмотрел';
      } else if (wants_to_fill && currentStatus !== 'полностью посмотрел') {
        newStatus = 'КликФормы';
      } else if (played && (!currentStatus || currentStatus === 'Клик')) {
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

    const ukrainianMonths = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Грудень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    const entryMonth = ukrainianMonths[new Date().getMonth()];

    const videoProgressPayload = {
      seconds_watched: seconds_watched || 0,
      current_time: current_time || 0,
      played: !!played,
      last_updated: new Date().toISOString()
    };

    const existingWantsToFill = (lead?.raw_payload as any)?.wants_to_fill || null;
    const wantsToFillData = wants_to_fill
      ? {
          video_time: current_time || 0,
          seconds_watched: seconds_watched || 0,
          timestamp: new Date().toISOString()
        }
      : existingWantsToFill;

    const rawPayload = lead?.raw_payload && typeof lead.raw_payload === 'object'
      ? { 
          ...(lead.raw_payload as object), 
          sp_contact_id: resolvedSpContactId, 
          vsl_sendpulse_stage: nextSendPulseStage, 
          entry_month: entryMonth,
          video_progress: videoProgressPayload,
          ...(wantsToFillData ? { wants_to_fill: wantsToFillData } : {})
        }
      : { 
          sp_contact_id: resolvedSpContactId, 
          vsl_sendpulse_stage: nextSendPulseStage, 
          entry_month: entryMonth,
          video_progress: videoProgressPayload,
          ...(wantsToFillData ? { wants_to_fill: wantsToFillData } : {})
        };

    let dbResult;
    if (lead) {
      // Update existing lead
      dbResult = await supabaseAdmin
        .from('victoria_leads')
        .update({
          status: newStatus,
          raw_payload: {
            ...rawPayload,
            currency: 'UAH',
            product_type: 'lead',
            metadata: {
              currency: 'UAH',
              product_type: 'lead',
              entry_month: entryMonth
            }
          }
        })
        .eq('id', lead.id);
    } else {
      // Create a temporary/visitor record if no lead exists yet
      dbResult = await supabaseAdmin
        .from('victoria_leads')
        .insert({
          visitor_uuid: visitor_id,
          status: newStatus,
          raw_payload: {
            ...rawPayload,
            currency: 'UAH',
            product_type: 'lead',
            metadata: {
              currency: 'UAH',
              product_type: 'lead',
              entry_month: entryMonth
            }
          },
          is_free: true,
          amount: 0.00,
          page_path: '/free-lection/vsl-form'
        });
    }

    if (dbResult.error) {
      console.error('[Video Progress] Supabase save error:', dbResult.error);
    }

    // 2. Real-time Telegram alerts on video completion have been removed as requested (metrics are aggregated in the daily/weekly cron report).

    return NextResponse.json({ success: true, status: newStatus });
  } catch (error) {
    console.error('[Video Progress] API Route error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
