import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // WayForPay sends data as form-urlencoded
    const formData = await request.formData();
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const { 
      orderReference, 
      transactionStatus, 
      amount
    } = data;

    // 1. Log payment status to Google Sheets
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: orderReference,
          status: transactionStatus, // This will go to the 13th column
          api_key: apiKey,
          target_sheet_id: "1127634999"
        }),
      }).catch(err => console.error('Sheet update error:', err));
    }

    // 2. Respond to WayForPay with 'accept'
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
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
