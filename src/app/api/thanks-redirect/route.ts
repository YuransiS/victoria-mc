import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const status = formData.get('transactionStatus');
    const orderReference = formData.get('orderReference');
    
    const url = new URL(request.url);
    const successUrl = url.searchParams.get('successUrl');
    const failUrl = url.searchParams.get('failUrl');
    
    const getFullUrl = (path: string | null, fallback: string) => {
      if (!path) return `${url.origin}${fallback}`;
      if (path.startsWith('http')) return path;
      return `${url.origin}${path.startsWith('/') ? '' : '/'}${path}`;
    };

    // If payment failed or was declined
    if (status === 'Declined' || status === 'Failed' || status === 'Expired') {
      const targetFail = getFullUrl(failUrl, '/price/fail');
      return NextResponse.redirect(`${targetFail}${targetFail.includes('?') ? '&' : '?'}orderReference=${orderReference}`, { status: 303 });
    }

    // Default: Success
    const targetSuccess = getFullUrl(successUrl, '/price/thanks');
    return NextResponse.redirect(`${targetSuccess}${targetSuccess.includes('?') ? '&' : '?'}orderReference=${orderReference}`, { status: 303 });
  } catch (e) {
    const url = new URL(request.url);
    return NextResponse.redirect(`${url.origin}/price/thanks`, { status: 303 });
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const status = searchParams.get('transactionStatus');
  const successUrl = searchParams.get('successUrl');
  const failUrl = searchParams.get('failUrl');
  
  const getFullUrl = (path: string | null, fallback: string) => {
    if (!path) return `${url.origin}${fallback}`;
    if (path.startsWith('http')) return path;
    return `${url.origin}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (status === 'Declined' || status === 'Failed' || status === 'Expired') {
    const targetFail = getFullUrl(failUrl, '/price/fail');
    return NextResponse.redirect(`${targetFail}${targetFail.includes('?') ? '&' : '?'}${searchParams.toString()}`, { status: 303 });
  }
  
  const targetSuccess = getFullUrl(successUrl, '/price/thanks');
  return NextResponse.redirect(`${targetSuccess}${targetSuccess.includes('?') ? '&' : '?'}${searchParams.toString()}`, { status: 303 });
}
