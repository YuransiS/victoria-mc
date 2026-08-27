import { NextResponse } from 'next/server';
import { supabase } from '@/app/minicourse/supabase';
import { normalizePhone, normalizeEmail, normalizeTelegram } from '@/utils/normalization';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

function extractToken(text: string): { type: 'pay' | 'gift' | 'prize' | 'none'; token: string } {
  const cleanText = text.trim();
  
  let param = cleanText;
  if (cleanText.toLowerCase().startsWith('/start')) {
    param = cleanText.replace(/^\/start[=\s_]*/i, '').trim();
  } else if (cleanText.toLowerCase().includes('start=')) {
    const match = cleanText.match(/start=([^&\s]+)/i);
    if (match) param = match[1].trim();
  }

  if (!param) return { type: 'none', token: '' };

  // Pay Token
  if (param.toLowerCase().startsWith('pay_')) {
    return { type: 'pay', token: param.substring(4).trim() };
  }

  // Gift Token
  if (param.toLowerCase().startsWith('gift_')) {
    return { type: 'gift', token: param.substring(5).trim() };
  }
  if (/^GIFT-[A-Z0-9]+$/i.test(param)) {
    return { type: 'gift', token: param.trim() };
  }
  if (param.toLowerCase().startsWith('gift')) {
    return { type: 'gift', token: param.replace(/^gift[-_]?/i, '').trim() };
  }

  // Prize Code
  if (/^prize[-_]/i.test(param)) {
    return { type: 'prize', token: param.trim() };
  }

  return { type: 'none', token: '' };
}

