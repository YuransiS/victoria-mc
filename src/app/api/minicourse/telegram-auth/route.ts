import { createHash, createHmac } from 'crypto';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ success: false, error: 'Telegram Bot Token is not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { hash, ...userData } = body;

    if (!hash) {
      return NextResponse.json({ success: false, error: 'Missing Telegram authentication hash' }, { status: 400 });
    }

    // 1. Generate check string from sorted key-value pairs
    const cleanUserData = Object.assign(Object.create(null), userData);
    const secret = createHash('sha256').update(BOT_TOKEN).digest();
    const checkString = Object.keys(cleanUserData)
      .sort()
      .map((key) => `${key}=${cleanUserData[key]}`)
      .join('\n');

    // 2. Perform HMAC-SHA256 signature verification
    const calculatedHash = createHmac('sha256', secret).update(checkString).digest('hex');

    if (calculatedHash !== hash) {
      return NextResponse.json({ success: false, error: 'Data integrity check failed. Signature mismatch.' }, { status: 401 });
    }

    // 3. Prevent replay attacks by checking auth date validity (e.g., within 24 hours)
    const authDate = Number(userData.auth_date);
    const now = Math.floor(Date.now() / 1000);
    if (isNaN(authDate) || now - authDate > 86400) {
      return NextResponse.json({ success: false, error: 'Authentication signature has expired. Please log in again.' }, { status: 401 });
    }

    const telegramUsername = (userData.username || '').trim().toLowerCase();
    const telegramChatId = Number(userData.id);

    if (!telegramUsername || isNaN(telegramChatId)) {
      return NextResponse.json({ success: false, error: 'Invalid user data provided by Telegram' }, { status: 400 });
    }

    // 4. Match student in database by telegram handle
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 500 });
    }

    // Fetch user profile matching telegram username (order by newest to handle multiple test entries)
    const { data: user, error: fetchErr } = await supabase
      .from('minicourse_users')
      .select('*')
      .ilike('telegram', telegramUsername)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (fetchErr) {
      console.error('Error fetching user on Telegram Auth:', fetchErr);
      return NextResponse.json({ success: false, error: 'Database error occurred' }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ 
        success: false, 
        error: 'Вхід заборонено. Користувача не знайдено. Будь ласка, спочатку зареєструйтесь та оплатіть курс на головній сторінці.' 
      }, { status: 404 });
    }

    // Access control: check if payment is confirmed
    if (user.role === 'student' && !user.is_paid) {
      return NextResponse.json({ 
        success: false, 
        error: 'Доступ обмежено. Оплата курсу ще не підтверджена.' 
      }, { status: 403 });
    }

    // Access control: check if user is blocked under investigation
    if (user.role === 'student' && user.status === 'under_investigation') {
      return NextResponse.json({ 
        success: false, 
        error: 'Доступ заблоковано через перевищення ліміту пристроїв. Зверніться до підтримки.' 
      }, { status: 403 });
    }

    // Access control: check 14-day limit
    if (user.role === 'student') {
      const accessStart = user.access_opened_at || user.created_at;
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays > 14) {
        return NextResponse.json({
          success: false,
          error: 'Термін дії Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).'
        }, { status: 403 });
      }
    }

    // 5. Update the telegram_chat_id column with authentic chat ID from widget
    const { error: updateErr } = await supabase
      .from('minicourse_users')
      .update({ telegram_chat_id: telegramChatId })
      .eq('id', user.id);

    if (updateErr) {
      console.error('Failed to link telegram_chat_id:', updateErr);
    }

    // Return profile & progress response to client
    const { data: progress } = await supabase
      .from('minicourse_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const loggedInUser = {
      ...user,
      telegram_chat_id: telegramChatId
    };

    return NextResponse.json({ 
      success: true, 
      user: loggedInUser,
      progress: progress ? {
        id: progress.id,
        userId: progress.user_id,
        progressPercent: progress.progress_percent,
        lessons: progress.lessons,
        updatedAt: progress.updated_at
      } : null
    });

  } catch (error: any) {
    console.error('Telegram Auth Route Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
