import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, utms, name, phone, social, uuid, sp_contact_id } = body;
    const status = body.status || 'Клик';

    // SendPulse Integration (State 1: Landed on page)
    if (sp_contact_id && path && path.startsWith('/free-lection/vsl-form')) {
      updateSendPulseStatus(sp_contact_id, '1. Зайшов на сайт').catch(err => 
        console.error('[Analytics SendPulse] Failed to update status:', err)
      );
    }

    // 1. ПАРАЛЕЛЬНИЙ ЗАПИС ТЕЛЕМЕТРІЇ (Supabase)
    if (visitorId) {
      try {
        const { error } = await supabaseAdmin.from('victoria_leads').insert({
          visitor_uuid: visitorId,
          status,
          name: name || null,
          phone: phone || null,
          social: social || null,
          utm_source: utms?.utm_source || '',
          utm_medium: utms?.utm_medium || '',
          utm_campaign: utms?.utm_campaign || '',
          utm_content: utms?.utm_content || '',
          utm_term: utms?.utm_term || '',
          page_path: path || '',
          page_url: body.fullUrl || '',
          raw_payload: body,
          is_free: true,
          amount: body.amount || 0
        });

        if (error) {
          console.error('[Analytics Telemetry] Supabase insert error:', error);
        } else {
          console.log(`[Analytics Telemetry] Logged ${status} for visitor ${visitorId}`);
        }
      } catch (err: any) {
        console.error('[Analytics Telemetry] Supabase exception:', err.message || err);
      }
    }

    // 2. Log to Google Sheets via central script
    if (GOOGLE_SCRIPT_URL) {
      // Use fire and forget to not block the response
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_traffic',
          api_key: process.env.SHEETS_API_KEY,
          visitorId,
          uuid,
          name,
          phone,
          social,
          path,
          utm_source: utms?.utm_source || '',
          utm_medium: utms?.utm_medium || '',
          utm_campaign: utms?.utm_campaign || '',
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }).catch(err => console.error('Analytics logging error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics route error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
