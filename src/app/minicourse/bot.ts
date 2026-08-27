import { supabase } from '@/app/minicourse/supabase';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function generateAutologinLink(chatId: number, targetPath: string): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://victoria-mc.vercel.app';
  
  if (supabase) {
    try {
      const { data: user } = await supabase
        .from('minicourse_users')
        .select('id')
        .eq('telegram_chat_id', chatId)
        .maybeSingle();

      if (user) {
        const tokenUuid = crypto.randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

        const { error } = await supabase
          .from('minicourse_autologin_tokens')
          .insert({
            token: tokenUuid,
            user_id: user.id,
            expires_at: expiresAt,
            is_used: false
          });

        if (!error) {
          return `${siteUrl}/minicourse/login?token=${tokenUuid}&redirect=${encodeURIComponent(targetPath)}`;
        }
        console.error('[Bot Autologin Link] Failed to insert token:', error);
      }
    } catch (err) {
      console.error('[Bot Autologin Link] Error generating token link:', err);
    }
  }

  // Fallback to manual entry redirect if database fails
  return `${siteUrl}/minicourse/login?redirect=${encodeURIComponent(targetPath)}`;
}

export function interpolateTemplateVariables(
  text: string,
  data: {
    userName?: string;
    lessonId?: number;
    lessonTitle?: string;
    comment?: string;
  }
): string {
  if (!text) return '';
  const nameVal = data.userName || 'Учасник';
  const lessonIdVal = String(data.lessonId || '');
  const lessonTitleVal = data.lessonTitle || '';
  const commentVal = data.comment || '';

  return text
    .replace(/{userName}/g, nameVal)
    .replace(/{name}/g, nameVal)
    .replace(/{firstName}/g, nameVal)
    .replace(/{lessonId}/g, lessonIdVal)
    .replace(/{lesson_id}/g, lessonIdVal)
    .replace(/{lessonTitle}/g, lessonTitleVal)
    .replace(/{lesson_title}/g, lessonTitleVal)
    .replace(/{comment}/g, commentVal);
}

