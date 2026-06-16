'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { trackFBEvent } from '@/components/FacebookPixel';

function ThanksContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState('');

  useEffect(() => {
    const ref = searchParams.get('orderReference') || '';
    setOrderId(ref);

    // Meta Pixel Tracking
    const leadName = (localStorage.getItem('lead_name') || '').trim();
    const leadPhone = (localStorage.getItem('lead_phone') || '').replace(/\D/g, '');
    const savedPrice = localStorage.getItem('purchase_price') || '390';

    trackFBEvent('Purchase', {
      value: parseFloat(savedPrice),
      currency: 'UAH',
      content_name: 'Персональна Діагностика Віка',
      content_type: 'product',
      content_ids: ['diag_v_1'],
      external_id: ref,
    });

    // Update Telegram Bot Status
    let activeTgMsgId = null;
    const tgDataRaw = localStorage.getItem('tg_msg_id_data');
    if (tgDataRaw) {
      try {
        const tgData = JSON.parse(tgDataRaw);
        if (Date.now() - tgData.timestamp < 24 * 60 * 60 * 1000) {
          activeTgMsgId = tgData.id;
        }
      } catch (e) {}
    }

    if (ref) {
      fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_status",
          order_id: ref,
          customer_name: leadName || 'Клієнт',
          customer_phone: leadPhone || '-',
          tariff: "Персональний розбір",
          amount: savedPrice,
          currency: "UAH",
          utm_source: localStorage.getItem('lead_utm_source') || '',
          utm_medium: localStorage.getItem('lead_utm_medium') || '',
          status: "APPROVED (Redirect)",
          tg_msg_id: activeTgMsgId,
          target_sheet: "Ленд 3"
        }),
      }).finally(() => {
        localStorage.removeItem('tg_msg_id_data');
      });
    }
  }, [searchParams]);

  return (
    <div className="antialiased min-h-screen flex flex-col justify-center items-center px-4 bg-[#F9F9F9] relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-gray-200/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-gray-300/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="max-w-md w-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-2xl p-10 md:p-14 text-center rounded-3xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-10 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center animate-bounce">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="white" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="absolute -inset-2 bg-black/5 rounded-full animate-ping"></div>
          </div>
        </div>

        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#6B6B6B] mb-4">Успішна оплата</p>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-br from-[#0f0f0f] to-[#444] bg-clip-text text-transparent">
          ДЯКУЄМО!
        </h1>
        
        <div className="w-12 h-[1px] bg-black/20 mx-auto mb-8"></div>
        
        <p className="text-gray-600 mb-10 font-light leading-relaxed text-sm md:text-base">
          Ваша оплата за <span className="text-black font-bold">персональний розбір</span> пройшла успішно. 
          Чекайте на повідомлення в Telegram найближчим часом для початку роботи.
        </p>

        <div className="">
          <Link href="/rozbir"
            className="group relative inline-flex w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.2em] transform transition-all hover:scale-[1.02] active:scale-95 justify-center items-center overflow-hidden rounded-xl">
            <span className="relative z-10">Повернутися на сайт</span>
            <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
          </Link>
          
          <p className="mt-8 text-[9px] text-[#6B6B6B] uppercase tracking-widest font-medium opacity-60">
            Замовлення: <span className="text-black">{orderId || 'ОБРОБЛЕНО'}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ThanksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ThanksContent />
    </Suspense>
  );
}
