"use client"

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function PracticumFailPage() {
  const router = useRouter();

  useEffect(() => {
    const lastOrderId = sessionStorage.getItem('lastOrderId');
    let activeTgMsgId = null;
    
    const tgDataRaw = localStorage.getItem('tg_msg_id_data');

    if (tgDataRaw) {
      try {
        const tgData = JSON.parse(tgDataRaw);
        const isExpired = Date.now() - tgData.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          activeTgMsgId = tgData.id;
        } else {
          localStorage.removeItem('tg_msg_id_data');
        }
      } catch (e) {
        localStorage.removeItem('tg_msg_id_data');
      }
    }

    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get('orderReference') || searchParams.get('order_id');
    const urlTgMsgId = searchParams.get('tg_msg_id');
    
    const activeOrderId = urlOrderId || lastOrderId;
    if (urlTgMsgId) activeTgMsgId = urlTgMsgId;

    if (activeOrderId) {
      fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_status",
          order_id: activeOrderId,
          customer_name: localStorage.getItem('lead_name') || 'Клієнт',
          utm_source: localStorage.getItem('lead_utm_source') || '',
          utm_medium: localStorage.getItem('lead_utm_medium') || '',
          status: "DECLINED (Redirect)",
          tg_msg_id: activeTgMsgId,
          target_sheet_id: "1127634999"
        }),
      }).finally(() => {
        localStorage.removeItem('tg_msg_id_data');
      });
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-manrope text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic text-red-500">
            ПОМИЛКА ОПЛАТИ
          </h1>
          
          <p className="font-inter text-lg text-white/60 mb-8 leading-relaxed">
            На жаль, платіж за Практикум не було завершено.<br/>
            Спробуйте ще раз або зверніться до підтримки.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => router.push('/practicum#register')}
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              СПРОБУВАТИ ЩЕ РАЗ
            </button>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
