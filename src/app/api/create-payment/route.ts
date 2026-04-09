import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, tariffName, customerEmail, customerName, customerPhone } = await request.json();

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    // Hardcoded credentials for absolute certainty during debugging
    const merchantAccount = "freelance_user_665d96f1b94f6";
    const merchantSecretKey = "02b6627f80439146d019fb6e8c865e67"; 
    const merchantDomainName = "victoria-mc.vercel.app"; 

    const orderReference = `VMC_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000).toString();
    const currency = 'UAH';
    
    // Спрощуємо все до рядків
    const productPriceStr = amount.toString();
    const productNameStr = `Booking Victoria MC ${tariffName}`;
    const productCountStr = "1";

    // Sequence: merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName;productCount;productPrice
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
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
