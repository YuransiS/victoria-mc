'use server';

import * as db from './supabase';
import { MinicourseUser, MinicourseProgress, HomeworkStatus, MinicoursePrizeCode } from './types';

export async function loginUser(telegramUsername: string, name?: string, deviceUuid?: string) {
  try {
    const result = await db.loginUser(telegramUsername, name, deviceUuid);
    return { success: true, user: result.user, progress: result.progress };
  } catch (err: any) {
    console.error("loginUser Server Action error:", err);
    return { success: false, error: err.message || "Не вдалося авторизуватися." };
  }
}

export async function getProfile(userId: string) {
  return db.getProfile(userId);
}

export async function getProgress(userId: string) {
  return db.getProgress(userId);
}

export async function updateProgress(userId: string, lessonId: 1 | 2 | 3, updates: any) {
  return db.updateProgress(userId, lessonId, updates);
}

export async function getLeaderboard(currentUserId?: string) {
  return db.getLeaderboard(currentUserId);
}

export async function syncProgressStates(userId: string, user?: MinicourseUser) {
  return db.syncProgressStates(userId, user);
}

export async function getLessonsConfig() {
  return db.getLessonsConfig();
}

export async function getAllStudentsWithProgress() {
  return db.getAllStudentsWithProgress();
}

export async function toggleUserLockout(userId: string, shouldBlock: boolean) {
  return db.toggleUserLockout(userId, shouldBlock);
}

export async function deleteStudentUser(userId: string) {
  return db.deleteStudentUser(userId);
}

export async function saveHomeworkReview(userId: string, lessonId: 1 | 2 | 3, status: HomeworkStatus, comment: string) {
  return db.saveHomeworkReview(userId, lessonId, status, comment);
}

export async function updateLessonConfig(lessonId: number, updates: any) {
  return db.updateLessonConfig(lessonId, updates);
}

export async function saveAllLessonsConfig(configs: any[]) {
  return db.saveAllLessonsConfig(configs);
}

export async function deleteLessonConfig(lessonId: number) {
  return db.deleteLessonConfig(lessonId);
}

export async function getAdminSubmissions() {
  return db.getAdminSubmissions();
}

export async function acceptTerms(userId: string) {
  return db.acceptTerms(userId);
}

export async function extendStudentAccess(
  userId: string,
  lessonsOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  homeworkOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  customLessonsDays?: number,
  customHomeworkDays?: number
) {
  try {
    return await db.extendStudentAccess(userId, lessonsOption, homeworkOption, customLessonsDays, customHomeworkDays);
  } catch (err: any) {
    console.error("extendStudentAccess action error:", err);
    throw new Error(err.message || "Не вдалося оновити доступ.");
  }
}

export async function createPrizeCode(description: string, createdBy: string) {
  try {
    return await db.createPrizeCode(description, createdBy);
  } catch (err: any) {
    console.error("createPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося створити посилання.");
  }
}

export async function getPrizeCodes() {
  try {
    return await db.getPrizeCodes();
  } catch (err: any) {
    console.error("getPrizeCodes action error:", err);
    throw new Error(err.message || "Не вдалося отримати посилання.");
  }
}

export async function cancelPrizeCode(code: string) {
  try {
    return await db.cancelPrizeCode(code);
  } catch (err: any) {
    console.error("cancelPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося скасувати посилання.");
  }
}

export async function claimPrizeCode(code: string, name: string, telegram: string, phone?: string) {
  try {
    return await db.claimPrizeCode(code, name, telegram, phone);
  } catch (err: any) {
    console.error("claimPrizeCode action error:", err);
    throw new Error(err.message || "Не вдалося активувати безкоштовний доступ.");
  }
}

export async function getGiftTokens() {
  return db.getGiftTokens();
}

export async function generateGiftToken() {
  return db.generateGiftToken();
}

export async function getBotTemplates() {
  return db.getBotTemplates();
}

export async function saveBotTemplate(template: any) {
  return db.saveBotTemplate(template);
}

export async function deleteBotTemplate(templateId: string) {
  return db.deleteBotTemplate(templateId);
}

export async function getBroadcasts() {
  return db.getBroadcasts();
}

