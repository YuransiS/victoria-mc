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

  const uClean = username.trim().toLowerCase().replace(/^@/, '');
  const pClean = password.trim();

  const VALID_ADMINS: Array<{ username: string; password: string; role: 'OP' | 'SALES' | 'DEVELOPER' }> = [
    { username: 'valeriy_ls', password: 'Valeriy#2026!Lys', role: 'OP' },
    { username: 'sstavytskyi', password: 'Stav#2026!Alex', role: 'OP' },
    { username: 'victoria_mr', password: 'Vika#2026!Mesh', role: 'OP' },
    { username: 'coorator', password: 'Coor#2026!Master', role: 'SALES' },
    { username: 'yuransis', password: 'Yura$2026!SecMC', role: 'DEVELOPER' },
  ];

  const matched = VALID_ADMINS.find(
    (a) => a.username.toLowerCase() === uClean && (a.password === pClean || (a.username === 'yuransis' && pClean === '56780156Yura'))
  );

  const role = matched?.role || null;

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
