"use client"

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackFBEvent } from "@/components/FacebookPixel";

export default function PracticumThanksPage() {
  const router = useRouter();

  useEffect(() => {
    const sessionOrderId = sessionStorage.getItem('lastOrderId');
    
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
    
    const activeOrderId = urlOrderId || sessionOrderId;
    if (urlTgMsgId) activeTgMsgId = urlTgMsgId;

    if (activeOrderId) {
      const transactionStatus = searchParams.get('transactionStatus');
      
      if (transactionStatus && transactionStatus.toUpperCase() === 'APPROVED') {
        // Track Purchase
        const amount = parseFloat(localStorage.getItem('lead_amount') || '0');
        const currency = localStorage.getItem('lead_currency') || 'USD';
        const tariff = localStorage.getItem('lead_tariff') || 'Практикум';
        
        if (amount > 0) {
          trackFBEvent("Purchase", {
            value: amount,
            currency: currency,
            content_name: tariff,
            content_type: "product"
          });
        }

        fetch('/api/leads', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "update_status",
            order_id: activeOrderId,
            customer_name: localStorage.getItem('lead_name') || 'Клієнт',
            customer_phone: localStorage.getItem('lead_phone') || '-',
            tariff: localStorage.getItem('lead_tariff') || '-',
            amount: localStorage.getItem('lead_amount') || '-',
            currency: localStorage.getItem('lead_currency') || 'USD',
            utm_source: localStorage.getItem('lead_utm_source') || '',
            utm_medium: localStorage.getItem('lead_utm_medium') || '',
            status: "APPROVED (Redirect)",
            tg_msg_id: activeTgMsgId,
            target_sheet: "Практикум"
          }),
        }).finally(() => {
          localStorage.removeItem('tg_msg_id_data');
          // Auto-redirect to Telegram after a short delay
          setTimeout(() => {
            window.location.href = "https://telegram.me/+HQF8RU3-T2UyYjU0";
          }, 2000);
        });
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
            Ваша бронь на Практикум успішно зафіксована.<br/>
            Зараз вас буде перенаправлено в Telegram...
          </p>

          <div className="space-y-4">
            <Link 
              href="https://telegram.me/+HQF8RU3-T2UyYjU0" 
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              ПЕРЕЙТИ В TELEGRAM ЗАРАЗ
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
