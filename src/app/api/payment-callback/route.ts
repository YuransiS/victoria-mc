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

    // 1. UPDATE DB STATUS (Supabase victoria_leads)
    const supabasePromise = supabaseAdmin
      .from("victoria_leads")
      .update({ status: parsedStatus })
      .eq("order_id", String(orderRef));

    // 2. SYNC STATUS TO GOOGLE SHEETS
    const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;
    let googlePromise: Promise<any> = Promise.resolve();

    if (GOOGLE_SCRIPT_URL) {
      const sheetsStatus = isSuccess ? '✅ Оплачено' : `❌ Відхилено (${status})`;
      googlePromise = fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          order_id: String(orderRef),
          status: sheetsStatus,
          amount: data.amount || '0',
          currency: data.currency || 'UAH',
          api_key: process.env.SHEETS_API_KEY
        })
      }).then(async (res) => {
        const text = await res.text();
        console.log(`[Callback] Google CRM Status Sync: ${text}`);
        return text;
      }).catch(err => {
        console.error('[Callback] Google CRM Status Sync failed:', err);
      });
    }

    const callbackResults = await Promise.allSettled([supabasePromise, googlePromise]);

    // Log Supabase status update results
    const dbRes = callbackResults[0];
    if (dbRes.status === 'rejected') {
      console.error("[Callback] Supabase status update failed:", dbRes.reason);
    } else {
      const dbErr = (dbRes.value as any)?.error;
      if (dbErr) {
        console.error("[Callback] Supabase status update error payload:", dbErr);
      } else {
        console.log(`[Callback] Supabase status updated successfully to ${parsedStatus} for order ${orderRef}`);
      }
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
