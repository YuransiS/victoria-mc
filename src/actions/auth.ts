'use server';

import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'victoria_super_secret_jwt_key_at_least_32_characters_long'
);

export async function loginAction(formData: FormData | Record<string, string>) {
  let username = '';
  let password = '';

  if (formData instanceof FormData) {
    username = formData.get('username') as string;
    password = formData.get('password') as string;
  } else {
    username = formData.username;
    password = formData.password;
  }

  if (!username || !password) {
    return { success: false, error: 'Всі поля обов’язкові' };
  }

  // Read environment variables with hardcoded fallbacks
  const opUser = process.env.AUTH_OP_USER || 'viktoria_supervisor:superpass123';
  const salesUser = process.env.AUTH_SALES_USER || 'vm-sales:salespass123';
  const devUser = process.env.AUTH_DEV_USER || 'Yuransis:56780156Yura';

  const [opLogin, opPass] = opUser.split(':');
  const [salesLogin, salesPass] = salesUser.split(':');
  const [devLogin, devPass] = devUser.split(':');

  let role: 'OP' | 'SALES' | 'DEVELOPER' | null = null;

  if (username === opLogin && password === opPass) {
    role = 'OP';
  } else if (username === salesLogin && password === salesPass) {
    role = 'SALES';
  } else if (username === devLogin && password === devPass) {
    role = 'DEVELOPER';
  }

  if (!role) {
    return { success: false, error: 'Невірний логін або пароль' };
  }

  // Generate JWT token
  const token = await new SignJWT({ role, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);

  // Save token in cookies
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return { success: true, role };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
  return { success: true };
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { role: 'OP' | 'SALES' | 'DEVELOPER'; username: string };
  } catch (err) {
    return null;
  }
}

export async function getCurrentUserRole() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_session')?.value;
  if (!token) return null;
  const decoded = await verifyToken(token);
  return decoded ? decoded.role : null;
}
