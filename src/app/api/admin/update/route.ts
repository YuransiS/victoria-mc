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

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Admin Update Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
