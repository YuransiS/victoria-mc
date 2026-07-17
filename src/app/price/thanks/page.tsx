"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackFBEvent } from "@/components/FacebookPixel";

export default function ThanksPage() {
  const router = useRouter();
  const [isMasterclass, setIsMasterclass] = useState(false);
  const [tgLink, setTgLink] = useState("https://telegram.me/vika_cooperation");

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

    const tariff = localStorage.getItem('lead_tariff') || 'Бронювання';
    if (tariff === "Майстер-клас 23.07") {
      setIsMasterclass(true);
      const savedLink = localStorage.getItem('masterclass_tg_link');
      if (savedLink) {
        setTgLink(savedLink);
      } else {
        setTgLink("https://t.me/+sWnkQ4VJeYg3MWVi");
      }
    }

    if (activeOrderId) {
      const transactionStatus = searchParams.get('transactionStatus');
      
      if (!transactionStatus || transactionStatus.toUpperCase() === 'APPROVED') {
        // Track Purchase
        const amount = parseFloat(localStorage.getItem('lead_amount') || '0');
        const currency = localStorage.getItem('lead_currency') || 'UAH';
        
        if (amount > 0) {
          trackFBEvent("Purchase", {
            value: amount,
            currency: currency,
            content_name: tariff,
            content_type: "product"
          });
        }

        const targetSheet = tariff === "Майстер-клас 23.07" ? "Автовеб" : "Бронювання";

        fetch('/api/leads', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: "update_status",
            order_id: activeOrderId,
            customer_name: localStorage.getItem('lead_name') || 'Клієнт',
            customer_phone: localStorage.getItem('lead_phone') || '-',
            tariff: tariff,
            amount: localStorage.getItem('lead_amount') || '-',
            currency: localStorage.getItem('lead_currency') || 'UAH',
            utm_source: localStorage.getItem('lead_utm_source') || '',
            utm_medium: localStorage.getItem('lead_utm_medium') || '',
            status: "APPROVED (Redirect)",
            tg_msg_id: activeTgMsgId,
            target_sheet: targetSheet
          }),
        }).finally(() => {
          localStorage.removeItem('tg_msg_id_data');
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
            {isMasterclass ? (
              <>
                Ваш квиток на майстер-клас успішно оплачено!<br/>
                Приєднайтеся до закритого Telegram-каналу, де будуть усі матеріали та посилання на трансляцію.
              </>
            ) : (
              <>
                Ваша бронь успішно зафіксована.<br/>
                Напишіть нам у Telegram для отримання подальших інструкцій.
              </>
            )}
          </p>

          <div className="space-y-4">
            <Link 
              href={tgLink} 
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              {isMasterclass ? "ПРИЄДНАТИСЯ ДО TELEGRAM" : "НАПИСАТИ В TELEGRAM"}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
