import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { visitorId, path, utms } = body;

    // Log to Google Sheets via central script
    if (GOOGLE_SCRIPT_URL) {
      // Use fire and forget to not block the response
      fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log_traffic',
          api_key: process.env.SHEETS_API_KEY,
          visitorId,
          path,
          utm_source: utms?.utm_source || '',
          utm_medium: utms?.utm_medium || '',
          utm_campaign: utms?.utm_campaign || '',
          ip: req.headers.get('x-forwarded-for') || 'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        })
      }).catch(err => console.error('Analytics logging error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics route error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
