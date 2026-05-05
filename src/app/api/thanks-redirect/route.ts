import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const status = formData.get('transactionStatus');
    const orderReference = formData.get('orderReference');
    
    const url = new URL(request.url);
    const successUrl = url.searchParams.get('successUrl');
    const failUrl = url.searchParams.get('failUrl');
    
    // If payment failed or was declined
    if (status === 'Declined' || status === 'Failed') {
      const targetFail = failUrl ? `${url.origin}${failUrl}` : `${url.origin}/payment-error`;
      return NextResponse.redirect(`${targetFail}?orderReference=${orderReference}`, { status: 303 });
    }

    // Default: Success
    const targetSuccess = successUrl ? `${url.origin}${successUrl}` : `${url.origin}/thanks`;
    return NextResponse.redirect(`${targetSuccess}?orderReference=${orderReference}`, { status: 303 });
  } catch (e) {
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/thanks`, { status: 303 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const status = searchParams.get('transactionStatus');
  const successUrl = searchParams.get('successUrl');
  const failUrl = searchParams.get('failUrl');
  
  if (status === 'Declined' || status === 'Failed') {
    const targetFail = failUrl ? `${url.origin}${failUrl}` : `${url.origin}/payment-error`;
    return NextResponse.redirect(`${targetFail}?${searchParams.toString()}`, { status: 303 });
  }
  
  const targetSuccess = successUrl ? `${url.origin}${successUrl}` : `${url.origin}/thanks`;
  return NextResponse.redirect(`${targetSuccess}?${searchParams.toString()}`, { status: 303 });
}
