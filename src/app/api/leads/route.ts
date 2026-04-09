import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (!scriptUrl) {
      return NextResponse.json({ error: 'Google Script URL not configured' }, { status: 500 });
    }

    // Forward the request to Google Apps Script
    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        ...data,
        api_key: apiKey // Add the secret key on the server side
      }),
    });

    // Google Apps Script usually returns 200 even with no-cors, 
    // but here we are server-to-server, so we can check the status.
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Lead proxy error:', error);
    return NextResponse.json({ error: 'Failed to submit lead' }, { status: 500 });
  }
}