export async function sendTelegramNotification(
  chatId: number | null | undefined,
  messageType: 'hw_accepted' | 'hw_needs_improvement' | 'new_lesson_unlocked' | 'payment_success' | 'reminder' | 'hw_submitted' | string,
  templateData: {
    userName?: string;
    lessonId?: number;
    lessonTitle?: string;
    comment?: string;
    actionUrl?: string;
  }
): Promise<{ success: boolean; isPermanent?: boolean; errorCode?: number; description?: string }> {
  // If user hasn't linked their Telegram chat ID, skip notification silently
  if (!chatId) {
    console.log(`[Telegram Bot] Skipping notification of type ${messageType}: No chat_id linked.`);
    return { success: false, isPermanent: true, description: 'No chat_id linked' };
  }

  if (!BOT_TOKEN) {
    console.error('[Telegram Bot] Missing TELEGRAM_BOT_TOKEN environment variable.');
    return { success: false, isPermanent: false, description: 'Missing TELEGRAM_BOT_TOKEN' };
  }

  let text = '';
  let customButtons: any[] = [];
  let templateFound = false;

  // 1. Attempt to fetch configured template from database
  if (supabase) {
    try {
      const templateId = messageType === 'new_lesson_unlocked' && templateData.lessonId 
        ? `lesson_unlocked_${templateData.lessonId}`
        : messageType === 'payment_success' 
          ? 'welcome' 
          : messageType;

      const { data: dbTemplate } = await supabase
        .from('minicourse_bot_templates')
        .select('*')
        .eq('id', templateId)
        .maybeSingle();

      if (dbTemplate) {
        if (dbTemplate.is_enabled === false) {
          console.log(`[Telegram Bot] Template ${templateId} is disabled by admin. Skipping.`);
          return { success: true, description: 'Notification disabled' };
        }

        templateFound = true;
        text = interpolateTemplateVariables(dbTemplate.message_text, templateData);

        if (Array.isArray(dbTemplate.buttons) && dbTemplate.buttons.length > 0) {
          for (const btn of dbTemplate.buttons) {
            let btnUrl = btn.custom_url || '';
            let btnText = interpolateTemplateVariables(btn.text || 'Перейти', templateData);

            if (btn.url_type === 'autologin_lesson') {
              const target = templateData.lessonId ? `/minicourse/lessons/${templateData.lessonId}` : '/minicourse/lessons/1';
              btnUrl = await generateAutologinLink(chatId, target);
            } else if (btn.url_type === 'autologin_dashboard') {
              btnUrl = await generateAutologinLink(chatId, '/minicourse');
            }

            if (btnUrl) {
              customButtons.push([{ text: btnText, url: btnUrl }]);
            }
          }
        }
      }
    } catch (err) {
      console.error('[Telegram Bot] Error fetching template from DB:', err);
    }
  }

  // 2. Fallback to default message format if not customized in database
  if (!templateFound) {
    const userDisplayName = templateData.userName || 'Учасник';
    const currentLessonNum = templateData.lessonId || 1;
    const currentLessonName = templateData.lessonTitle || '';
    const curatorComment = templateData.comment || '';

    switch (messageType) {
      case 'payment_success':
        text = `🚀 Оплату успішно підтверджено!\n\nВітаємо на навчанні! 🎉 Твій особистий кабінет уже активовано.\n\nТут я буду нагадувати тобі про уроки, повідомляти про перевірку домашніх завдань та передавати коментарі куратора.\n\nНе відкладай навчання на потім. Починай прямо зараз 💛\n\nГотова? Поїхали!`;
        break;

      case 'hw_submitted':
        text = `📥 Домашнє завдання надіслано!\n\nДякуємо, ${userDisplayName}! Твоє завдання до Уроку ${currentLessonNum} успішно отримано 💛\n\n⏳ Куратор уже взяв його в роботу.\n\nЩойно з’явиться результат - одразу тобі повідомлю.\n\nА поки можеш рухатись далі та повертатись до своїх напрацювань ✨`;
        break;

      case 'hw_accepted':
        text = `🎉 Домашнє завдання прийнято!\n\nКласні новини, ${userDisplayName}! Твоє завдання до Уроку ${currentLessonNum} успішно зараховано 💛\n\n💬 Коментар куратора:\n"${curatorComment}"\n\n🔓 Наступний урок уже відкрито!\n\nНе зупиняйся — саме практика допомагає перетворити знання на результат.\n\nРухаємось далі 🚀`;
        break;

      case 'hw_needs_improvement':
        text = `⚠️ Тут потрібно трохи допрацювати\n\n${userDisplayName}, куратор перевірив твоє ДЗ до Уроку ${currentLessonNum} та залишив рекомендації.\n\n💬 Що варто виправити:\n"${curatorComment}"\n\nНе переживай — саме для цього й потрібна перевірка 💛\n\nВнеси зміни та надішли оновлене завдання на перевірку.`;
        break;

      case 'new_lesson_unlocked':
        text = `🔓 Новий урок уже відкрито!\n\nТобі доступний новий урок:\n*Урок ${currentLessonNum}: ${currentLessonName}*\n\nТут буде ще один крок до того, щоб вести блог системно, створювати сильніший контент і отримувати від нього результат.\n\nВмикай відео та переходь до практики 🚀`;
        break;

      case 'reminder':
        text = `⏳ ${userDisplayName}, час зробити наступний крок\n\nУрок ${currentLessonNum} вже чекає на тебе.\n\nВиділи сьогодні хоча б 20 хвилин, щоб переглянути урок і зробити практичне завдання.\n\nНе потрібно чекати ідеального моменту — просто відкрий урок і почни 💛\n\nУспіхів!`;
        break;
        
      default:
        text = `Повідомлення від бота курсу.`;
    }
  }

  // 3. Build reply markup keyboard
  let replyMarkup: any = undefined;
  if (customButtons.length > 0) {
    replyMarkup = { inline_keyboard: customButtons };
  } else {
    let targetPath = '/minicourse';
    if (messageType === 'new_lesson_unlocked' && templateData.lessonId) {
      targetPath = `/minicourse/lessons/${templateData.lessonId}`;
    } else if (messageType === 'hw_needs_improvement' && templateData.lessonId) {
      targetPath = `/minicourse/lessons/${templateData.lessonId}`;
    } else if (messageType === 'hw_accepted' && templateData.lessonId) {
      const nextL = templateData.lessonId + 1;
      targetPath = `/minicourse/lessons/${nextL}`;
    } else if (messageType === 'reminder' && templateData.lessonId) {
      targetPath = `/minicourse/lessons/${templateData.lessonId}`;
    } else if (messageType === 'hw_submitted' && templateData.lessonId) {
      targetPath = `/minicourse/lessons/${templateData.lessonId}`;
    } else if (messageType === 'payment_success') {
      targetPath = `/minicourse/lessons/1`;
    }

    const actionUrl = await generateAutologinLink(chatId, targetPath);
    replyMarkup = {
      inline_keyboard: [
        [
          {
            text: messageType === 'payment_success' ? '👉 Почати навчання' : '👉 Перейти до уроку',
            url: actionUrl
          }
        ]
      ]
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
        protect_content: true,
        reply_markup: replyMarkup
      })
    });

    const result = await response.json();
    if (!result.ok) {
      console.error('[Telegram Bot] Send message API returned error:', result);
      const isPermanent = result.error_code === 403 || result.error_code === 400;
      return {
        success: false,
        isPermanent,
        errorCode: result.error_code,
        description: result.description || 'Unknown Telegram error'
      };
    }

    console.log(`[Telegram Bot] Successfully sent notification of type ${messageType} to chat ID ${chatId}`);
    return { success: true };
  } catch (err: any) {
    console.error('[Telegram Bot] Network error sending notification:', err);
    return {
      success: false,
      isPermanent: false,
      description: err.message || 'Network error'
    };
  }
}
