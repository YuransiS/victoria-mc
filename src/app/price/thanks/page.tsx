"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackFBEvent } from "@/components/FacebookPixel";

export default function ThanksPage() {
  const router = useRouter();
  const [isMasterclass, setIsMasterclass] = useState(false);
  const [isStyleIntensive, setIsStyleIntensive] = useState(false);
  const [tgLink, setTgLink] = useState("https://t.me/vika_cooperation?text=%D0%94%D0%9E%D0%A1%D0%A2%D0%A3%D0%9F");

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
    if (tariff.includes("Стиль") || tariff.includes("3-денне")) {
      setIsStyleIntensive(true);
      setTgLink("https://t.me/vika_cooperation?text=%D0%94%D0%9E%D0%A1%D0%A2%D0%A3%D0%9F");
    } else if (tariff === "Майстер-клас 28.07") {
      setIsMasterclass(true);
      const savedLink = localStorage.getItem('masterclass_tg_link');
      if (savedLink) {
        setTgLink(savedLink);
      } else {
        setTgLink("https://t.me/+sWnkQ4VJeYg3MWVi");
      }
    } else {
      setTgLink("https://t.me/vika_cooperation?text=%D0%94%D0%9E%D0%A1%D0%A2%D0%A3%D0%9F");
    }

    if (activeOrderId) {
      const transactionStatus = searchParams.get('transactionStatus');
      
      if (transactionStatus && transactionStatus.toUpperCase() === 'APPROVED') {
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

        const targetSheet = tariff === "Майстер-клас 28.07" ? "Автовеб" : "Бронювання";

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
          
          <p className="font-inter text-lg text-white/70 mb-8 leading-relaxed">
            {isStyleIntensive ? (
              <>
                Реєстрацію на 3-денне навчання успішно зафіксовано!<br/>
                Напишіть кодове слово <strong className="text-white font-bold">«ДОСТУП»</strong> в особисті повідомлення на акаунт <strong className="text-white font-bold">@vika_cooperation</strong>, щоб отримати посилання на всі матеріали та уроки.
              </>
            ) : isMasterclass ? (
              <>
                Ваш квиток на майстер-клас успішно оплачено!<br/>
                Приєднайтеся до закритого Telegram-каналу, де будуть усі матеріали та посилання на трансляцію.
              </>
            ) : (
              <>
                Ваша бронь успішно зафіксована.<br/>
                Напишіть нам у Telegram на акаунт @vika_cooperation для отримання доступу.
              </>
            )}
          </p>

          <div className="space-y-4">
            <Link 
              href={tgLink} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all text-center"
            >
              {isStyleIntensive
                ? "НАПИСАТИ «ДОСТУП» У TELEGRAM (@vika_cooperation)"
                : isMasterclass
                ? "ПРИЄДНАТИСЯ ДО TELEGRAM"
                : "НАПИСАТИ В TELEGRAM"}
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
