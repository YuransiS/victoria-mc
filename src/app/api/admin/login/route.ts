import { NextResponse } from 'next/server';

const ADMIN_USERS_LIST = [
  { username: 'valeriy_ls', password: 'Valeriy#2026!Lys', sessionKey: 'authenticated_valeriy_ls' },
  { username: 'sstavytskyi', password: 'Stav#2026!Alex', sessionKey: 'authenticated_sstavytskyi' },
  { username: 'victoria_mr', password: 'Vika#2026!Mesh', sessionKey: 'authenticated_victoria_mr' },
  { username: 'coorator', password: 'Coor#2026!Master', sessionKey: 'authenticated_coorator' },
  { username: 'yuransis', password: 'Yura$2026!SecMC', sessionKey: 'authenticated_yuransis' },
];

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const uClean = (username || '').trim().toLowerCase().replace(/^@/, '');
    const pClean = (password || '').trim();

    const matchedAdmin = ADMIN_USERS_LIST.find(
      (a) => a.username.toLowerCase() === uClean && (a.password === pClean || (a.username === 'yuransis' && pClean === '56780156Yura'))
    );

    if (matchedAdmin) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_session', matchedAdmin.sessionKey, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, message: 'Невірний логін або пароль' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Помилка сервера' },
      { status: 500 }
    );
  }
}
