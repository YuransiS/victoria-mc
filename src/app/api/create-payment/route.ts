import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, tariffName, customerEmail, customerName, customerPhone } = await request.json();

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
    const currency = 'UAH';
    
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

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount: parseInt(amount),
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [parseInt(amount)],
      clientFirstName: customerName,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      serviceUrl: `${currentDomain}/api/payment-callback`,
      returnUrl: `${currentDomain}/thanks`,
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('WFP Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
