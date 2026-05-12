import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, targetSheet, orderId, status, comment, uuid, sales_status } = body;

    if (!GOOGLE_SCRIPT_URL) {
      throw new Error("GOOGLE_SCRIPT_URL not configured");
    }

    const payload: any = { 
      action,
      _sheet: targetSheet,
      orderId: orderId,
      uuid: uuid,
      api_key: process.env.SHEETS_API_KEY
    };

    if (action === 'update_status') payload.status = status;
    if (action === 'update_comment') payload.comment = comment;
    if (action === 'update_global_user') {
      if (sales_status !== undefined) payload.sales_status = sales_status;
      if (comment !== undefined) payload.comment = comment;
    }

    const urls = [
      process.env.GOOGLE_SCRIPT_URL,
      process.env.GOOGLE_SCRIPT_URL_STVORYUI
    ].filter(Boolean) as string[];

    let lastResult = { error: "No lead found to update" };

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        if (result.status === "success") {
          return NextResponse.json(result);
        }
        lastResult = result;
      } catch (e) {
        console.error(`Update error for ${url}:`, e);
      }
    }

    return NextResponse.json(lastResult);
  } catch (error: any) {
    console.error('Admin Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
