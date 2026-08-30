"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock, Flame, Sparkles } from "lucide-react";

interface StyleHeroProps {
  onOpenModal: () => void;
}

export function StyleHero({ onOpenModal }: StyleHeroProps) {
  return (
    <section className="relative pt-4 sm:pt-6 pb-6 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Main Hero Card Container (Autumn Luxury Card Deck) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-gradient-to-b from-white via-[#FFFDF9] to-[#FAF4EC] rounded-3xl p-5 sm:p-7 border border-[#EADBCE] shadow-[0_14px_42px_rgba(163,61,18,0.08)] relative overflow-hidden"
      >
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className="inline-flex items-center gap-1.5 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em]">
            <span className="w-2 h-2 rounded-full bg-[#D96B27] animate-pulse" />
            3-ДЕННЕ НАВЧАННЯ
          </span>
          <span className="text-[11px] font-bold text-[#2D1E18]/60 tracking-wider uppercase font-manrope">
            Осінній інтенсив
          </span>
        </div>

        {/* Free Spots Urgency Live Banner (User Directive: 100 max, 79 taken, then 690 UAH) */}
        <div className="bg-[#FEF5EE] border border-[#F5D6C1] rounded-2xl p-3.5 mb-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-black text-[#A33D12] uppercase tracking-wide">
              <Flame size={15} className="text-[#D96B27] animate-bounce" />
              <span>Безкоштовно перші 100 місць</span>
            </div>
            <span className="text-[11px] font-extrabold text-[#D96B27] bg-white px-2 py-0.5 rounded-full border border-[#F5D6C1]">
              0 грн <span className="line-through text-gray-400 font-normal ml-0.5">690 грн</span>
            </span>
          </div>

          {/* Progress Bar (79 / 100 taken) */}
          <div className="w-full bg-[#EADBCE]/50 rounded-full h-2.5 overflow-hidden p-0.5 mb-1.5">
            <div
              className="bg-gradient-to-r from-[#D96B27] to-[#A33D12] h-full rounded-full transition-all duration-1000 shadow-sm"
              style={{ width: "79%" }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-manrope">
            <span className="font-bold text-[#2D1E18]/80">
              Зайнято: <strong className="text-[#A33D12]">79 / 100 місць</strong>
            </span>
            <span className="font-extrabold text-[#A33D12]">
              Залишився 21 квиток (далі 690 грн)
            </span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold leading-[1.22] text-[#231815] tracking-tight mb-4">
          Твій блог може <span className="text-[#C85A17] italic">виділятися</span> і{" "}
          <span className="underline decoration-[#D96B27]/40 decoration-4 underline-offset-4">запам'ятовуватися</span>,{" "}
          <span className="text-[#231815]/75 font-normal block sm:inline">
            навіть якщо зараз він виглядає як у всіх
          </span>
        </h1>

        {/* Hero Visual Card (Victoria Photo with Aesthetic Warm Framing) */}
        <div className="relative w-full h-64 sm:h-76 rounded-2xl overflow-hidden mb-5 border border-[#EADBCE] shadow-inner group">
          <Image
            src="/free-lection/estet.JPG"
            alt="Вікторія Мещерякова"
            fill
            priority
            className="object-cover object-[center_30%] group-hover:scale-[1.02] transition-transform duration-700"
          />
          {/* Subtle warm bottom gradient overlay for card badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#231815]/85 via-transparent to-black/10" />

          {/* Floating Author Tag on Visual (Corrected: Мещерякова) */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="backdrop-blur-md bg-black/45 border border-white/20 px-3.5 py-1.5 rounded-full text-[11px] font-semibold">
              🍂 Вікторія Мещерякова · Експертка з візуалу та контенту
            </div>
          </div>
        </div>

        {/* Subtitle & Value Proposition */}
        <div className="space-y-3 mb-6 font-manrope text-xs sm:text-sm text-[#231815]/85 leading-relaxed">
          <p className="font-medium">
            <strong>За 3 дні покажу</strong>, як перестати просто робити гарний контент — і почати будувати власний стиль блогу, який виділяє тебе серед інших, привертає саме твою аудиторію та змушує її залишатися з тобою.
          </p>
          <p className="text-xs text-[#9E380E] font-bold bg-[#FEF5EE] p-3 rounded-xl border border-[#F5D6C1]">
            ✦ А далі — використовувати блог як інструмент для росту аудиторії та залучення клієнтів і продажів
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenModal}
          className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_14px_34px_rgba(200,90,23,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <span>Хочу знайти свій стиль безкоштовно</span>
          <ArrowRight size={18} />
        </button>

        {/* Micro Guarantee Note */}
        <div className="flex items-center justify-center gap-3 text-[#2D1E18]/60 text-[11px] font-manrope pt-3.5 font-semibold">
          <span className="flex items-center gap-1">
            <Check size={13} className="text-[#D96B27]" />
            Старт одразу
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-[#D96B27]" />
            Доступ назавжди
          </span>
        </div>
      </motion.div>
    </section>
  );
}
