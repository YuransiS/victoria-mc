import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateSendPulseStatus } from '@/lib/sendpulse';
import { extractMarketingAttribution, normalizePhone, normalizeTelegram, normalizeAmount, normalizeCurrency } from '@/lib/enrichment';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, name, phone, social, sp_contact_id } = body;
    const rawStatus = body.status || 'Клик';
    const status = rawStatus.toLowerCase().includes('форм') ? 'КликФормы' : 'Клик';

    // SendPulse Integration (State 1: Landed on page)
    if (sp_contact_id && path && path.startsWith('/free-lection/vsl-form')) {
      updateSendPulseStatus(sp_contact_id, '1. Зайшов на сайт').catch(err => 
        console.error('[Analytics SendPulse] Failed to update status:', err)
      );
    }

    const ukrainianMonths = [
      'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
      'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
    ];
    const entryMonth = ukrainianMonths[new Date().getMonth()];

    const marketingAttr = extractMarketingAttribution(
      body.marketing || body.utms || body,
      undefined,
      path || '',
      body.fullUrl || body.page_url || ''
    );

    const floatAmount = normalizeAmount(body.amount);
    const canonicalCurrency = normalizeCurrency(body.currency);
    const canonicalPhone = normalizePhone(phone);
    const canonicalTelegram = normalizeTelegram(social);

    // 1. ПАРАЛЕЛЬНИЙ ЗАПИС ТЕЛЕМЕТРІЇ (Supabase)
    if (visitorId || marketingAttr.visitor_uuid) {
      const activeUuid = visitorId || marketingAttr.visitor_uuid;
      try {
        const { error } = await supabaseAdmin.from('victoria_leads').insert({
          visitor_uuid: activeUuid,
          status,
          name: name ? String(name).trim() : null,
          phone: canonicalPhone,
          social: canonicalTelegram ? `@${canonicalTelegram}` : (social || null),
          utm_source: marketingAttr.utm_source || '',
          utm_medium: marketingAttr.utm_medium || '',
          utm_campaign: marketingAttr.utm_campaign || '',
          utm_content: marketingAttr.utm_content || '',
          utm_term: marketingAttr.utm_term || '',
          page_path: marketingAttr.page_path || path || '',
          page_url: marketingAttr.page_url || body.fullUrl || '',
          raw_payload: {
            ...body,
            ...marketingAttr,
            currency: canonicalCurrency,
            product_type: 'lead',
            entry_month: entryMonth,
            vsl_sendpulse_stage: sp_contact_id ? 1 : undefined,
            metadata: {
              currency: canonicalCurrency,
              product_type: 'lead',
              entry_month: entryMonth
            }
          },
          is_free: floatAmount === 0,
          amount: floatAmount
        });

        if (error) {
          console.error('[Analytics Telemetry] Supabase insert error:', error);
        } else {
          console.log(`[Analytics Telemetry] Logged ${status} for visitor ${activeUuid}`);
        }

        // 2. Insert into central traffic_clicks
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        const validVisitorUuid = activeUuid && uuidRegex.test(activeUuid) ? activeUuid : null;

        const { data: proj } = await supabaseAdmin.from('projects').select('id').eq('slug', 'victoria').maybeSingle();
        const projectId = proj?.id || 'd3b2a1c0-4e5f-6a7b-8c9d-0e1f2a3b4c5d';

        await supabaseAdmin.from('traffic_clicks').insert({
          project_id: projectId,
          visitor_uuid: validVisitorUuid,
          status,
          utm_source: marketingAttr.utm_source || null,
          utm_medium: marketingAttr.utm_medium || null,
          utm_campaign: marketingAttr.utm_campaign || null,
          utm_content: marketingAttr.utm_content || null,
          utm_term: marketingAttr.utm_term || null,
          page_path: marketingAttr.page_path || path || '/',
          page_url: marketingAttr.page_url || body.fullUrl || '',
          metadata: {
            campaign_id: marketingAttr.campaign_id || null,
            adset_id: marketingAttr.adset_id || null,
            ad_id: marketingAttr.ad_id || null,
            fbclid: marketingAttr.fbclid || null,
            gclid: marketingAttr.gclid || null,
            fbp: marketingAttr.fbp || null,
            fbc: marketingAttr.fbc || null,
            bw_cid: marketingAttr.bw_cid || body.bw_cid || null,
            raw_payload: body,
            enrichment_protocol: 'v2.0',
            recorded_at: new Date().toISOString()
          },
          created_at: new Date().toISOString()
        });
      } catch (err: any) {
        console.error('[Analytics Telemetry] Supabase exception:', err.message || err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics route error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
