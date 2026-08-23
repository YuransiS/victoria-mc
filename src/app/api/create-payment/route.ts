import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone, normalizeEmail, normalizeTelegram, normalizeInstagram, normalizeCurrency, normalizeAmount, resolveProductType, extractMarketingAttribution } from '@/lib/enrichment';

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

function formatTelegramHandle(tg: string): string {
  if (!tg) return '';
  let username = tg.trim();
  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.replace('t' + '.me/', 'telegram.me/').split('telegram.me/');
      username = parts[parts.length - 1];
    }
  }
  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();
  if (username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return '';
  }
  return username ? `@${username}` : '';
}

function normalizeInstagramHandle(ig: string): string {
  if (!ig) return '';
  let username = ig.trim();
  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.split('instagram.com/');
      username = parts[parts.length - 1];
    }
  }
  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();
  if (username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return '';
  }
  return username ? `@${username}` : '';
}

function formatInstagramLink(ig: string): string {
  const normalized = normalizeInstagramHandle(ig);
  if (!normalized) return '';
  const username = normalized.substring(1); // Remove the @
  return `<a href="https://instagram.com/${username}">${normalized}</a>`;
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
    const canonicalCurrency = normalizeCurrency(reqCurrency);
    const floatAmount = normalizeAmount(amount);
    const resolvedProdType = resolveProductType({
      productType: body.product_type,
      tariffName: tariffName,
      targetSheet: targetSheet,
      amount: floatAmount
    });

    const canonicalPhone = normalizePhone(customerPhone);
    const canonicalTelegram = normalizeTelegram(telegram);
    const canonicalInstagram = normalizeInstagram(instagram);
    const canonicalEmail = normalizeEmail(customerEmail);

    const formattedTelegram = canonicalTelegram ? `@${canonicalTelegram}` : '';
    const dbInstagram = canonicalInstagram ? `@${canonicalInstagram}` : '';
    const formattedInstagram = formatInstagramLink(dbInstagram);

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
    const currency = canonicalCurrency;
    
    // Exact string match for amount in signature and form POST
    const amountStr = floatAmount % 1 === 0 ? floatAmount.toString() : floatAmount.toFixed(2);
    const productNameStr = `Booking: ${tariffName || 'Інтенсив'}`;
    const productCountStr = "1";

    const signatureData = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amountStr,
      currency,
      productNameStr,
      productCountStr,
      amountStr
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

    // Prepare reliable contact info for WayForPay (WFP rejects '-' or non-numeric phone)
    const rawDigits = (canonicalPhone || customerPhone || '').replace(/\D/g, '');
    const validClientPhone = rawDigits.length >= 7 ? rawDigits : '380990000000';
    const validClientEmail = canonicalEmail || (canonicalTelegram ? `${canonicalTelegram}@telegram.com` : `client-${validClientPhone}@victoria-mc.com`);
    const validClientName = customerName ? String(customerName).trim() : 'Клієнт';

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount: amountStr,
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [amountStr],
      clientFirstName: validClientName,
      clientEmail: validClientEmail,
      clientPhone: validClientPhone,
      language: 'UA',
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
      const isMasterclass = targetSheet === "Автовеб";
      const title = isPracticum 
        ? "⏳ <b>Очікується оплата (Практикум)</b>" 
        : isMasterclass 
        ? "⏳ <b>Очікується оплата (Майстер-клас)</b>" 
        : "⏳ <b>Очікується оплата (Бронь)</b>";
      const utmInfo = utm_source ? `\n\n🔍 <b>Джерело:</b> ${utm_source} / ${utm_medium || '-'}` : "";

      let message = `${title}\n\n` +
        `👤 <b>Клієнт:</b> ${customerName || '-'}\n` +
        `📞 <b>Телефон:</b> ${formatTelegramPhone(customerPhone)}\n`;
      if (formattedTelegram) {
        message += `📱 <b>Telegram:</b> ${formattedTelegram}\n`;
      }
      if (formattedInstagram) {
        message += `📸 <b>Instagram:</b> ${formattedInstagram}\n`;
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

    // 3. Supabase Integration & Lead Stitching
    const clientUuid = visitor_id || null;
    const phoneOrSocial = canonicalPhone || formattedTelegram || customerPhone || telegram || '';
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
          console.error("[Create Payment] Supabase stitch search error:", searchError);
        } else if (existingLeads && existingLeads.length > 0) {
          resolvedUuid = existingLeads[0].visitor_uuid;
          console.log(`[Create Payment] Stitched visitor from ${clientUuid} to ${resolvedUuid} based on phone ${canonicalPhone || cleanDigits}`);
        }
      } catch (e: any) {
        console.error("[Create Payment] Stitch lookup exception:", e.message);
      }
    }

    if (!resolvedUuid) {
      resolvedUuid = crypto.randomUUID();
    }

    const marketingAttr = extractMarketingAttribution(
      body,
      undefined,
      body.page_path,
      full_url || body.page_url
    );

    const dbPayload = {
      name: customerName ? String(customerName).trim() : null,
      phone: canonicalPhone || (cleanDigits ? `+${cleanDigits}` : null),
      social: formattedTelegram || null,
      instagram: dbInstagram || null,
      niche: null,
      amount: floatAmount,
      status: '⏳ Очікується оплата',
      is_free: floatAmount === 0,
      order_id: orderReference,
      sheet_id: null,
      target_sheet: targetSheet || "Бронювання",
      utm_source: marketingAttr.utm_source || utm_source || '',
      utm_medium: marketingAttr.utm_medium || utm_medium || '',
      utm_campaign: marketingAttr.utm_campaign || utm_campaign || '',
      utm_content: marketingAttr.utm_content || utm_content || '',
      utm_term: marketingAttr.utm_term || utm_term || '',
      page_path: marketingAttr.page_path || '/',
      page_url: marketingAttr.page_url || full_url || '',
      visitor_uuid: resolvedUuid,
      raw_payload: {
        ...body,
        ...marketingAttr,
        currency: canonicalCurrency,
        product_type: resolvedProdType,
        product_name: tariffName,
        payment_system: 'wayforpay',
        metadata: {
          currency: canonicalCurrency,
          product_type: resolvedProdType,
          product_name: tariffName,
          payment_system: 'wayforpay'
        }
      },
      tg_msg_id: tgMsgId ? String(tgMsgId) : null
    };

    try {
      const { error: dbErr } = await supabaseAdmin.from("victoria_leads").insert(dbPayload);
      if (dbErr) {
        console.error('[Create Payment] Supabase insert error:', dbErr);
      } else {
        console.log('[Create Payment] Successfully saved lead in Supabase with Enrichment Protocol v2.0');
      }
    } catch (err: any) {
      console.error('[Create Payment] Supabase insert exception:', err.message || err);
    }

    return NextResponse.json({ ...paymentData, uuid: null, visitor_uuid: resolvedUuid, tgMsgId });
  } catch (error) {
    console.error('WFP Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
