"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Check, Clock } from "lucide-react";

interface StyleHeroProps {
  onOpenModal: () => void;
}

export function StyleHero({ onOpenModal }: StyleHeroProps) {
  return (
    <section className="relative pt-4 sm:pt-6 pb-6 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Main Hero Card Container (Matches Framer Reference Card Deck) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-gradient-to-b from-white to-[#F8FFF9] rounded-3xl p-5 sm:p-7 border border-[#DFEADF] shadow-[0_14px_42px_rgba(13,78,42,0.08)] relative overflow-hidden"
      >
        {/* Top Floating Badge */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <span className="inline-flex items-center gap-2 bg-[#F0FAF3] text-[#06874F] border border-[#C9F7DB] px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-[0.16em]">
            <span className="w-2 h-2 rounded-full bg-[#18B66F] animate-pulse" />
            3-ДЕННЕ НАВЧАННЯ
          </span>
          <span className="text-[11px] font-bold text-[#142117]/60 tracking-wider uppercase font-manrope">
            Онлайн-інтенсив
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="font-playfair text-2xl sm:text-3xl font-bold leading-[1.2] text-[#142117] tracking-tight mb-4">
          Твій блог може <span className="text-[#06874F] italic">виділятися</span> і{" "}
          <span className="underline decoration-[#18B66F]/40 decoration-4 underline-offset-4">запам'ятовуватися</span>,{" "}
          <span className="text-[#142117]/75 font-normal block sm:inline">
            навіть якщо зараз він виглядає як у всіх
          </span>
        </h1>

        {/* Hero Visual Card (Victoria Photo with Clean Tag) */}
        <div className="relative w-full h-60 sm:h-72 rounded-2xl overflow-hidden mb-5 border border-[#DFEADF] shadow-inner group">
          <Image
            src="/free-lection/krupn.JPG"
            alt="Вікторія Мещерякова"
            fill
            priority
            className="object-cover object-[center_20%] group-hover:scale-[1.02] transition-transform duration-700"
          />
          {/* Subtle bottom gradient overlay for card badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#142117]/80 via-transparent to-black/10" />

          {/* Floating Author Tag on Visual */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <div className="backdrop-blur-md bg-black/45 border border-white/20 px-3 py-1 rounded-full text-[11px] font-semibold">
              ✨ Вікторія Мещерякова · Експертка з візуалу та контенту
            </div>
          </div>
        </div>

        {/* Subtitle & Value Proposition */}
        <div className="space-y-3 mb-6 font-manrope text-xs sm:text-sm text-[#142117]/85 leading-relaxed">
          <p className="font-medium">
            <strong>За 3 дні покажу</strong>, як перестати просто робити гарний контент — і почати будувати власний стиль блогу, який виділяє тебе серед інших, привертає саме твою аудиторію та змушує її залишатися з тобою.
          </p>
          <p className="text-xs text-[#06874F] font-bold bg-[#EAF8EE] p-3 rounded-xl border border-[#C9F7DB]">
            ✦ А далі — використовувати блог як інструмент для росту аудиторії та залучення клієнтів і продажів
          </p>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={onOpenModal}
          className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#18B66F] to-[#06874F] hover:from-[#159f61] hover:to-[#057343] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(24,182,111,0.35)] hover:shadow-[0_14px_34px_rgba(24,182,111,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <span>Хочу знайти свій стиль</span>
          <ArrowRight size={18} />
        </button>

        {/* Micro Guarantee Note */}
        <div className="flex items-center justify-center gap-3 text-[#142117]/60 text-[11px] font-manrope pt-3.5 font-semibold">
          <span className="flex items-center gap-1">
            <Check size={13} className="text-[#18B66F]" />
            Старт одразу
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock size={13} className="text-[#18B66F]" />
            Доступ назавжди
          </span>
        </div>
      </motion.div>
    </section>
  );
}
