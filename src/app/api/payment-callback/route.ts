import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    // WayForPay sends data as form-urlencoded
    const formData = await request.formData();
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const { 
      orderReference, 
      transactionStatus, 
      amount
    } = data;

    console.log('WayForPay Callback Received:', orderReference, transactionStatus);

    // 1. Log payment status to Google Sheets
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    const apiKey = process.env.SHEETS_API_KEY;

    let tgMsgId = null;
    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: 'update_payment_status',
            order_id: orderReference,
            status: transactionStatus,
            amount: amount,
            api_key: apiKey
          }),
        });
        const resData = await res.json();
        if (resData.tg_msg_id) {
          tgMsgId = resData.tg_msg_id;
        }
      } catch (err) {
        console.error('Sheet update error:', err);
      }
    }

    // 2. Telegram Notification
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    const s = (transactionStatus || "").toString().toUpperCase();
    const isSuccess = s.includes('APPROVED') || s.includes('SETTLED') || s.includes('SUCCESS');

    if (token && chatId) {
      const clientName = data.clientName || data.clientFirstName || '-';
      const clientPhone = data.phone || data.clientPhone || '-';
      
      let statusEmoji = isSuccess ? "✅" : "❌";
      let statusTitle = isSuccess ? "ОПЛАТА УСПІШНА!" : `ПОМИЛКА ОПЛАТИ (${transactionStatus})`;
      
      const message = `${statusEmoji} <b>${statusTitle}</b>\n\n` +
        `👤 <b>Клієнт:</b> ${clientName}\n` +
        `📞 <b>Телефон:</b> ${clientPhone}\n` +
        `💰 <b>Сума:</b> ${amount} ${data.currency || 'UAH'}\n` +
        `🆔 <b>ID:</b> <code>${orderReference}</code>\n` +
        `💳 <b>Система:</b> ${data.paymentSystem || '-'}`;

      // Ensure message_id is an integer for Telegram API
      const messageId = tgMsgId ? parseInt(tgMsgId.toString()) : null;
      const tgMethod = messageId ? 'editMessageText' : 'sendMessage';
      
      const tgPayload: any = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      };
      
      if (messageId) {
        tgPayload.message_id = messageId;
      } else {
        tgPayload.message_thread_id = topicId;
      }

      if (messageId || isSuccess) {
        const tgRes = await fetch(`https://api.telegram.org/bot${token}/${tgMethod}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgPayload),
        });
        
        const tgResult = await tgRes.json();
        if (!tgResult.ok) {
          console.error(`Telegram API Error (${tgMethod}):`, tgResult);
          // If editing failed, try sending a new message as fallback if it's a success
          if (messageId && isSuccess) {
            await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chat_id: chatId,
                message_thread_id: topicId,
                text: message,
                parse_mode: 'HTML',
              }),
            });
          }
        }
      }
    }

    // 3. Respond to WayForPay with 'accept'
    const time = Math.floor(Date.now() / 1000);
    const responseSignatureData = [orderReference, 'accept', time].join(';');
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim() || "";
    
    const signature = crypto
      .createHmac('md5', merchantSecretKey)
      .update(responseSignatureData, 'utf8')
      .digest('hex');

    const responseBody = {
      orderReference,
      status: 'accept',
      time,
      signature
    };

    return NextResponse.json(responseBody);

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
