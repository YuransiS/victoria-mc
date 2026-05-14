"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PracticumFailPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");

  useEffect(() => {
    const attempt = sessionStorage.getItem('paymentAttempted');
    const lastOrderId = sessionStorage.getItem('lastOrderId');
    let activeTgMsgId = null;
    
    const tgDataRaw = localStorage.getItem('tg_msg_id_data');
    let debug = `Order: ${lastOrderId || 'None'}\nRaw TG Data: ${tgDataRaw || 'Empty'}`;

    if (tgDataRaw) {
      try {
        const tgData = JSON.parse(tgDataRaw);
        const isExpired = Date.now() - tgData.timestamp > 24 * 60 * 60 * 1000;
        if (!isExpired) {
          activeTgMsgId = tgData.id;
          debug += `\nFound ID: ${activeTgMsgId}`;
        } else {
          debug += `\nID Expired!`;
          localStorage.removeItem('tg_msg_id_data');
        }
      } catch (e) {
        debug += `\nParse Error!`;
        localStorage.removeItem('tg_msg_id_data');
      }
    }
    
    setDebugInfo(debug);

    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get('orderReference') || searchParams.get('order_id');
    const urlTgMsgId = searchParams.get('tg_msg_id');
    
    const activeOrderId = urlOrderId || lastOrderId;
    if (urlTgMsgId) activeTgMsgId = urlTgMsgId;

    if (activeOrderId) {
      setDebugInfo(prev => prev + "\nSending failure update request...");
      fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action: "update_status",
          order_id: activeOrderId,
          status: "DECLINED (Redirect)",
          tg_msg_id: activeTgMsgId,
          target_sheet_id: "1127634999"
        }),
      }).then(async (res) => {
        const data = await res.json();
        setDebugInfo(prev => prev + `\nServer Response: ${JSON.stringify(data)}`);
        localStorage.removeItem('tg_msg_id_data');
      }).catch(e => {
        setDebugInfo(prev => prev + `\nUpdate Failed: ${e.message}`);
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
            На жаль, платіж за Практикум не було завершено.
          </p>

          {/* DEBUG BLOCK FOR USER */}
          <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl text-left font-mono text-xs text-red-400 whitespace-pre-wrap">
            <div className="text-white/40 mb-2 uppercase text-[10px] tracking-widest">Debug Info (Test Mode):</div>
            {debugInfo}
          </div>

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
