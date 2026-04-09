import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const status = formData.get('transactionStatus');
    const orderReference = formData.get('orderReference');
    
    const url = new URL(request.url);
    
    // If payment failed or was declined
    if (status === 'Declined' || status === 'Failed') {
      return NextResponse.redirect(`${url.origin}/payment-error?orderReference=${orderReference}`, { status: 303 });
    }

    // Default: Success
    return NextResponse.redirect(`${url.origin}/thanks?orderReference=${orderReference}`, { status: 303 });
  } catch (e) {
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/thanks`, { status: 303 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const status = searchParams.get('transactionStatus');
  
  if (status === 'Declined' || status === 'Failed') {
    return NextResponse.redirect(`${url.origin}/payment-error?${searchParams.toString()}`, { status: 303 });
  }
  
  return NextResponse.redirect(`${url.origin}/thanks?${searchParams.toString()}`, { status: 303 });
}
