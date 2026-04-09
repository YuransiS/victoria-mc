import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // WayForPay sends data as form-urlencoded, not JSON
    const formData = await request.formData();
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    console.log('WayForPay Callback Received:', data.orderReference, data.transactionStatus);

    const { 
      orderReference, 
      transactionStatus, 
      amount, 
      reason
    } = data;

    // 1. Log to Google Sheets (using our lead proxy logic)
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (scriptUrl) {
      // Create a descriptive log entry
      const logData = {
        name: `PAYMENT: ${transactionStatus}`,
        phone: `Ref: ${orderReference}`,
        tariff: reason || "WFP Callback",
        amount: amount,
        order_id: orderReference,
        target_sheet_id: "1127634999",
        api_key: apiKey,
        utm_source: "wayforpay_callback"
      };

      await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(logData),
      }).catch(err => console.error('Sheet log error:', err));
    }

    // 2. Respond to WayForPay with 'accept'
    // Response signature: md5(orderReference + ';' + 'accept' + ';' + time)
    const time = Math.floor(Date.now() / 1000);
    const responseSignatureData = [orderReference, 'accept', time].join(';');
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim() || "";
    
    const signature = crypto
      .createHmac('md5', merchantSecretKey)
      .update(responseSignatureData)
      .digest('hex');

    return NextResponse.json({
      orderReference,
      status: 'accept',
      time,
      signature
    });

  } catch (error) {
    console.error('Callback critical error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
