import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: Request) {
  const timestamp = new Date().toISOString();
  const merchantSecretKey = (process.env.WFP_SECRET_KEY || '').replace(/['"]/g, '').trim();

  try {
    const rawText = await request.text();
    console.log(`[${timestamp}] PAYMENT CALLBACK RECEIVED`);

    let data: any = {};
    const params = new URLSearchParams(rawText);
    if (params.has('orderReference')) {
      params.forEach((value, key) => { data[key] = value; });
    } else {
      try { data = JSON.parse(rawText); } catch (e) {
        console.error("[Callback] Body parse error:", rawText.substring(0, 200));
      }
    }

    const orderRef = data.orderReference;
    const status = data.transactionStatus;

    if (!orderRef || !status) {
      console.error("[Callback] Missing critical fields:", data);
      return new Response('Missing critical fields', { status: 400 });
    }

    console.log(`[Callback] Order ${orderRef} transaction status received: ${status}`);

    const isSuccess = String(status).toUpperCase() === 'APPROVED';
    const parsedStatus = isSuccess ? 'Approved' : String(status);

    // 2. UPDATE DB STATUS (Supabase victoria_leads)
    try {
      const { error: dbErr } = await supabaseAdmin
        .from("victoria_leads")
        .update({ status: parsedStatus })
        .eq("order_id", String(orderRef));
      if (dbErr) {
        console.error("[Callback] Supabase status update error payload:", dbErr);
      } else {
        console.log(`[Callback] Supabase status updated successfully to ${parsedStatus} for order ${orderRef}`);
      }
    } catch (err: any) {
      console.error("[Callback] Supabase status update failed:", err.message || err);
    }

    // 3. RESPOND TO WAYFORPAY (Verify and sign)
    const time = Math.floor(Date.now() / 1000);
    const stringToHash = [orderRef, 'accept', time].join(';');
    const signature = crypto.createHmac('md5', merchantSecretKey).update(stringToHash).digest('hex');

    return NextResponse.json({
      orderReference: orderRef,
      status: 'accept',
      time: time,
      signature: signature
    });

  } catch (error: any) {
    console.error(`[${timestamp}] CALLBACK EXCEPTION:`, error.message);
    // Always return a 200 OK so that WayForPay does not endlessly retry on Vercel exceptions
    return new Response('ok', { status: 200 });
  }
}