export async function sendBotBroadcast(payload: {
  messageText: string;
  buttonText?: string;
  buttonUrl?: string;
  targetAudience?: string;
  createdBy?: string;
}) {
  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
  if (!BOT_TOKEN) {
    throw new Error("Telegram Bot Token не налаштовано в змінних середовища.");
  }

  // 1. Fetch target students with valid chat IDs
  let query = db.supabase!
    .from('victoria_mc_users')
    .select('id, name, telegram, telegram_chat_id, is_paid')
    .not('telegram_chat_id', 'is', null);

  if (payload.targetAudience === 'paid') {
    query = query.eq('is_paid', true);
  }

  const { data: users, error } = await query;
  if (error) throw error;

  const validUsers = (users || []).filter(u => u.telegram_chat_id);
  const total = validUsers.length;
  let sent = 0;
  let failed = 0;

  // Build inline keyboard if button provided
  let replyMarkup: any = undefined;
  if (payload.buttonText && payload.buttonUrl) {
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: payload.buttonText.trim(),
            url: payload.buttonUrl.trim()
          }
        ]
      ]
    };
  }

  // 2. Dispatch messages with slight spacing to respect Telegram API rate limits
  for (const user of validUsers) {
    try {
      // Personalize message if placeholder {name} exists
      const personalizedText = payload.messageText.replace(/{name}/g, user.name || 'Учасник');

      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegram_chat_id,
          text: personalizedText,
          parse_mode: 'Markdown',
          protect_content: true,
          ...(replyMarkup ? { reply_markup: replyMarkup } : {})
        })
      });

      const json = await res.json();
      if (json.ok) {
        sent++;
      } else {
        console.error(`Failed to send broadcast to user ${user.id} (${user.telegram_chat_id}):`, json);
        failed++;
      }
    } catch (err) {
      console.error(`Error broadcasting to user ${user.id}:`, err);
      failed++;
    }
  }

  // 3. Save broadcast record
  await db.saveBroadcastRecord({
    message_text: payload.messageText,
    button_text: payload.buttonText,
    button_url: payload.buttonUrl,
    target_audience: payload.targetAudience || 'all',
    total_recipients: total,
    sent_count: sent,
    failed_count: failed,
    status: failed === total && total > 0 ? 'failed' : 'completed',
    created_by: payload.createdBy || 'admin'
  });

  return { total, sent, failed };
}

export async function getBotConfig() {
  return db.getBotConfig();
}

export async function connectTelegramBot(botToken: string) {
  const token = botToken.trim();
  if (!token) {
    throw new Error('Введіть токен Telegram бота.');
  }

  // 1. Validate token with Telegram getMe API
  const getMeRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const getMeData = await getMeRes.json();

  if (!getMeData.ok || !getMeData.result) {
    throw new Error('Недійсний токен Telegram бота. Перевірте ключ, отриманий від @BotFather.');
  }

  const botInfo = getMeData.result;
  const botId = botInfo.id;
  const botUsername = botInfo.username;
  const botName = botInfo.first_name || 'Victoria Course Bot';

  // 2. Fetch Bot Profile Photo if available
  let botPhotoUrl: string | undefined = undefined;
  try {
    const photosRes = await fetch(`https://api.telegram.org/bot${token}/getUserProfilePhotos?user_id=${botId}&limit=1`);
    const photosData = await photosRes.json();
    if (photosData.ok && photosData.result && photosData.result.photos && photosData.result.photos.length > 0) {
      const photoSizes = photosData.result.photos[0];
      const largestPhoto = photoSizes[photoSizes.length - 1];
      if (largestPhoto && largestPhoto.file_id) {
        const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${largestPhoto.file_id}`);
        const fileData = await fileRes.json();
        if (fileData.ok && fileData.result && fileData.result.file_path) {
          botPhotoUrl = `https://api.telegram.org/file/bot${token}/${fileData.result.file_path}`;
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch bot profile photo:', err);
  }

  // 3. Setup Webhook URL
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://victoria-mc.vercel.app';
  const webhookUrl = `${siteUrl}/api/bot/webhook`;

  try {
    const setWebhookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}&drop_pending_updates=false`);
    const setWebhookData = await setWebhookRes.json();
    if (!setWebhookData.ok) {
      console.warn('Telegram setWebhook returned warning:', setWebhookData);
    }
  } catch (err) {
    console.error('Error setting webhook:', err);
  }

  // 4. Save to Database
  const saved = await db.saveBotConfig({
    bot_token: token,
    bot_username: botUsername,
    bot_name: botName,
    bot_photo_url: botPhotoUrl,
    webhook_url: webhookUrl,
    is_connected: true
  });

  return { success: true, bot: saved };
}

export async function disconnectTelegramBot() {
  const current = await db.getBotConfig();
  if (current.bot_token) {
    try {
      await fetch(`https://api.telegram.org/bot${current.bot_token}/deleteWebhook`);
    } catch (err) {
      console.error('Error deleting webhook:', err);
    }
  }

  const updated = await db.saveBotConfig({
    bot_token: undefined,
    bot_username: undefined,
    bot_name: undefined,
    bot_photo_url: undefined,
    webhook_url: undefined,
    is_connected: false
  });

  return { success: true, bot: updated };
}

export type { AdminSubmissionItem, GiftTokenItem } from './supabase';



