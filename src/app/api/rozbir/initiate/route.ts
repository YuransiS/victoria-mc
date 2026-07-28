import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

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
    const { name, phone, social, amount, utm_source, utm_medium, utm_campaign, utm_content, utm_term, visitor_id, instagram } = data;
    const formattedSocial = formatTelegramHandle(social || '');
    const dbInstagram = normalizeInstagramHandle(instagram || '');
    const formattedInstagram = formatInstagramLink(dbInstagram);

    if (!WFP_SECRET_KEY || !WFP_MERCHANT_ACCOUNT) {
      return NextResponse.json({ error: 'WayForPay configuration missing' }, { status: 500 });
    }
    const orderReference = `ROZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const productName = "Персональний розбір";
    const productCount = "1";
    const amountStr = String(amount);

    // 1. Telegram Notification (Run first to capture tgMsgId for CRM updates)
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;
    let tgMsgId = null;
    let tgPromise: Promise<any> = Promise.resolve();

    if (token && chatId) {
      const title = "⏳ <b>Очікується оплата (Персональний розбір)</b>";
      const utmInfo = utm_source ? `\n\n🔍 <b>Джерело:</b> ${utm_source} / ${utm_medium || '-'}` : "";

      const message = `${title}\n\n` +
        `👤 <b>Клієнт:</b> ${name || '-'}\n` +
        `📞 <b>Телефон:</b> ${formatTelegramPhone(phone)}\n` +
        `📱 <b>Social:</b> ${formattedSocial || '-'}\n` +
        (formattedInstagram ? `📸 <b>Instagram:</b> ${formattedInstagram}\n` : '') +
        `💰 <b>Сума:</b> ${amount} UAH\n` +
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
        return tgData;
      })
      .catch(err => {
        console.error('Telegram rozbir failed:', err);
        return null;
      });

      // Await Telegram to make sure tgMsgId is captured before logging to Sheets
      await tgPromise;
    }

    // 3. Supabase Integration & Lead Stitching
    const clientUuid = visitor_id || null;
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
          console.error("[Rozbir Ingest] Supabase stitch search error:", searchError);
        } else if (existingLeads && existingLeads.length > 0) {
          resolvedUuid = existingLeads[0].visitor_uuid;
          console.log(`[Rozbir Ingest] Stitched visitor from ${clientUuid} to ${resolvedUuid} based on phone ${normalizedPhone}`);
        }
      } catch (e: any) {
        console.error("[Rozbir Ingest] Stitch lookup exception:", e.message);
      }
    }

    if (!resolvedUuid) {
      resolvedUuid = crypto.randomUUID();
    }

    const dbPayload = {
      name: name || null,
      phone: normalizedPhone || null,
      social: formattedSocial || null,
      instagram: dbInstagram || null,
      niche: null,
      amount: Number(amount) || 0,
      status: '⏳ Очікується оплата',
      is_free: Number(amount) === 0,
      order_id: orderReference,
      sheet_id: null,
      target_sheet: "Ленд 3",
      utm_source: utm_source || '',
      utm_medium: utm_medium || '',
      utm_campaign: utm_campaign || '',
      utm_content: utm_content || '',
      utm_term: utm_term || '',
      page_path: "/rozbir",
      page_url: `${WFP_MERCHANT_DOMAIN}/rozbir`,
      visitor_uuid: resolvedUuid,
      raw_payload: data,
      tg_msg_id: tgMsgId ? String(tgMsgId) : null
    };

    // 4. Generate WayForPay Signature
    const signatureData = [
      WFP_MERCHANT_ACCOUNT,
      WFP_MERCHANT_DOMAIN,
      orderReference,
      orderDate,
      amountStr,
      "UAH",
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
      amount: Number(amount),
      currency: "UAH",
      productName: [productName],
      productPrice: [Number(amount)],
      productCount: [1],
      clientFirstName: name,
      clientPhone: phone,
      language: "UA",
      returnUrl: `${currentDomain}/api/thanks-redirect?successUrl=/rozbir/thanks&failUrl=/rozbir/fail`,
      serviceUrl: `${currentDomain}/api/payment-callback`
    };

    try {
      const { error: dbErr } = await supabaseAdmin.from("victoria_leads").insert(dbPayload);
      if (dbErr) {
        console.error('[Rozbir Ingest] Supabase insert error:', dbErr);
      } else {
        console.log('[Rozbir Ingest] Successfully saved lead in Supabase');
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
