"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Send } from "lucide-react";
import { trackFBEvent } from "@/components/FacebookPixel";
import { trackClarityEvent, setClarityTag } from "@/components/MicrosoftClarity";
import { getBwCid } from "@/lib/enrichment";

function StyleThanksContent() {
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Resolve parameters from URL or localStorage fallback
    const paramBwCid = searchParams.get("bw_cid");
    const paramOrderId = searchParams.get("order_id") || searchParams.get("orderReference");

    const savedBwCid = localStorage.getItem("lead_bw_cid") || localStorage.getItem("bw_cid") || getBwCid();
    const savedOrderId = localStorage.getItem("lead_order_id") || `STYLE_${Date.now()}`;

    const bwCid = paramBwCid || savedBwCid || "";
    const orderId = paramOrderId || savedOrderId || "";

    // 2. Track Analytics & Pixel conversions
    trackFBEvent("PageView", {});
    trackFBEvent("CompleteRegistration", {
      content_name: "3-денне навчання: Твій стиль блогу (Безкоштовно)",
      currency: "UAH",
      value: 0,
      order_id: orderId,
    });
    trackClarityEvent("CompleteRegistration");
    setClarityTag("order_id", orderId);
    if (bwCid) setClarityTag("bw_cid", bwCid);
  }, [searchParams]);

  const telegramUrl = "https://t.me/vika_cooperation?text=%D0%94%D0%9E%D0%A1%D0%A2%D0%A3%D0%9F";

  return (
    <main className="min-h-screen bg-[#FBF6EE] text-[#231815] font-manrope selection:bg-[#D96B27] selection:text-white relative overflow-hidden flex items-center justify-center p-4 sm:p-6">
      {/* Warm Autumn Atmospheric Glow Accents */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FCD9BD]/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#F8C69D]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#F5B47B]/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Thank You Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-lg bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-9 border border-[#EADBCE] shadow-[0_20px_50px_rgba(163,61,18,0.1)] text-center"
      >
        {/* Top Notification Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EBF5EE] border border-[#CDE5D4] text-[#227C44] text-xs font-bold uppercase tracking-wider mb-5">
          <CheckCircle2 size={16} className="text-[#27AE60]" />
          <span>Реєстрацію успішно підтверджено</span>
        </div>

        {/* Headline */}
        <h1 className="font-playfair text-2xl sm:text-3xl font-black text-[#2D1E18] tracking-tight leading-tight mb-3">
          Залишився 1 останній крок:
        </h1>

        {/* Subheading & Explanation */}
        <p className="text-sm sm:text-base text-[#5A453D] leading-relaxed mb-6 font-medium">
          Щоб отримати всі матеріали та розпочати 3-денне навчання, натисни кнопку нижче та надішли слово{" "}
          <strong className="text-[#A33D12] font-black bg-[#FEF5EE] px-2 py-0.5 rounded border border-[#F5D6C1]">
            «ДОСТУП»
          </strong>{" "}
          у Telegram:
        </p>

        {/* Big Direct Telegram Action Button */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white py-4 sm:py-4.5 px-6 rounded-2xl text-sm sm:text-base font-extrabold uppercase tracking-wide shadow-[0_12px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_16px_36px_rgba(200,90,23,0.45)] transform active:scale-[0.98] transition-all duration-200 group cursor-pointer"
        >
          <Send size={18} className="text-white group-hover:translate-x-0.5 transition-transform" />
          <span>Написати «ДОСТУП» у Telegram</span>
          <ArrowRight size={18} className="text-white/80 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* Helpful note */}
        <p className="mt-4 text-xs text-[#8C7A72] font-medium leading-relaxed">
          * Натисни на кнопку — діалог з <strong className="text-[#2D1E18]">@vika_cooperation</strong> відкриється автоматично з готовим словом «ДОСТУП»
        </p>
      </motion.div>
    </main>
  );
}

export function StyleThanksPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FBF6EE] flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#D96B27] border-t-transparent rounded-full" />
        </main>
      }
    >
      <StyleThanksContent />
    </Suspense>
  );
}
