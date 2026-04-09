import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, tariffName, customerEmail, customerName, customerPhone } = await request.json();

    const merchantAccount = process.env.WFP_MERCHANT_LOGIN;
    const merchantSecretKey = process.env.WFP_SECRET_KEY;
    const merchantDomainName = process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.com.ua';
    const orderReference = `ORDER_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const currency = 'UAH';
    const productName = [`Бронювання тарифу: ${tariffName}`];
    const productCount = [1];
    const productPrice = [amount];

    // Signature data string:
    // merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[0];productCount[0];productPrice[0]
    const signatureData = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate,
      amount,
      currency,
      ...productName,
      ...productCount,
      ...productPrice
    ].join(';');

    const merchantSignature = crypto
      .createHmac('md5', merchantSecretKey!)
      .update(signatureData)
      .digest('hex');

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount,
      currency,
      productName,
      productCount,
      productPrice,
      clientFirstName: customerName,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      serviceUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/api/payment-callback`,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || ''}/thanks`,
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
