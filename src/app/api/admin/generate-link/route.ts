import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, currency, tariffName, customerName, customerPhone, uuid } = await request.json();

    const secretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim() || 'default_secret';

    const payloadObj = {
      a: amount,
      c: currency || 'UAH',
      t: tariffName || 'Оплата послуг',
      n: customerName || '',
      p: customerPhone || '',
      u: uuid || ''
    };

    const payloadStr = JSON.stringify(payloadObj);
    const pBase64 = Buffer.from(payloadStr).toString('base64');

    const signature = crypto
      .createHmac('sha256', secretKey)
      .update(pBase64)
      .digest('hex');

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    const checkoutUrl = `${currentDomain}/checkout?p=${encodeURIComponent(pBase64)}&sig=${signature}`;

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Generate Link Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
