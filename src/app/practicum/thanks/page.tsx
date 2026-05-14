"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PracticumThanksPage() {
  const router = useRouter();
  const [debugInfo, setDebugInfo] = useState<string>("Initializing...");

  useEffect(() => {
    const attempt = sessionStorage.getItem('paymentAttempted');
    const sessionOrderId = sessionStorage.getItem('lastOrderId');
    
    // Get TG Message ID from localStorage with 24h expiry check
    let activeTgMsgId = null;
    const tgDataRaw = localStorage.getItem('tg_msg_id_data');
    
    let debug = `Order: ${sessionOrderId || 'None'}\nRaw TG Data: ${tgDataRaw || 'Empty'}`;

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
    
    const activeOrderId = urlOrderId || sessionOrderId;
    if (urlTgMsgId) activeTgMsgId = urlTgMsgId;

    // Trigger status update
    if (activeOrderId) {
      const transactionStatus = searchParams.get('transactionStatus');
      
      if (!transactionStatus || transactionStatus.toUpperCase() === 'APPROVED') {
        setDebugInfo(prev => prev + "\nSending update request...");
        fetch('/api/leads', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "update_status",
            order_id: activeOrderId,
            status: "APPROVED (Redirect)",
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
      } else {
        setDebugInfo(prev => prev + `\nPayment not approved: ${transactionStatus}`);
      }
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-manrope text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
            ДЯКУЄМО!
          </h1>
          
          <p className="font-inter text-lg text-white/60 mb-8 leading-relaxed">
            Ваша бронь на Практикум успішно зафіксована.
          </p>

          {/* DEBUG BLOCK FOR USER */}
          <div className="mb-8 p-4 bg-white/5 border border-white/10 rounded-xl text-left font-mono text-xs text-green-400/70 whitespace-pre-wrap">
            <div className="text-white/40 mb-2 uppercase text-[10px] tracking-widest">Debug Info (Test Mode):</div>
            {debugInfo}
          </div>

          <div className="space-y-4">
            <Link 
              href="https://t.me/vika_cooperation" 
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              НАПИСАТИ В TELEGRAM
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
