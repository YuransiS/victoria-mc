import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'victoria_super_secret_jwt_key_at_least_32_characters_long'
);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { role: 'OP' | 'SALES' | 'DEVELOPER'; username: string };
  } catch (err) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('admin_session')?.value;

  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isLoginRoute = pathname === '/login' || pathname === '/api/admin/login';

  // 1. If not authenticated and trying to access a protected route
  if (isProtectedRoute && !isLoginRoute) {
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('admin_session');
      return response;
    }

    const role = payload.role;

    // 2. Role-Based Access Control (RBAC)
    if (role === 'SALES') {
      // SALES is allowed ONLY to access /admin/leads and public API calls
      const isSalesAllowedPath = pathname === '/admin/leads' || pathname.startsWith('/api/admin');
      
      if (!isSalesAllowedPath) {
        return NextResponse.redirect(new URL('/admin/leads', request.url));
      }
    }
  }

  // 3. If authenticated trying to access the login page
  if (pathname === '/login' && token) {
    const payload = await verifyToken(token);
    if (payload) {
      const redirectUrl = payload.role === 'SALES' ? '/admin/leads' : '/admin/analytics';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};
