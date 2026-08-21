import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone, normalizeTelegram, normalizeInstagram, normalizeAmount, normalizeCurrency, extractMarketingAttribution } from '@/lib/enrichment';

function formatInstagramLink(ig: string): string {
  if (!ig) return '';
  const username = ig.startsWith('@') ? ig.substring(1) : ig;
  return `<a href="https://instagram.com/${username}">@${username}</a>`;
}

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL_STVORYUI;
const SHEETS_API_KEY = process.env.SHEETS_API_KEY;
const WFP_SECRET_KEY = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim();
const WFP_MERCHANT_ACCOUNT = process.env.WFP_MERCHANT_LOGIN?.replace(/['"]/g, '').trim();
const WFP_MERCHANT_DOMAIN = process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.vercel.app';

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

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, social, amount, visitor_id, instagram } = data;
    
    const canonicalPhone = normalizePhone(phone);
    const cleanTg = normalizeTelegram(social);
    const formattedSocial = cleanTg ? `@${cleanTg}` : '';
    const cleanIg = normalizeInstagram(instagram);
    const dbInstagram = cleanIg ? `@${cleanIg}` : '';
    const formattedInstagram = formatInstagramLink(cleanIg || '');

    const floatAmount = normalizeAmount(amount);
    const canonicalCurrency = normalizeCurrency(data.currency || 'UAH');

    if (!WFP_SECRET_KEY || !WFP_MERCHANT_ACCOUNT) {
      return NextResponse.json({ error: 'WayForPay configuration missing' }, { status: 500 });
    }
    const orderReference = `ROZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const productName = "Персональний розбір";
    const productCount = "1";
    const amountStr = floatAmount.toFixed(2);

    const marketingAttr = extractMarketingAttribution(
      data,
      undefined,
      data.page_path || '/rozbir',
      data.page_url || data.full_url || `${WFP_MERCHANT_DOMAIN}/rozbir`
    );

    // 1. Telegram Notification (Run first to capture tgMsgId for CRM updates)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;
    let tgMsgId = null;
    let tgPromise: Promise<any> = Promise.resolve();

    if (token && chatId) {
      const title = "⏳ <b>Очікується оплата (Персональний розбір)</b>";
      const utmInfo = marketingAttr.utm_source ? `\n\n🔍 <b>Джерело:</b> ${marketingAttr.utm_source} / ${marketingAttr.utm_medium || '-'}` : "";

      const message = `${title}\n\n` +
        `👤 <b>Клієнт:</b> ${name || '-'}\n` +
        `📞 <b>Телефон:</b> ${formatTelegramPhone(canonicalPhone || phone)}\n` +
        `📱 <b>Social:</b> ${formattedSocial || '-'}\n` +
        (formattedInstagram ? `📸 <b>Instagram:</b> ${formattedInstagram}\n` : '') +
        `💰 <b>Сума:</b> ${floatAmount} UAH\n` +
        `🆔 <b>ID:</b> <code>${orderReference}</code>` +
        utmInfo;

      tgPromise = fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: message,
          parse_mode: 'HTML',
        }),
      })
      .then(async (res) => {
        const tgData = await res.json();
        if (tgData.result?.message_id) {
          tgMsgId = tgData.result.message_id;
        }
      })
      .catch((err) => {
        console.error('Telegram notification error:', err);
      });
    }

    // 2. Google Sheets Logging (non-blocking)
    if (GOOGLE_SCRIPT_URL) {
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || '-',
          phone: canonicalPhone || phone || '-',
          social: formattedSocial || '-',
          instagram: dbInstagram || '-',
          tariff: productName,
          amount: floatAmount,
          currency: canonicalCurrency,
          order_id: orderReference,
          status: 'Очікується оплата',
          target_sheet: "Ленд 3",
          apiKey: SHEETS_API_KEY,
          ...marketingAttr
        }),
      }).catch((err) => {
        console.error('Sheets logging error:', err);
      });
    }

    // Await Telegram to make sure we have the tgMsgId before generating the response
    await tgPromise;

    // 3. Supabase Integration & Lead Stitching
    const clientUuid = visitor_id || marketingAttr.visitor_uuid || null;
    const phoneOrSocial = canonicalPhone || formattedSocial || phone || social || '';
    const cleanDigits = phoneOrSocial ? cleanPhone(phoneOrSocial) : '';

    let resolvedUuid = clientUuid;

    if (cleanDigits) {
      try {
        const { data: existingLeads, error: searchError } = await supabaseAdmin
          .from("victoria_leads")
          .select("visitor_uuid")
          .or(`phone.eq.${canonicalPhone || cleanDigits},phone.eq.+${cleanDigits},phone.eq.${cleanDigits}`)
          .not("visitor_uuid", "is", null)
          .order("created_at", { ascending: true })
          .limit(1);

        if (searchError) {
          console.error("[Rozbir Ingest] Supabase stitch search error:", searchError);
        } else if (existingLeads && existingLeads.length > 0) {
          resolvedUuid = existingLeads[0].visitor_uuid;
          console.log(`[Rozbir Ingest] Stitched visitor from ${clientUuid} to ${resolvedUuid} based on phone ${canonicalPhone || cleanDigits}`);
        }
      } catch (e: any) {
        console.error("[Rozbir Ingest] Stitch lookup exception:", e.message);
      }
    }

    if (!resolvedUuid) {
      resolvedUuid = crypto.randomUUID();
    }

    const dbPayload = {
      name: name ? String(name).trim() : null,
      phone: canonicalPhone || (cleanDigits ? `+${cleanDigits}` : null),
      social: formattedSocial || null,
      instagram: dbInstagram || null,
      niche: null,
      amount: floatAmount,
      status: '⏳ Очікується оплата',
      is_free: floatAmount === 0,
      order_id: orderReference,
      sheet_id: null,
      target_sheet: "Ленд 3",
      utm_source: marketingAttr.utm_source || '',
      utm_medium: marketingAttr.utm_medium || '',
      utm_campaign: marketingAttr.utm_campaign || '',
      utm_content: marketingAttr.utm_content || '',
      utm_term: marketingAttr.utm_term || '',
      page_path: marketingAttr.page_path || "/rozbir",
      page_url: marketingAttr.page_url || `${WFP_MERCHANT_DOMAIN}/rozbir`,
      visitor_uuid: resolvedUuid,
      raw_payload: {
        ...data,
        ...marketingAttr,
        currency: canonicalCurrency,
        product_type: 'consultation',
        product_name: productName,
        payment_system: 'wayforpay',
        metadata: {
          currency: canonicalCurrency,
          product_type: 'consultation',
          product_name: productName,
          payment_system: 'wayforpay'
        }
      },
      tg_msg_id: tgMsgId ? String(tgMsgId) : null
    };

    // 4. Generate WayForPay Signature
    const signatureData = [
      WFP_MERCHANT_ACCOUNT,
      WFP_MERCHANT_DOMAIN,
      orderReference,
      orderDate,
      amountStr,
      canonicalCurrency,
      productName,
      productCount,
      amountStr
    ].join(";");

    const merchantSignature = crypto
      .createHmac('md5', WFP_SECRET_KEY)
      .update(signatureData, 'utf8')
      .digest('hex');

    const host = req.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    const paymentData = {
      merchantAccount: WFP_MERCHANT_ACCOUNT,
      merchantDomainName: WFP_MERCHANT_DOMAIN,
      merchantSignature,
      orderReference,
      orderDate,
      amount: floatAmount,
      currency: canonicalCurrency,
      productName: [productName],
      productPrice: [floatAmount],
      productCount: [1],
      clientFirstName: name ? String(name).trim() : '',
      clientPhone: canonicalPhone || phone || '',
      language: "UA",
      returnUrl: `${currentDomain}/api/thanks-redirect?successUrl=/rozbir/thanks&failUrl=/rozbir/fail`,
      serviceUrl: `${currentDomain}/api/payment-callback`
    };

    try {
      const { error: dbErr } = await supabaseAdmin.from("victoria_leads").insert(dbPayload);
      if (dbErr) {
        console.error('[Rozbir Ingest] Supabase insert error:', dbErr);
      } else {
        console.log('[Rozbir Ingest] Successfully saved lead in Supabase with Enrichment Protocol v2.0');
      }
    } catch (err: any) {
      console.error('[Rozbir Ingest] Supabase insert exception:', err.message || err);
    }

    return NextResponse.json({ ...paymentData, uuid: null, visitor_uuid: resolvedUuid, tgMsgId });

  } catch (error) {
    console.error('Initiate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