export async function POST(req: Request) {
  try {
    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Telegram Bot Token is not configured' }, { status: 500 });
    }

    const payload = await req.json();

    // Check if this is a standard text message
    if (!payload.message || !payload.message.text) {
      return NextResponse.json({ ok: true });
    }

    const chatId = payload.message.chat.id;
    const text = payload.message.text.trim();
    const rawUsername = payload.message.from.username || '';
    const username = normalizeTelegram(rawUsername);
    const firstName = payload.message.from.first_name || 'Учасник';

    const { type: tokenType, token: rawToken } = extractToken(text);

    if (tokenType !== 'none' && rawToken && supabase) {
      let user = null;

      if (tokenType === 'pay') {
        let phoneToMatch: string | null = null;
        let leadName = 'Учасник';

        const isPhone = /^\d+$/.test(rawToken);
        if (isPhone) {
          phoneToMatch = rawToken;
        } else {
          const { data: leadData } = await supabase
            .from('leads')
            .select('*')
            .eq('order_id', rawToken)
            .maybeSingle();

          if (leadData) {
            phoneToMatch = leadData.phone;
            leadName = leadData.name || 'Учасник';
          }
        }

        if (phoneToMatch) {
          const phoneNorm = normalizePhone(phoneToMatch);
          const digitsOnly = phoneNorm.replace(/\D/g, '');
          const { data: existingUser } = await supabase
            .from('victoria_mc_minicourse_users')
            .select('*')
            .or(`phone.eq.${digitsOnly},phone.eq.${phoneNorm}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .update({
                telegram: username || existingUser.telegram,
                telegram_chat_id: chatId,
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: existingUser.access_opened_at || new Date().toISOString()
              })
              .eq('id', existingUser.id)
              .select()
              .single();
            
            user = updatedUser;
          } else {
            const { data: newUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .insert({
                name: leadName,
                email: `${digitsOnly || Math.random().toString(36).substr(2, 9)}@economica.edu`,
                phone: phoneNorm,
                role: 'student',
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: new Date().toISOString(),
                telegram: username || null,
                telegram_chat_id: chatId,
                status: 'active'
              })
              .select()
              .single();
            
            user = newUser;
          }
        }
      } else if (tokenType === 'gift') {
        const upperToken = rawToken.toUpperCase();
        const normalizedToken = upperToken.startsWith('GIFT-') ? upperToken : `GIFT-${upperToken}`;

        // 1. Fetch gift token flexible search
        const { data: giftTokenData, error: giftTokenErr } = await supabase
          .from('victoria_mc_minicourse_gift_tokens')
          .select('*')
          .or(`token.eq.${normalizedToken},token.ilike.${rawToken}`)
          .limit(1)
          .maybeSingle();

        if (giftTokenErr) {
          console.error('[Bot Webhook] Error fetching gift token:', giftTokenErr);
        }

        if (giftTokenData) {
          if (giftTokenData.is_used) {
            const alreadyUsedText = `⚠️ Цей подарунковий код уже використаний.\n\nКожен код можна активувати лише один раз.\n\nЯкщо виникли запитання або щось не працює — напиши в підтримку: @YuransiS`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: alreadyUsedText,
                parse_mode: 'Markdown',
                protect_content: true
              })
            });
            return NextResponse.json({ ok: true });
          }

          // Burn the token immediately
          await supabase
            .from('victoria_mc_minicourse_gift_tokens')
            .update({
              is_used: true,
              used_by_chat_id: chatId,
              used_at: new Date().toISOString()
            })
            .eq('token', giftTokenData.token);

          // Find or create user
          let existingUser = null;
          if (username) {
            const { data } = await supabase
              .from('victoria_mc_minicourse_users')
              .select('*')
              .ilike('telegram', username)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (!existingUser) {
            const { data } = await supabase
              .from('victoria_mc_minicourse_users')
              .select('*')
              .eq('telegram_chat_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .update({
                telegram: username || existingUser.telegram,
                telegram_chat_id: chatId,
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: existingUser.access_opened_at || new Date().toISOString()
              })
              .eq('id', existingUser.id)
              .select()
              .single();
            user = updatedUser;
          } else {
            const emailPlaceholder = `${username || `gift_user_${Math.floor(Math.random() * 10000)}`}@victoria.mc`;
            const { data: newUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .insert({
                name: firstName || 'Учасник',
                email: emailPlaceholder,
                role: 'student',
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: new Date().toISOString(),
                telegram: username || null,
                telegram_chat_id: chatId,
                status: 'active'
              })
              .select()
              .single();
            user = newUser;
          }
        } else {
          const invalidTokenText = `⚠️ Схоже, код не працює.\n\nПеревір, чи правильно введений код або чи відкрила ти правильне посилання.\n\nЯкщо виникли запитання — напиши в підтримку: @YuransiS`;
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: invalidTokenText,
              parse_mode: 'Markdown',
              protect_content: true
            })
          });
          return NextResponse.json({ ok: true });
        }
      } else if (tokenType === 'prize') {
        const lowerCode = rawToken.toLowerCase().trim();
        const { data: prizeData } = await supabase
          .from('victoria_mc_minicourse_prize_codes')
          .select('*')
          .eq('code', lowerCode)
          .maybeSingle();

        if (prizeData && prizeData.status === 'active') {
          let existingUser = null;
          if (username) {
            const { data } = await supabase
              .from('victoria_mc_minicourse_users')
              .select('*')
              .ilike('telegram', username)
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .update({
                telegram_chat_id: chatId,
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: existingUser.access_opened_at || new Date().toISOString()
              })
              .eq('id', existingUser.id)
              .select()
              .single();
            user = updatedUser;
          } else {
            const { data: newUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .insert({
                name: firstName || 'Учасник',
                email: `${username || `prize_${Math.floor(Math.random() * 10000)}`}@victoria.mc`,
                role: 'student',
                is_paid: true,
                payment_status: 'paid',
                access_opened_at: new Date().toISOString(),
                telegram: username || null,
                telegram_chat_id: chatId,
                status: 'active'
              })
              .select()
              .single();
            user = newUser;
          }

          await supabase
            .from('victoria_mc_minicourse_prize_codes')
            .update({
              status: 'used',
              used_at: new Date().toISOString(),
              used_by_id: user.id
            })
            .eq('code', lowerCode);
        }
      }

      if (user) {
        const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://victoria-mc.vercel.app';
        const autologinUrl = `${siteUrl}/minicourse/login?tg_id=${chatId}&redirect=${encodeURIComponent('/minicourse/lessons/1')}`;

        if (tokenType === 'gift' || tokenType === 'prize') {
          // Message 7.1
          const msg1Text = `🎁 Вітаємо! Твій доступ до міні-курсу активовано! 🎉\n\n${firstName}, тепер ти можеш розпочати навчання та розібратися, як працювати з блогом і контентом системно.\n\nТут ти отримуватимеш нагадування про уроки, результати перевірки домашніх завдань та коментарі куратора.\n\n👉 Починай навчання за кнопкою нижче:`;
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: msg1Text,
              protect_content: true,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '👉 Почати навчання (Урок 1)',
                      url: autologinUrl
                    }
                  ]
                ]
              }
            })
          });

          // Message 7.2
          const msg2Text = `Доступ до міні-курсу вже відкрито, тому не гай часу\n\nНе відкладай навчання - краще почати зараз, поки є мотивація та час 💛`;
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: msg2Text,
              protect_content: true
            })
          });
        } else {
          // Standard payment activation
          const welcomePayText = `🚀 Оплату успішно підтверджено!\n\nВітаємо на навчанні! 🎉 Твій особистий кабінет уже активовано.\n\nТут я буду нагадувати тобі про уроки, повідомляти про перевірку домашніх завдань та передавати коментарі куратора.\n\nНе відкладай навчання на потім. Починай прямо зараз 💛\n\nГотова? Поїхали!`;
          
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomePayText,
              protect_content: true,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '👉 Почати навчання (Урок 1)',
                      url: autologinUrl
                    }
                  ]
                ]
              }
            })
          });
        }

        return NextResponse.json({ ok: true });
      }
    }

    // Default fallback when user sends plain /start or any other text
    if (supabase) {
      try {
        let linkedUser = null;
        const { data: byChatId } = await supabase
          .from('victoria_mc_minicourse_users')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (byChatId) {
          linkedUser = byChatId;
        } else if (username) {
          const { data: byUsername } = await supabase
            .from('victoria_mc_minicourse_users')
            .select('*')
            .ilike('telegram', username)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (byUsername) {
            const { data: updatedUser } = await supabase
              .from('victoria_mc_minicourse_users')
              .update({ telegram_chat_id: chatId })
              .eq('id', byUsername.id)
              .select()
              .single();
            
            linkedUser = updatedUser;
          }
        }

        if (linkedUser) {
          if (linkedUser.role === 'student' && !linkedUser.is_paid) {
            // Scenario 10: Unpaid user
            const unpaidText = `⚠️ Оплата ще не підтверджена.\n\n${firstName}, схоже, оплату за участь у навчанні ще не завершено.\n\nБудь ласка, заверши оплату на сайті, щоб отримати доступ до уроків.\n\nЯкщо в тебе є подарунковий код — просто надішли його сюди, наприклад: GIFT-XXXXXX.`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: unpaidText,
                protect_content: true
              })
            });
            return NextResponse.json({ ok: true });
          }

          // Scenario 11: Welcome back active student
          const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://victoria-mc.vercel.app';
          const autologinUrl = `${siteUrl}/minicourse/login?tg_id=${chatId}&redirect=${encodeURIComponent('/minicourse')}`;

          const welcomeBackText = `З поверненням, ${firstName}! 👋\n\nРада бачити тебе знову 💛\n\nТи можеш продовжити навчання в особистому кабінеті за кнопкою нижче.\n\nУсі твої уроки та напрацювання вже чекають на тебе 👇`;
          await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: welcomeBackText,
              protect_content: true,
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: '🌐 Увійти в кабінет',
                      url: autologinUrl
                    }
                  ]
                ]
              }
            })
          });
          return NextResponse.json({ ok: true });
        }
      } catch (err) {
        console.error('[Bot Webhook] Error looking up linked user on fallback:', err);
      }
    }

    // Scenario 12: Default welcome fallback if user not found in DB (Guest screen)
    const defaultWelcome = `Привіт, ${firstName}! 👋\n\nЯ твій персональний помічник у навчанні Віки про блог та контент.\n\n🎁 Якщо в тебе є подарунковий код або посилання (наприклад: \`GIFT-...\` або \`prize-...\`), надішли його сюди — бот автоматично активує твій доступ.\n\nАбо відкрий особистий кабінет за кнопкою нижче 👇`;
    const siteUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || 'https://victoria-mc.vercel.app';
    
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: defaultWelcome,
        parse_mode: 'Markdown',
        protect_content: true,
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: '🌐 Відкрити кабінет',
                url: `${siteUrl}/minicourse/login?tg_id=${chatId}`
              }
            ]
          ]
        }
      })
    });

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Bot Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
