import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { 
      amount, 
      currency: reqCurrency, 
      tariffName, 
      customerEmail, 
      customerName, 
      customerPhone, 
      telegram,
      successUrl, 
      failUrl, 
      targetSheet,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      full_url
    } = await request.json();

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

    // Telegram Notification
    let tgMsgId = null;
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    if (token && chatId) {
      const isPracticum = targetSheet === "Практикум";
      const title = isPracticum ? "⏳ <b>Очікується оплата (Практикум)</b>" : "⏳ <b>Очікується оплата (Бронь)</b>";
      const utmInfo = utm_source ? `\n\n🔍 <b>Джерело:</b> ${utm_source} / ${utm_medium || '-'}` : "";

      const message = `${title}\n\n` +
        `👤 <b>Клієнт:</b> ${customerName || '-'}\n` +
        `📞 <b>Телефон:</b> ${customerPhone || '-'}\n` +
        `📦 <b>Тариф:</b> ${tariffName}\n` +
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

    // CRM Logging & UUID Generation
    let uuid = null;
    const GOOGLE_SCRIPT_CRM = process.env.GOOGLE_SCRIPT_URL;
    if (GOOGLE_SCRIPT_CRM) {
      try {
        const res = await fetch(GOOGLE_SCRIPT_CRM, {
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
        });
        const resData = await res.json();
        if (resData.uuid) uuid = resData.uuid;
      } catch (err) {
        console.error('CRM logging failed:', err);
      }
    }

    return NextResponse.json({ ...paymentData, uuid });
  } catch (error) {
    console.error('WFP Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
