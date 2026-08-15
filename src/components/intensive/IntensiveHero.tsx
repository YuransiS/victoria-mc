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
      {/* 1. MOBILE BACKGROUND: Victoria portrait photo (/free-lection/krupn.JPG) */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 md:hidden overflow-hidden pointer-events-none">
        <Image
          src="/free-lection/krupn.JPG"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-[center_top]"
        />
        {/* Subtle top shade behind header pill */}
        <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP PHOTO COLUMN (50% left split layout) */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative md:w-[50%] md:h-auto overflow-hidden">
        <Image
          src="/free-lection/krupn.JPG"
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
      <div className="relative z-10 flex flex-col justify-between w-full md:w-[50%] px-5 sm:px-8 md:px-12 lg:px-16 pt-4 pb-6 md:py-16 min-h-[92svh] md:min-h-0">
        {/* --- TOP BADGES PILL --- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center md:justify-start w-full mb-2"
        >
          <div className="inline-flex items-center gap-2.5 bg-white/95 backdrop-blur-md text-[#2B0813] text-[11px] sm:text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-black/10 tracking-wide">
            <span className="text-[#451220] uppercase font-extrabold">Інтенсив · 4 уроки</span>
            <span className="text-[#2B0813]/30 font-light">|</span>
            <span className="text-[#2B0813]/80 uppercase">Система контенту 2026</span>
          </div>
        </motion.div>

        {/* --- FLEXIBLE SPACER (Pushes text block to bottom) --- */}
        <div className="flex-1 min-h-[14vh] sm:min-h-[18vh] md:hidden" />

        {/* --- MAIN HERO TEXT (Directly linked to ultra-smooth progressive Gaussian blur gradient) --- */}
        <div className="relative max-w-xl mx-auto md:mx-0 w-full text-left">
          {/* Ultra-Smooth Progressive Gaussian Blur with gradient mask */}
          <div
            className="absolute -inset-x-6 -top-24 -bottom-10 pointer-events-none -z-10 md:hidden backdrop-blur-xl bg-gradient-to-b from-transparent via-[#2B0813]/85 to-[#2B0813]"
            style={{
              WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.8) 50%, black 75%)",
              maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 25%, rgba(0,0,0,0.8) 50%, black 75%)",
            }}
          />
          {/* Soft multi-stop color overlay for seamless feathering */}
          <div className="absolute -inset-x-6 -top-28 -bottom-10 pointer-events-none -z-10 md:hidden bg-gradient-to-b from-transparent via-[#2B0813]/60 via-40% via-[#2B0813]/92 via-65% to-[#2B0813]" />
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-[26px] sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.18] tracking-tight mb-2.5 text-white md:text-[#2B0813] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:drop-shadow-none"
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
            className="space-y-2.5 mb-4 font-manrope text-xs sm:text-sm md:text-base leading-relaxed text-white/95 md:text-[#2B0813]/85"
          >
            <p className="font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] md:drop-shadow-none">
              І поки ти не розумієш чому — кожна наступна одиниця контенту це не система, а випадковість.
            </p>
            <p className="font-semibold text-white md:text-[#451220] bg-white/10 md:bg-[#451220]/5 p-3 rounded-2xl border border-white/15 md:border-[#451220]/15 shadow-sm">
              За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів
            </p>
          </motion.div>

          {/* Price Row & Trust features & CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-3"
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

            {/* Trust Features (Above the button) */}
            <div className="flex items-center justify-around sm:justify-start sm:gap-6 text-white/80 md:text-[#2B0813]/70 text-[11px] sm:text-xs font-manrope py-1">
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

            {/* Main Action Button (At the VERY BOTTOM as requested in screenshot) */}
            <button
              onClick={onOpenCheckout}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full py-4 px-8 text-sm sm:text-base font-extrabold uppercase tracking-wide shadow-2xl transition-all duration-300 bg-[#5c172a] md:bg-[#451220] hover:bg-[#380d17] md:hover:bg-[#2B0813] text-[#FAF6EE] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20 md:border-none mt-1"
            >
              <span>Хочу систему</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
