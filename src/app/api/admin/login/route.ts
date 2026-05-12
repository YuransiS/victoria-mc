import { NextResponse } from 'next/server';

const ADMIN_USER = 'Yuransis';
const ADMIN_PASS = '56780156Yura';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (username === ADMIN_USER && password === ADMIN_PASS) {
      const response = NextResponse.json({ success: true });
      
      response.cookies.set('admin_session', 'authenticated_yuransis', {
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
