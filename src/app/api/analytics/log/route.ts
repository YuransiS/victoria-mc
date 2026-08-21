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
