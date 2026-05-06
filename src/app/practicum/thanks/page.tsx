"use client"

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { trackFBEvent } from "@/components/FacebookPixel";

export default function PracticumThanksPage() {
  const router = useRouter();

  useEffect(() => {
    const attempt = sessionStorage.getItem('paymentAttempted');
    const sessionOrderId = sessionStorage.getItem('lastOrderId');
    const lastAmount = sessionStorage.getItem('lastAmount') || "9";
    const lastTariff = sessionStorage.getItem('lastTariffName') || "Практикум";
    
    const searchParams = new URLSearchParams(window.location.search);
    const urlOrderId = searchParams.get('orderReference') || searchParams.get('order_id');
    
    const activeOrderId = urlOrderId || sessionOrderId;

    if (!attempt && !urlOrderId) {
      router.push('/practicum');
      return;
    }

    // Track Purchase to Facebook (only once)
    const tracked = sessionStorage.getItem('pixelPurchaseTracked');
    if (!tracked) {
      trackFBEvent("Purchase", {
        value: parseFloat(lastAmount),
        currency: "USD",
        content_name: lastTariff,
        order_id: activeOrderId
      });
      sessionStorage.setItem('pixelPurchaseTracked', 'true');
    }

    // Trigger status update
    if (activeOrderId) {
      fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          order_id: activeOrderId,
          status: "APPROVED (Redirect)",
          target_sheet_name: "Практикум"
        }),
      }).then(() => {
        if (sessionOrderId) sessionStorage.removeItem('lastOrderId');
        sessionStorage.removeItem('savedFormData');
      }).catch(e => console.error("Update failed:", e));
    }

    // Auto-redirect to Telegram after 3 seconds
    const timer = setTimeout(() => {
      window.location.href = "https://t.me/+HQF8RU3-T2UyYjU0";
    }, 3000);

    return () => clearTimeout(timer);
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
          <div className="mb-12 flex justify-center">
            <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
          </div>

          <h1 className="font-manrope text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
            ДЯКУЄМО!
          </h1>
          
          <p className="font-inter text-lg text-white/60 mb-12 leading-relaxed">
            Оплата успішно зафіксована. Зараз ви будете автоматично перенаправлені в закритий Telegram-канал практикуму. Якщо цього не сталося — натисніть кнопку нижче.
          </p>

          <div className="space-y-4">
            <a 
              href="https://t.me/+HQF8RU3-T2UyYjU0" 
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all text-center"
            >
              ПЕРЕЙТИ В КАНАЛ
            </a>
            
            <Link 
              href="/practicum" 
              className="block w-full border border-white/20 py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              ПОВЕРНУТИСЯ НА САЙТ
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
