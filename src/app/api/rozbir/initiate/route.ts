import { NextResponse } from 'next/server';
import crypto from 'crypto';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL_STVORYUI;
const SHEETS_API_KEY = process.env.SHEETS_API_KEY;
const WFP_SECRET_KEY = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim();
const WFP_MERCHANT_ACCOUNT = process.env.WFP_MERCHANT_LOGIN?.replace(/['"]/g, '').trim();
const WFP_MERCHANT_DOMAIN = process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.vercel.app';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { name, phone, social, amount, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = data;

    if (!WFP_SECRET_KEY || !WFP_MERCHANT_ACCOUNT) {
      return NextResponse.json({ error: 'WayForPay configuration missing' }, { status: 500 });
    }

    const orderReference = `ROZ_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const productName = "Персональний розбір";
    const productCount = "1";
    const amountStr = String(amount);

    // 1. Log Lead to Google Sheets
    if (GOOGLE_SCRIPT_URL) {
      const leadData = {
        target_sheet: "Ленд 3",
        date: new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kiev" }),
        orderId: orderReference,
        name,
        social,
        phone,
        amount,
        variant_name: `Price: ${amount} UAH`,
        status: "Новий лід (Не оплачено)",
        utm_source: utm_source || '',
        utm_medium: utm_medium || '',
        utm_campaign: utm_campaign || '',
        utm_content: utm_content || '',
        utm_term: utm_term || '',
        api_key: SHEETS_API_KEY
      };

      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData)
      }).catch(err => console.error('Lead logging failed:', err));
    }

    // 2. Generate WayForPay Signature
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

    return NextResponse.json(paymentData);

  } catch (error) {
    console.error('Initiate Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
