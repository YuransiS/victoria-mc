import { NextResponse } from 'next/server';
import { getProgress, updateProgress, getProfile } from '@/app/minicourse/supabase';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { userId, lessonId, deadlineAt } = await req.json();

    if (!userId || !lessonId || !deadlineAt) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const lessonNum = Number(lessonId) as 1 | 2 | 3;
    if (lessonNum !== 1 && lessonNum !== 2 && lessonNum !== 3) {
      return NextResponse.json({ success: false, error: 'Invalid lesson ID' }, { status: 400 });
    }

    // 1. Calculate send time: 3 hours before deadline
    const deadlineMs = new Date(deadlineAt).getTime();
    const sendTimeMs = deadlineMs - 3 * 60 * 60 * 1000;
    
    // Ensure the message send time is in the future
    const nowMs = Date.now();
    const delaySec = Math.max(10, Math.floor((sendTimeMs - nowMs) / 1000));
    const notBeforeTimestamp = Math.floor(nowMs / 1000) + delaySec;

    // 2. Fetch student profile to verify and get Telegram chat ID
    const student = await getProfile(userId);
    if (!student) {
      return NextResponse.json({ success: false, error: 'Student profile not found' }, { status: 404 });
    }

    if (!student.telegram_chat_id) {
      return NextResponse.json({ success: false, error: 'Student has not linked Telegram chat ID' }, { status: 400 });
    }

    // 3. Fetch progress to see if there is an existing QStash message
    const progress = await getProgress(userId);
    if (progress && progress.lessons && progress.lessons[lessonNum]) {
      const lesson = progress.lessons[lessonNum];
      if (lesson.qstashMsgId) {
        // Delete previous task from QStash (Rescheduling logic)
        try {
          await qstashClient.messages.delete(lesson.qstashMsgId);
          console.log(`[QStash] Deleted old scheduled message ${lesson.qstashMsgId} for user ${userId}, lesson ${lessonNum}`);
        } catch (delErr) {
          console.warn(`[QStash] Failed to delete old message ${lesson.qstashMsgId}:`, delErr);
        }
      }
    }

    // 4. Construct callback URL
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'sofifinsight.vercel.app';
    const callbackUrl = `${protocol}://${host}/api/notifications/send`;

    // 5. Publish to QStash
    const publishRes = await qstashClient.publishJSON({
      url: callbackUrl,
      body: { userId, lessonId: lessonNum },
      notBefore: notBeforeTimestamp,
    });

    const messageId = publishRes.messageId;

    // 6. Update database with message tracking data
    await updateProgress(userId, lessonNum, {
      qstashMsgId: messageId,
      notificationStatus: 'pending'
    });

    return NextResponse.json({
      success: true,
      messageId,
      scheduledAt: new Date(notBeforeTimestamp * 1000).toISOString(),
      callbackUrl
    });
  } catch (error: any) {
    console.error('[Assign Homework Task Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
