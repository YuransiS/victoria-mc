import { NextResponse } from 'next/server';

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL;

export async function GET() { return handleRequest(); }
export async function POST() { return handleRequest(); }

async function handleRequest() {
  console.log('API: /api/admin/data called');
  try {
    const urls = [
      process.env.GOOGLE_SCRIPT_URL,
      process.env.GOOGLE_SCRIPT_URL_STVORYUI
    ].filter(Boolean) as string[];

    if (urls.length === 0) {
      throw new Error("No Google Script URLs configured");
    }

    const results = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              action: 'get_admin_data',
              api_key: process.env.SHEETS_API_KEY 
            })
          });
          if (!res.ok) {
            console.warn(`Fetch to ${url} failed with status ${res.status}`);
            return { leads: [], traffic: [] };
          }
          const data = await res.json();
          return {
            leads: data.leads || [],
            traffic: data.traffic || []
          };
        } catch (e) {
          console.error(`Fetch error for ${url}:`, e);
          return { leads: [], traffic: [] };
        }
      })
    );

    // Merge all leads and traffic
    const allLeads = results.flatMap(r => r.leads || []);
    const allTraffic = results.flatMap(r => r.traffic || []);

    return NextResponse.json({
      leads: JSON.parse(JSON.stringify(allLeads)),
      traffic: JSON.parse(JSON.stringify(allTraffic))
    });
  } catch (error: any) {
    console.error('Admin Data Fetch Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
