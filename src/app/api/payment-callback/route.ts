import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const data: Record<string, any> = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });

    const {
      orderReference,
      transactionStatus,
      amount,
      reason,
      reasonCode
    } = data;

    console.log('WayForPay Callback Data:', data);

    // 1. Determine success strictly
    const currentStatus = (transactionStatus || "").toString().toUpperCase();
    const isSuccess = currentStatus === 'APPROVED';

    // 2. Update status in Google Sheets via the CRM script
    let tgMsgId = null;
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;

    if (scriptUrl) {
      try {
        const res = await fetch(scriptUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: 'updatePaymentStatus', // Consistent with script.js
            orderId: orderReference,
            status: transactionStatus || 'Unknown',
            amount: amount
          }),
        });
        const resData = await res.json();
        if (resData.tg_msg_id) {
          tgMsgId = resData.tg_msg_id;
        }
      } catch (err) {
        console.error('CRM Sheet update failed:', err);
      }
    }

    // 3. Update Telegram Message
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (token && chatId && tgMsgId) {
      const customerName = orderReference.split('_')[0] || 'Клієнт';

      const text = isSuccess
        ? `✅ Оплата успішна! (Практикум)\n\n👤 Клієнт: ${customerName}\n💰 Сума: ${amount} USD\n🆔 ID: ${orderReference}\n\nСтатус оновлено в CRM.`
        : `❌ Оплата ВІДХИЛЕНА (Практикум)\n\n👤 Клієнт: ${customerName}\n💰 Сума: ${amount} USD\n🆔 ID: ${orderReference}\n\nСтатус: ${transactionStatus || 'Declined'}\nПричина: ${reason || 'Невідома'}`;

      try {
        const editRes = await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: parseInt(tgMsgId.toString()),
            text: text
          })
        });

        const editData = await editRes.json();
        if (!editData.ok) {
          throw new Error(editData.description);
        }
      } catch (err) {
        console.error('Failed to edit TG message, sending new one:', err);
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: text
          })
        });
      }
    }

    // 4. Respond to WayForPay (Standard Acknowledgment)
    const time = Math.floor(Date.now() / 1000);
    const responseSignatureData = [orderReference, 'accept', time].join(';');
    const merchantSecretKey = process.env.WFP_SECRET_KEY?.replace(/['"]/g, '').trim() || "";

    const signature = crypto
      .createHmac('md5', merchantSecretKey)
      .update(responseSignatureData, 'utf8')
      .digest('hex');

    return NextResponse.json({
      orderReference,
      status: 'accept',
      time,
      signature
    });

  } catch (error) {
    console.error('Callback process error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
