import { NextResponse } from 'next/server';
import { getProgress, updateProgress } from '@/app/minicourse/supabase';
import { Client } from '@upstash/qstash';

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN || '',
});

export async function POST(req: Request) {
  try {
    const { userId, lessonId } = await req.json();

    if (!userId || !lessonId) {
      return NextResponse.json({ success: false, error: 'Missing required parameters' }, { status: 400 });
    }

    const lessonNum = Number(lessonId) as 1 | 2 | 3;
    if (lessonNum !== 1 && lessonNum !== 2 && lessonNum !== 3) {
      return NextResponse.json({ success: false, error: 'Invalid lesson ID' }, { status: 400 });
    }

    // 1. Fetch current progress
    const progress = await getProgress(userId);
    if (!progress || !progress.lessons || !progress.lessons[lessonNum]) {
      return NextResponse.json({ success: false, error: 'Student progression record not found' }, { status: 404 });
    }

    const lesson = progress.lessons[lessonNum];
    const qstashMsgId = lesson.qstashMsgId;

    // 2. If it exists in QStash, delete it
    if (qstashMsgId) {
      try {
        await qstashClient.messages.delete(qstashMsgId);
        console.log(`[QStash] Successfully cancelled and deleted reminder ${qstashMsgId} for user ${userId}, lesson ${lessonNum}`);
      } catch (delErr) {
        console.warn(`[QStash] Failed to delete message ${qstashMsgId} from queue (it may have already fired):`, delErr);
      }
    }

    // 3. Update database state to cancelled
    await updateProgress(userId, lessonNum, {
      qstashMsgId: null,
      notificationStatus: 'cancelled'
    });

    return NextResponse.json({
      success: true,
      message: 'Reminder cancelled successfully',
      qstashMsgId
    });
  } catch (error: any) {
    console.error('[Cancel Homework Task Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
