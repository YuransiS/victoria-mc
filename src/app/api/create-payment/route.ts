import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, tariffName, customerEmail, customerName, customerPhone } = await request.json();

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    const merchantAccount = "freelance_user_665d96f1b94f6";
    const merchantSecretKey = "02b6627f80439146d019fb6e8c865e67"; 
    const merchantDomainName = "victoria-mc.com.ua"; 
    
    const orderReference = `ORDER_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000).toString();
    const currency = 'UAH';
    const amountStr = amount.toString();
    
    const productNameStr = `Booking: ${tariffName}`; 
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
      amount: amountStr,
      currency,
      productName: [productNameStr],
      productCount: [productCountStr],
      productPrice: [amountStr],
      clientFirstName: customerName,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      language: 'UA',
      serviceUrl: `${currentDomain}/api/payment-callback`,
      returnUrl: `${currentDomain}/thanks`,
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
