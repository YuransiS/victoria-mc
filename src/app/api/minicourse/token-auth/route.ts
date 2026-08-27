import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, tgId, deviceUuid } = body;

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database service unavailable' }, { status: 500 });
    }

    let user = null;
    let userId = null;

    if (token) {
      // 1. Fetch the token from database, ensuring it is unused and not expired
      const { data: tokenData, error: tokenErr } = await supabase
        .from('victoria_mc_autologin_tokens')
        .select('*')
        .eq('token', token)
        .eq('is_used', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (tokenErr) {
        console.error('Error fetching autologin token:', tokenErr);
        return NextResponse.json({ success: false, error: 'Помилка бази даних при перевірці токену' }, { status: 500 });
      }

      if (!tokenData) {
        return NextResponse.json({ 
          success: false, 
          error: 'expired_or_invalid',
          message: 'Посилання для авто-входу недійсне або вже було використане. Будь ласка, перейдіть за свіжим посиланням з бота.' 
        }, { status: 400 });
      }

      // 2. Mark token as used immediately to prevent replay attacks / link sharing
      const { error: updateTokenErr } = await supabase
        .from('victoria_mc_autologin_tokens')
        .update({ is_used: true })
        .eq('token', token);

      if (updateTokenErr) {
        console.error('Failed to mark autologin token as used:', updateTokenErr);
      }

      userId = tokenData.user_id;
    } else if (tgId) {
      const isNumeric = /^\d+$/.test(tgId.toString().trim());
      let query = supabase.from('victoria_mc_users').select('*');

      if (isNumeric) {
        query = query.eq('telegram_chat_id', Number(tgId));
      } else {
        const cleanTg = tgId.toString().trim().replace(/^@/, '');
        query = query.ilike('telegram', cleanTg);
      }

      // Look up user (order by newest to handle multiple test entries)
      const { data: tgUser, error: tgUserErr } = await query
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (tgUserErr) {
        console.error('Error fetching user by tgId:', tgUserErr);
        return NextResponse.json({ success: false, error: 'Помилка бази даних при отриманні профілю' }, { status: 500 });
      }

      if (!tgUser) {
        return NextResponse.json({ success: false, error: 'unpaid', message: 'Користувача не знайдено' }, { status: 403 });
      }

      user = tgUser;
      userId = tgUser.id;
    } else {
      return NextResponse.json({ success: false, error: 'Токен або Telegram ID відсутній' }, { status: 400 });
    }

    if (!user && userId) {
      // 3. Fetch user details
      const { data: dbUser, error: userErr } = await supabase
        .from('victoria_mc_users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userErr) {
        console.error('Error fetching user profile:', userErr);
        return NextResponse.json({ success: false, error: 'Помилка бази даних при отриманні профілю' }, { status: 500 });
      }

      user = dbUser;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: 'Користувача не знайдено' }, { status: 404 });
    }

    // 4. Access control and checks for students
    if (user.role === 'student') {
      if (!user.is_paid) {
        return NextResponse.json({ 
          success: false, 
          error: 'Практикум ще не сплачено. Оплатіть участь на головній сторінці для отримання доступу.' 
        }, { status: 403 });
      }

      if (user.status === 'under_investigation') {
        return NextResponse.json({ 
          success: false, 
          error: 'Доступ заблоковано. Зафіксовано вхід з великої кількості пристроїв. Будь ласка, зверніться в підтримку.' 
        }, { status: 403 });
      }

      // Check 14-day total access limit
      const accessStart = user.access_opened_at || user.created_at;
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays > 14) {
        return NextResponse.json({ 
          success: false, 
          error: 'access_expired',
          message: 'Термін дії Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).' 
        }, { status: 403 });
      }

      // Check and update Device UUID (limit to 4 devices)
      if (deviceUuid) {
        const uuids: string[] = user.device_uuids || [];
        if (!uuids.includes(deviceUuid)) {
          const newUuids = [...uuids, deviceUuid];
          if (uuids.length >= 4) {
            // Block user immediately
            const { error: blockErr } = await supabase
              .from('victoria_mc_users')
              .update({
                status: 'under_investigation',
                device_uuids: newUuids
              })
              .eq('id', user.id);
            
            if (blockErr) console.error('Failed to block user due to device limit:', blockErr);
            
            return NextResponse.json({ 
              success: false, 
              error: 'Доступ заблоковано. Зафіксовано вхід з 5 унікальних пристроїв. Зверніться до підтримки.' 
            }, { status: 403 });
          } else {
            // Update device list
            const { error: updateDevicesErr } = await supabase
              .from('victoria_mc_users')
              .update({ device_uuids: newUuids })
              .eq('id', user.id);
            
            if (updateDevicesErr) {
              console.error('Failed to update student device UUIDs:', updateDevicesErr);
            }
            user.device_uuids = newUuids;
          }
        }
      }
    }

    // 5. Fetch or create progress record
    let { data: progress, error: progErr } = await supabase
      .from('victoria_mc_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (progErr) {
      console.error('Error fetching progress:', progErr);
    }

    if (!progress) {
      const defaultLessons = {
        1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
        2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
        3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
      };

      const { data: newProg, error: createProgErr } = await supabase
        .from('victoria_mc_progress')
        .insert({
          user_id: user.id,
          progress_percent: 0,
          lessons: defaultLessons
        })
        .select()
        .single();
      
      if (createProgErr) {
        console.error('Error creating default progress:', createProgErr);
      } else {
        progress = newProg;
      }
    }

    // 6. Return profile & progress
    return NextResponse.json({
      success: true,
      user,
      progress: progress ? {
        id: progress.id,
        userId: progress.user_id,
        progressPercent: progress.progress_percent,
        lessons: progress.lessons,
        updatedAt: progress.updated_at
      } : null
    });

  } catch (error: any) {
    console.error('Token Auth Route Error:', error);
    return NextResponse.json({ success: false, error: 'Помилка сервера при авторизації' }, { status: 500 });
  }
}
