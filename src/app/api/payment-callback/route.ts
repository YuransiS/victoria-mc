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

      const tgMethod = tgMsgId ? 'editMessageText' : 'sendMessage';
      const tgPayload: any = {
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      };
      
      if (tgMsgId) {
        tgPayload.message_id = tgMsgId;
      } else {
        // Only send new message if we don't have an ID to edit
        tgPayload.message_thread_id = topicId;
      }

      // We only edit if we have an ID, or send a new message IF it's a success
      // (to avoid spamming errors if we don't have an ID)
      if (tgMsgId || isSuccess) {
        await fetch(`https://api.telegram.org/bot${token}/${tgMethod}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgPayload),
        }).catch(err => console.error('Telegram notification failed:', err));
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
