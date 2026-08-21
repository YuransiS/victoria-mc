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
            .from('minicourse_users')
            .select('*')
            .or(`phone.eq.${digitsOnly},phone.eq.${phoneNorm}`)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('minicourse_users')
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
              .from('minicourse_users')
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
          .from('minicourse_gift_tokens')
          .select('*')
          .or(`token.eq.${normalizedToken},token.ilike.${rawToken}`)
          .limit(1)
          .maybeSingle();

        if (giftTokenErr) {
          console.error('[Bot Webhook] Error fetching gift token:', giftTokenErr);
        }

        if (giftTokenData) {
          if (giftTokenData.is_used) {
            const alreadyUsedText = `⚠️ *Цей подарунковий код уже був використаний.*\n\nКожен подарунковий код можна активувати лише один раз. Якщо у Вас виникли запитання, зверніться в підтримку: @YuransiS`;
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
            .from('minicourse_gift_tokens')
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
              .from('minicourse_users')
              .select('*')
              .ilike('telegram', username)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (!existingUser) {
            const { data } = await supabase
              .from('minicourse_users')
              .select('*')
              .eq('telegram_chat_id', chatId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('minicourse_users')
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
            const emailPlaceholder = `${username || `gift_user_${Math.floor(Math.random() * 10000)}`}@economica.edu`;
            const { data: newUser } = await supabase
              .from('minicourse_users')
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
          const invalidTokenText = `⚠️ *Невірний подарунковий код.*\n\nБудь ласка, переконайтеся, що Ви перейшли за коректним посиланням або ввели правильний код. Якщо виникли запитання, зверніться в підтримку: @YuransiS`;
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
          .from('minicourse_prize_codes')
          .select('*')
          .eq('code', lowerCode)
          .maybeSingle();

        if (prizeData && prizeData.status === 'active') {
          let existingUser = null;
          if (username) {
            const { data } = await supabase
              .from('minicourse_users')
              .select('*')
              .ilike('telegram', username)
              .limit(1)
              .maybeSingle();
            existingUser = data;
          }

          if (existingUser) {
            const { data: updatedUser } = await supabase
              .from('minicourse_users')
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
              .from('minicourse_users')
              .insert({
                name: firstName || 'Учасник',
                email: `${username || `prize_${Math.floor(Math.random() * 10000)}`}@economica.edu`,
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
            .from('minicourse_prize_codes')
            .update({
              status: 'used',
              used_at: new Date().toISOString(),
              used_by_id: user.id
            })
            .eq('code', lowerCode);
        }
      }

      if (user) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
        const autologinUrl = `${siteUrl}/minicourse/login?tg_id=${chatId}&redirect=${encodeURIComponent('/minicourse/lessons/1')}`;

        const welcomeText = tokenType === 'gift' || tokenType === 'prize'
          ? `🎁 **Вітаємо! Вам активовано подарунковий доступ до міні-курсу!** 🎉\n\nВітаємо на курсі Софії, ${firstName}! Вашу участь успішно активовано за подарунковим доступом.\n\nЯ — Ваш особистий Telegram-помічник, де Ви будете отримувати нагадування та результати перевірки домашніх завдань.\n\n👉 Почніть навчання за кнопкою нижче:`
          : `Дякуємо за купівлю! 🎉\n\nВітаємо на курсі, ${firstName}! Ваш доступ до кабінету міні-курсу успішно активовано. Я — Ваш особистий Telegram-помічник, де Ви будете отримувати нагадування та результати перевірки домашніх завдань.\n\n👉 Почніть навчання за кнопкою нижче:`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'Markdown',
            protect_content: true,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: tokenType === 'gift' || tokenType === 'prize' ? '🎁 Почати навчання (Урок 1)' : '👉 Почати навчання (Урок 1)',
                    url: autologinUrl
                  }
                ]
              ]
            }
          })
        });

        const warningText = `⚠️ *Зверніть увагу!*\n\nДоступ до міні-курсу відкрито на 2 тижні. Перевірка зі зворотнім зв’язком від куратора доступна протягом 7 днів.\n\nТому не відкладайте перегляд уроків та починайте прямо зараз!`;
        
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: warningText,
            parse_mode: 'Markdown',
            protect_content: true
          })
        });

        return NextResponse.json({ ok: true });
      }
    }

    // Default fallback when user sends plain /start or any other text
    if (supabase) {
      try {
        let linkedUser = null;
        const { data: byChatId } = await supabase
          .from('minicourse_users')
          .select('*')
          .eq('telegram_chat_id', chatId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (byChatId) {
          linkedUser = byChatId;
        } else if (username) {
          const { data: byUsername } = await supabase
            .from('minicourse_users')
            .select('*')
            .ilike('telegram', username)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (byUsername) {
            const { data: updatedUser } = await supabase
              .from('minicourse_users')
              .update({ telegram_chat_id: chatId })
              .eq('id', byUsername.id)
              .select()
              .single();
            
            linkedUser = updatedUser;
          }
        }

        if (linkedUser) {
          if (linkedUser.role === 'student' && !linkedUser.is_paid) {
            const unpaidText = `⚠️ *Оплата не підтверджена.*\n\nШановний(а) ${firstName}, оплату за Вашою участю в практикумі ще не підтверджено. Будь ласка, завершіть оплату на нашому сайті.\n\nЯкщо у Вас є подарунковий код, просто надішліть його сюди (наприклад: GIFT-XXXXXX).`;
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                text: unpaidText,
                parse_mode: 'Markdown',
                protect_content: true
              })
            });
            return NextResponse.json({ ok: true });
          }

          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
          const autologinUrl = `${siteUrl}/minicourse/login?tg_id=${chatId}&redirect=${encodeURIComponent('/minicourse')}`;

          const welcomeBackText = `Вітаємо, ${firstName}! 👋\n\nРаді бачити Вас знову. Ви можете увійти у свій кабінет практикуму за кнопкою нижче (авторизація відбудеться автоматично):`;
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

    // Default welcome fallback if user not found in DB
    const defaultWelcome = `Вітаємо, ${firstName}! 👋\n\nЯ ваш персональний помічник на міні-курсі Софії.\n\n🎁 Якщо у Вас є подарунковий код або посилання (наприклад: \`GIFT-...\` або \`prize-...\`), **надішліть його сюди прямо у відповідь на це повідомлення**, і бот миттєво активує Ваш доступ!\n\nАбо відкрийте кабінет за кнопкою нижче:`;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sofifinsight.vercel.app';
    
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
