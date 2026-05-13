import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function GET() { return handleRequest(); }
export async function POST() { return handleRequest(); }

async function handleRequest() {
  console.log('API: /api/admin/data called');
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    if (!scriptUrl) {
      throw new Error("No Google Script URL configured");
    }

    const res = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        action: 'get_admin_data',
        api_key: apiKey 
      })
    });

    if (!res.ok) {
      throw new Error(`Fetch to Google Script failed with status ${res.status}`);
    }

    const data = await res.json();

    return NextResponse.json({
      leads: data.leads || [],
      traffic: data.traffic || [],
      global_users: data.global_users || [],
      global_actions: data.global_actions || []
    });
  } catch (error: any) {
    console.error('Admin Data Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
