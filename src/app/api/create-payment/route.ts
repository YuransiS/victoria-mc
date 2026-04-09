import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, tariffName, customerEmail, customerName, customerPhone } = await request.json();

    // Dynamically detect host for return/service URLs
    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    // Clean keys from possible quotes or whitespace
    const merchantAccount = process.env.WFP_MERCHANT_LOGIN?.replace(/['"]/g, '').trim();
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim();
    const merchantDomainName = (process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.com.ua').replace(/['"]/g, '').trim();
    
    const orderReference = `ORDER_${Date.now()}`;
    const orderDate = Math.floor(Date.now() / 1000).toString();
    const currency = 'UAH';
    
    // Normalized values for signature
    const productPriceStr = amount.toString();
    const productNameStr = `Бронювання: ${tariffName}`;
    const productCountStr = "1";

    // Signature data string strictly following WFP docs:
    // merchantAccount;merchantDomainName;orderReference;orderDate;amount;currency;productName[0];productCount[0];productPrice[0]
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
      .createHmac('md5', merchantSecretKey!)
      .update(signatureData, 'utf8')
      .digest('hex');

    const paymentData = {
      merchantAccount,
      merchantDomainName,
      merchantSignature,
      orderReference,
      orderDate,
      amount: amount,
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [amount],
      clientFirstName: customerName,
      clientEmail: customerEmail,
      clientPhone: customerPhone,
      serviceUrl: `${currentDomain}/api/payment-callback`,
      returnUrl: `${currentDomain}/thanks`,
    };

    return NextResponse.json(paymentData);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 });
  }
}
