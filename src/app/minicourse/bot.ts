import { supabase } from '@/app/minicourse/supabase';
import crypto from 'crypto';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

async function generateAutologinLink(chatId: number, targetPath: string): Promise<string> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
  
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
        let renderedText = dbTemplate.message_text;
        renderedText = renderedText.replace(/{name}/g, templateData.userName || 'Учасник');
        renderedText = renderedText.replace(/{lesson_id}/g, String(templateData.lessonId || ''));
        renderedText = renderedText.replace(/{lesson_title}/g, templateData.lessonTitle || '');
        renderedText = renderedText.replace(/{comment}/g, templateData.comment || '');

        text = renderedText;

        if (Array.isArray(dbTemplate.buttons) && dbTemplate.buttons.length > 0) {
          for (const btn of dbTemplate.buttons) {
            let btnUrl = btn.custom_url || '';
            let btnText = (btn.text || 'Перейти')
              .replace(/{lesson_id}/g, String(templateData.lessonId || ''))
              .replace(/{name}/g, templateData.userName || '');

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
    switch (messageType) {
      case 'hw_accepted':
        text = `🎉 *Домашнє завдання прийнято!*\n\nЧудові новини, ${templateData.userName || 'шановний ученю'}! Ваше завдання до Уроку ${templateData.lessonId || ''} успішно зараховано куратором.\n\n💬 *Коментар куратора:*\n"${templateData.comment || 'Чудова робота!'}"\n\n🔓 Вам відкрито доступ до наступного уроку! Продовжуйте рух до мети.`;
        break;

      case 'hw_needs_improvement':
        text = `⚠️ *Домашнє завдання потребує доопрацювання*\n\nВітаємо, ${templateData.userName || ''}. Куратор перевірив Ваше ДЗ до Уроку ${templateData.lessonId || ''} та залишив рекомендації для покращення.\n\n💬 *Що потрібно виправити:*\n"${templateData.comment || 'Будь ласка, перевірте розрахунки.'}"\n\n👉 Будь ласка, внесіть необхідні зміни та надішліть оновлене посилання в кабінеті курсу.`;
        break;

      case 'new_lesson_unlocked':
        text = `🔓 *Відкрито новий урок!*\n\nВам став доступний новий навчальний модуль:\n*Урок ${templateData.lessonId || ''}: ${templateData.lessonTitle || ''}*\n\nШвидше переглядайте відео та виконуйте практичні кроки! 🚀`;
        break;

      case 'payment_success':
        text = `🚀 *Оплату успішно підтверджено!*\n\nВітаємо на курсі, ${templateData.userName || ''}! 🎉 Ваш особистий кабінет активовано.\n\nЯ — Ваш особистий Telegram-помічник. Тут я буду надсилати Вам корисні нагадування, результати перевірки домашніх завдань та коментарі кураторів.\n\nЗверніть увагу!\n\nДоступ до курсу відкрито на 2 тижні. Перевірка зі зворотнім зв’язком від куратора доступна протягом 7 днів.\n\nТому не відкладайте перегляд уроків та починайте прямо зараз!\n\nДавайте розпочнемо навчання!`;
        break;

      case 'reminder':
        text = `⏳ *Час зробити наступний крок!*\n\nВітаємо, ${templateData.userName || ''}! Нагадуємо, що Урок ${templateData.lessonId || ''} вже чекає на Вас. Виділіть трохи часу сьогодні для навчання.\n\nУспіхів! 💪`;
        break;

      case 'hw_submitted':
        text = `📥 *Домашнє завдання надіслано на перевірку!*\n\nДякуємо, ${templateData.userName || 'шановний ученю'}! Ваше завдання до Уроку ${templateData.lessonId || ''} успішно отримано.\n\n⏳ Куратор вже взявся за перевірку. Щойно з'являться результати, я одразу Вам про це повідомлю!`;
        break;
        
      default:
        text = `Повідомлення від бота навчального курсу.`;
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
