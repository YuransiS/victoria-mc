import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // Catch POST redirect from WayForPay and forward to the GET page
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/thanks`, { status: 303 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/thanks`, { status: 303 });
}
