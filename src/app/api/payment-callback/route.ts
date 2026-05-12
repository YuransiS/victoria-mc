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

    if (scriptUrl) {
      await fetch(scriptUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: orderReference,
          status: transactionStatus,
          api_key: apiKey,
          target_sheet_id: "1127634999"
        }),
      }).catch(err => console.error('Sheet update error:', err));
    }

    // 2. Telegram Notification for Success
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    const topicId = process.env.TOPIC_ID;

    if (token && chatId && (transactionStatus === 'Approved' || transactionStatus === 'Settled')) {
      const clientName = data.clientName || data.clientFirstName || '-';
      const clientPhone = data.phone || data.clientPhone || '-';
      
      const message = `✅ <b>ОПЛАТА УСПІШНА!</b>\n\n` +
        `👤 <b>Клієнт:</b> ${clientName}\n` +
        `📞 <b>Телефон:</b> ${clientPhone}\n` +
        `💰 <b>Сума:</b> ${amount} ${data.currency || 'UAH'}\n` +
        `🆔 <b>ID:</b> <code>${orderReference}</code>\n` +
        `💳 <b>Система:</b> ${data.paymentSystem || '-'}`;

      fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_thread_id: topicId,
          text: message,
          parse_mode: 'HTML',
        }),
      }).catch(err => console.error('Telegram notification failed:', err));
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
