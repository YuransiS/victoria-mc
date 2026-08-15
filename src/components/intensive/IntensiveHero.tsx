"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Video, GraduationCap, Sparkles } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";

interface IntensiveHeroProps {
  onOpenCheckout: () => void;
}

export function IntensiveHero({ onOpenCheckout }: IntensiveHeroProps) {
  const { formattedTime } = use10MinTimer();

  return (
    <section className="relative w-full min-h-[92svh] md:min-h-[88svh] overflow-hidden bg-[#2B0813] md:bg-[#FAF6EE] text-[#FAF6EE] md:text-[#2B0813] flex flex-col justify-between md:flex-row md:items-stretch">
      {/* ========================================================================= */}
      {/* 1. MOBILE BACKGROUND: Natural sharp photo at top + smooth gradient fade at bottom */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none">
        <Image
          src="/rozbir/IMG_2534.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-[center_top]"
        />
        {/* Seamless full-width gradient overlay: Clear top for Victoria portrait -> Smooth transition -> Solid Dark Plum Bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent via-25% via-[#2B0813]/70 via-45% via-[#2B0813]/95 via-65% to-[#2B0813]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP PHOTO COLUMN (50% left split layout) */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative md:w-[50%] md:h-auto overflow-hidden">
        <Image
          src="/rozbir/IMG_2534.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#FAF6EE]/20" />
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE & DESKTOP CONTENT STACK */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col justify-between w-full md:w-[50%] px-5 sm:px-8 md:px-12 lg:px-16 pt-5 pb-8 md:py-16">
        {/* --- TOP BADGES PILL (Matches Reference Top Header) --- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center md:justify-start w-full mb-6 sm:mb-8"
        >
          <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md text-[#2B0813] text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-black/10 tracking-wide">
            <span className="text-[#451220] uppercase font-extrabold">Інтенсив · 4 уроки</span>
            <span className="text-[#2B0813]/30 font-light">|</span>
            <span className="text-[#2B0813]/80 uppercase">Система контенту 2026</span>
          </div>
        </motion.div>

        {/* --- MOBILE SPACING (Leaves Victoria's portrait visible at top) --- */}
        <div className="h-[26vh] sm:h-[32vh] md:hidden pointer-events-none" />

        {/* --- MAIN HERO TEXT & CTA (Seamless on mobile, left-aligned on desktop) --- */}
        <div className="max-w-xl mx-auto md:mx-0 w-full text-left">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-[26px] sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.18] tracking-tight mb-3 text-white md:text-[#2B0813] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:drop-shadow-none"
          >
            Абсолютно випадковий контент може набрати мільйони.{" "}
            <span className="italic block mt-1 text-[#f5d0a6] md:text-[#451220] font-normal">
              А той, у який ти вклала душу — 5 лайків
            </span>
          </motion.h1>

          {/* Subtitle & Logic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 mb-5 font-manrope text-xs sm:text-sm md:text-base leading-relaxed text-white/90 md:text-[#2B0813]/85"
          >
            <p className="font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] md:drop-shadow-none">
              І поки ти не розумієш чому — кожна наступна одиниця контенту це не система, а випадковість.
            </p>
            <p className="font-semibold text-white md:text-[#451220] bg-white/10 md:bg-[#451220]/5 p-3 sm:p-3.5 rounded-2xl border border-white/15 md:border-[#451220]/15 shadow-sm backdrop-blur-md">
              За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів
            </p>
          </motion.div>

          {/* Price & CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3.5"
          >
            {/* Price Row & Countdown Timer */}
            <div className="flex items-center gap-3 font-manrope">
              <div className="flex items-baseline gap-2">
                <span className="font-extrabold text-2xl sm:text-3xl text-[#FFF500] md:text-[#451220]">9€</span>
                <span className="line-through text-sm opacity-50 text-white md:text-[#2B0813]">49€</span>
              </div>
              <span className="rounded-md bg-[#16A34A] text-white text-[10px] sm:text-xs font-extrabold px-2 py-0.5 uppercase tracking-wide">
                -80% ЗНИЖКА
              </span>
              <div className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-[#f5d0a6] md:text-[#451220]">
                <Clock size={13} className="animate-pulse" />
                <span>ще {formattedTime}</span>
              </div>
            </div>

            {/* Main Action Button */}
            <button
              onClick={onOpenCheckout}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full py-4 px-8 text-sm sm:text-base font-extrabold uppercase tracking-wide shadow-2xl transition-all duration-300 bg-[#5c172a] md:bg-[#451220] hover:bg-[#380d17] md:hover:bg-[#2B0813] text-[#FAF6EE] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20 md:border-none"
            >
              <span>Хочу систему</span>
              <ArrowRight size={18} />
            </button>

            {/* Bottom Trust Features (Matches Reference 3-item footer) */}
            <div className="flex items-center justify-around sm:justify-center sm:gap-6 text-white/70 md:text-[#2B0813]/70 text-[11px] sm:text-xs font-manrope pt-1">
              <span className="flex items-center gap-1">
                <Video size={13} />
                4 відео-уроки
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GraduationCap size={13} />
                Авторська система
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles size={13} />
                100% результат
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
