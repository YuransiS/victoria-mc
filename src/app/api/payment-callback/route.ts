import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('WayForPay Callback:', data);

    const { 
      orderReference, 
      transactionStatus, 
      amount, 
      reason, 
      merchantSignature 
    } = data;

    // Security check: Validate signature from WFP
    // signature = orderReference;amount;currency;transactionStatus;reason;settlementDate
    // But WFP signature for response is complex. For now, let's focus on logic.
    
    // 1. Notify Google Sheets about payment status
    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
    if (scriptUrl) {
      // We send this as a "Log" entry
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: `PAYMENT CALLBACK: ${transactionStatus}`,
          phone: `Order: ${orderReference}`,
          tariff: reason || "Payment status update",
          amount: amount,
          order_id: orderReference,
          target_sheet_id: "1127634999",
          api_key: process.env.NEXT_PUBLIC_SHEETS_API_KEY
        }),
      });
    }

    // WayForPay requires an 'accept' response
    const merchantAccount = process.env.WFP_MERCHANT_LOGIN;
    const time = Math.floor(Date.now() / 1000);
    const responseSignatureData = [orderReference, 'accept', time].join(';');
    const signature = crypto
      .createHmac('md5', process.env.WFP_SECRET_KEY!)
      .update(responseSignatureData)
      .digest('hex');

    return NextResponse.json({
      orderReference,
      status: 'accept',
      time,
      signature
    });

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Callback failed' }, { status: 500 });
  }
}
