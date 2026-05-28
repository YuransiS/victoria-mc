import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency: reqCurrency, 
      tariffName, 
      customerEmail, 
      customerName, 
      customerPhone, 
      telegram,
      instagram,
      successUrl, 
      failUrl, 
      targetSheet,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      full_url,
      visitor_id
    } = body;

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    // Moving back to secure environment variables with the long Secret Key
    const merchantAccount = process.env.WFP_MERCHANT_LOGIN?.replace(/['"]/g, '').trim();
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim();
    const merchantDomainName = (process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.vercel.app').replace(/['"]/g, '').trim();
    
    // Critical: orderReference!
    const orderReference = `VMC_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000).toString();
    const currency = reqCurrency || 'UAH';
    
    const productPriceStr = amount.toString();
    const productNameStr = `Booking: ${tariffName}`;
    const productCountStr = "1";

    const signatureData = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      productPriceStr,
      currency,
      productNameStr,
      productCountStr,
      productPriceStr
    ].join(';');

    if (!merchantAccount || !merchantSecretKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    const merchantSignature = crypto
      .createHmac('md5', merchantSecretKey)
      .update(signatureData, 'utf8')
      .digest('hex');

    // Build return URL with optional target redirects
    let returnUrl = `${currentDomain}/api/thanks-redirect`;
    if (successUrl || failUrl) {
      const params = new URLSearchParams();
      if (successUrl) params.set('successUrl', successUrl);
      if (failUrl) params.set('failUrl', failUrl);
      returnUrl += `?${params.toString()}`;
    }

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount: parseFloat(amount),
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [parseFloat(amount)],
      clientFirstName: customerName,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      serviceUrl: `${currentDomain}/api/payment-callback`,
      returnUrl: returnUrl,
    };

    // 1. Telegram Notification
    let tgMsgId = null;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    if (token && chatId) {
      const isPracticum = targetSheet === "Практикум";
      const title = isPracticum ? "⏳ <b>Очікується оплата (Практикум)</b>" : "⏳ <b>Очікується оплата (Бронь)</b>";
      const utmInfo = utm_source ? `\n\n🔍 <b>Джерело:</b> ${utm_source} / ${utm_medium || '-'}` : "";

      let message = `${title}\n\n` +
        `👤 <b>Клієнт:</b> ${customerName || '-'}\n` +
        `📞 <b>Телефон:</b> ${customerPhone || '-'}\n`;
      if (telegram) {
        message += `📱 <b>Telegram:</b> ${telegram}\n`;
      }
      if (instagram) {
        message += `📸 <b>Instagram:</b> ${instagram}\n`;
      }
      message += `📦 <b>Тариф:</b> ${tariffName}\n` +
        `💰 <b>Сума:</b> ${amount} ${currency}\n` +
        `🆔 <b>ID:</b> <code>${orderReference}</code>` +
        utmInfo;

      try {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_thread_id: topicId,
            text: message,
            parse_mode: 'HTML',
          }),
        });
        const tgData = await tgRes.json();
        if (tgData.result?.message_id) {
          tgMsgId = tgData.result.message_id;
        }
      } catch (err) {
        console.error('Telegram notification failed:', err);
      }
    }

    // 2. Google Sheets CRM Logging
    let sheetsUuid = null;
    const GOOGLE_SCRIPT_CRM = process.env.GOOGLE_SCRIPT_URL;
    let sheetsPromise: Promise<any> = Promise.resolve();

    if (GOOGLE_SCRIPT_CRM) {
      sheetsPromise = fetch(GOOGLE_SCRIPT_CRM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_lead',
          target_sheet: targetSheet || "Бронювання",
          orderId: orderReference,
          order_id: orderReference,
          name: customerName,
          phone: customerPhone,
          telegram: telegram,
          amount: amount,
          tariff: tariffName,
          status: "⏳ Очікується оплата",
          utm_source,
          utm_medium,
          utm_campaign,
          utm_content,
          utm_term,
          full_url,
          tg_msg_id: tgMsgId,
          api_key: process.env.SHEETS_API_KEY
        })
      }).then(async (res) => {
        const resData = await res.json();
        if (resData.uuid) sheetsUuid = resData.uuid;
        return resData;
      }).catch(err => {
        console.error('CRM sheets logging failed:', err);
      });
    }

    // 3. Supabase Integration & Lead Stitching
    const clientUuid = visitor_id || null;
    const phoneOrSocial = customerPhone || telegram || '';
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
          console.error("[Create Payment] Supabase stitch search error:", searchError);
        } else if (existingLeads && existingLeads.length > 0) {
          resolvedUuid = existingLeads[0].visitor_uuid;
          console.log(`[Create Payment] Stitched visitor from ${clientUuid} to ${resolvedUuid} based on phone ${normalizedPhone}`);
        }
      } catch (e: any) {
        console.error("[Create Payment] Stitch lookup exception:", e.message);
      }
    }

    if (!resolvedUuid) {
      resolvedUuid = crypto.randomUUID();
    }

    // Determine path from full url
    let pagePath = '/';
    if (full_url) {
      try {
        const urlObj = new URL(full_url);
        pagePath = urlObj.pathname;
      } catch (_) {}
    }

    const dbPayload = {
      name: customerName || null,
      phone: normalizedPhone || null,
      social: telegram || null,
      instagram: instagram || null,
      niche: null,
      amount: Number(amount) || 0,
      status: '⏳ Очікується оплата',
      is_free: Number(amount) === 0,
      order_id: orderReference,
      sheet_id: null,
      target_sheet: targetSheet || "Бронювання",
      utm_source: utm_source || '',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      utm_content: utm_content || '',
      utm_term: utm_term || '',
      page_path: pagePath,
      page_url: full_url || '',
      visitor_uuid: resolvedUuid,
      raw_payload: body
    };

    const supabasePromise = supabaseAdmin.from("victoria_leads").insert(dbPayload);

    // Parallel execution
    const results = await Promise.allSettled([sheetsPromise, supabasePromise]);

    const supabaseResult = results[1];
    if (supabaseResult.status === 'rejected') {
      console.error('[Create Payment] Supabase insert failed:', supabaseResult.reason);
    } else {
      const dbErr = (supabaseResult.value as any)?.error;
      if (dbErr) {
        console.error('[Create Payment] Supabase insert error:', dbErr);
      } else {
        console.log('[Create Payment] Successfully saved lead in Supabase');
      }
    }

    return NextResponse.json({ ...paymentData, uuid: sheetsUuid, visitor_uuid: resolvedUuid, tgMsgId });
  } catch (error) {
    console.error('WFP Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
