import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';
import { sendTelegramNotification } from '@/app/minicourse/bot';
import { LessonProgress } from '@/app/minicourse/types';

export async function GET(req: Request) {
  return handleReminders(req);
}

export async function POST(req: Request) {
  return handleReminders(req);
}

async function handleReminders(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const customHeader = req.headers.get('x-cron-secret');
    const { searchParams } = new URL(req.url);
    const querySecret = searchParams.get('secret');
    const cronSecret = process.env.CRON_SECRET;
    const isDev = process.env.NODE_ENV === 'development';

    if (cronSecret) {
      const isHeaderValid = authHeader === `Bearer ${cronSecret}` || authHeader === cronSecret;
      const isCustomValid = customHeader === cronSecret;
      const isQueryValid = querySecret === cronSecret;
      if (!isHeaderValid && !isCustomValid && !isQueryValid && !isDev) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Supabase client is not initialized' }, { status: 500 });
    }

    // 1. Fetch all student profiles
    const { data: users, error: userErr } = await supabase
      .from('victoria_mc_users')
      .select('*')
      .eq('role', 'student');

    if (userErr) {
      return NextResponse.json({ success: false, error: userErr.message }, { status: 500 });
    }

    if (!users || users.length === 0) {
      return NextResponse.json({ success: true, message: 'No students found', remindersSent: [] });
    }

    // 2. Filter students who are active, paid, and within the 14-day limit
    const activeStudents = users.filter(user => {
      const isPaid = user.is_paid || user.payment_status === 'paid';
      const isActive = user.status === 'active';
      if (!isPaid || !isActive) return false;

      const accessStart = user.access_opened_at || user.created_at;
      if (!accessStart) return false;
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      return elapsedDays <= 14;
    });

    if (activeStudents.length === 0) {
      return NextResponse.json({ success: true, message: 'No active paid students within 14-day limit', remindersSent: [] });
    }

    const studentIds = activeStudents.map(u => u.id);

    // 3. Fetch progress records for active students
    const { data: progressRecords, error: progErr } = await supabase
      .from('victoria_mc_progress')
      .select('*')
      .in('user_id', studentIds);

    if (progErr) {
      return NextResponse.json({ success: false, error: progErr.message }, { status: 500 });
    }

    const remindersSent: Array<{ userId: string; userName: string; lessonId: number }> = [];

    // 4. Check homework statuses and send reminders
    for (const student of activeStudents) {
      const progress = progressRecords?.find(p => p.user_id === student.id);
      if (!progress || !progress.lessons) continue;

      const updatedLessons = { ...progress.lessons };
      let hasUpdates = false;

      for (const lessonIdStr of ['1', '2', '3']) {
        const lessonId = Number(lessonIdStr) as 1 | 2 | 3;
        const lessonProgress = progress.lessons[lessonIdStr] as LessonProgress | undefined;

        if (
          lessonProgress &&
          lessonProgress.unlocked &&
          lessonProgress.openedAt &&
          !lessonProgress.hwSubmitted &&
          lessonProgress.hwStatus !== 'accepted' &&
          lessonProgress.hwStatus !== 'pending' &&
          !lessonProgress.reminderSent
        ) {
          const openedTime = new Date(lessonProgress.openedAt).getTime();
          const elapsedHours = (Date.now() - openedTime) / (1000 * 60 * 60);

          // Send reminder if user opened the lesson >= 18 hours ago
          if (elapsedHours >= 18) {
            if (student.telegram_chat_id) {
              const res = await sendTelegramNotification(
                student.telegram_chat_id,
                'reminder',
                {
                  userName: student.name,
                  lessonId: lessonId
                }
              );

              if (res.success) {
                updatedLessons[lessonIdStr] = {
                  ...lessonProgress,
                  reminderSent: true
                };
                hasUpdates = true;
                remindersSent.push({
                  userId: student.id,
                  userName: student.name,
                  lessonId: lessonId
                });
              }
            }
          }
        }
      }

      // 5. Update database if reminders were successfully triggered and marked
      if (hasUpdates) {
        await supabase
          .from('victoria_mc_progress')
          .update({
            lessons: updatedLessons,
            updated_at: new Date().toISOString()
          })
          .eq('id', progress.id);
      }
    }

    return NextResponse.json({
      success: true,
      remindersSentCount: remindersSent.length,
      remindersSent
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
