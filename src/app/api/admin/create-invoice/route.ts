import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { amount, currency: reqCurrency, tariffName, customerEmail, customerName, customerPhone } = await request.json();

    const merchantAccount = process.env.WFP_MERCHANT_LOGIN?.replace(/['"]/g, '').trim();
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim();
    const merchantDomainName = (process.env.WFP_MERCHANT_DOMAIN || 'victoria-mc.vercel.app').replace(/['"]/g, '').trim();
    
    if (!merchantAccount || !merchantSecretKey) {
      return NextResponse.json({ error: 'Config missing' }, { status: 500 });
    }

    const orderReference = `VMC_INV_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const orderDate = Math.floor(Date.now() / 1000);
    const currency = reqCurrency || 'UAH';
    
    const productPriceStr = amount.toString();
    const productNameStr = tariffName || 'Оплата послуг';
    const productCountStr = "1";

    const signatureData = [
      merchantAccount,
      merchantDomainName,
      orderReference,
      orderDate.toString(),
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

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    const currentDomain = `${protocol}://${host}`;

    const payload = {
      transactionType: "CREATE_INVOICE",
      merchantAccount,
      merchantAuthType: "SimpleSignature",
      merchantDomainName,
      merchantSignature,
      apiVersion: 1,
      language: "UA",
      orderReference,
      orderDate,
      amount: parseFloat(amount),
      currency,
      productName: [productNameStr],
      productCount: [1],
      productPrice: [parseFloat(amount)],
      clientFirstName: String(customerName || "Клієнт"),
      clientEmail: String(customerEmail || ""),
      clientPhone: String(customerPhone || ""),
      serviceUrl: `${currentDomain}/api/payment-callback`,
      paymentSystems: "card;applePay;googlePay"
    };

    const response = await fetch('https://api.wayforpay.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (result.invoiceUrl) {
      return NextResponse.json({ invoiceUrl: result.invoiceUrl, orderReference });
    } else {
      console.error('WayForPay Invoice Error:', result);
      return NextResponse.json({ error: result.reason || 'Failed to create invoice' }, { status: 400 });
    }

  } catch (error) {
    console.error('WFP API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
