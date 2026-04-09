import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // When WayForPay redirects to /thanks via POST, 
  // we just redirect the user to the same URL via GET
  // to show the success page without the "Server action not found" error.
  const url = new URL(request.url);
  return NextResponse.redirect(`${url.origin}/thanks`, { status: 303 });
}
