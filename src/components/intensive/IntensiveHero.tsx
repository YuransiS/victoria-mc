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
    <section className="relative w-full min-h-[100dvh] md:min-h-[88svh] overflow-hidden bg-[#2B0813] md:bg-[#FAF6EE] text-[#FAF6EE] md:text-[#2B0813] flex flex-col justify-between md:flex-row md:items-stretch">
      {/* ========================================================================= */}
      {/* 1. MOBILE BACKGROUND & PORTRAIT VISUAL */}
      {/* ========================================================================= */}
      <div className="absolute inset-x-0 top-0 h-[48vh] sm:h-[52vh] md:hidden overflow-hidden pointer-events-none z-0">
        <Image
          src="/rozbir/vik.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-[center_10%]"
        />
        {/* Top subtle vignette behind badges */}
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/60 via-black/30 to-transparent" />
        {/* Multi-stop bottom fade to seamless wine background #2B0813 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent via-55% via-[#2B0813]/60 via-80% to-[#2B0813]" />
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP PHOTO COLUMN (50% left split layout) */}
      {/* ========================================================================= */}
      <div className="hidden md:block relative md:w-[50%] md:h-auto overflow-hidden">
        <Image
          src="/rozbir/vik.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-[center_20%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#FAF6EE]/20" />
      </div>

      {/* ========================================================================= */}
      {/* 3. MOBILE & DESKTOP CONTENT STACK */}
      {/* ========================================================================= */}
      <div className="relative z-10 flex flex-col justify-between w-full md:w-[50%] px-4 sm:px-8 md:px-12 lg:px-16 pt-3.5 pb-6 sm:pb-8 md:py-16 min-h-[100dvh] md:min-h-0">
        {/* --- TOP BADGES PILL --- */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center md:justify-start w-full mb-1"
        >
          <div className="inline-flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#2B0813] text-[10px] sm:text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-lg border border-black/10 tracking-wide">
            <span className="text-[#451220] uppercase font-extrabold">Інтенсив · 4 уроки</span>
            <span className="text-[#2B0813]/30 font-light">|</span>
            <span className="text-[#2B0813]/80 uppercase">Система контенту 2026</span>
          </div>
        </motion.div>

        {/* --- FLEXIBLE SPACER (Keeps face 100% visible on mobile) --- */}
        <div className="flex-1 min-h-[22vh] sm:min-h-[26vh] md:hidden" />

        {/* --- MAIN HERO TEXT & ACTIONS --- */}
        <div className="relative max-w-xl mx-auto md:mx-0 w-full text-left">
          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-[23px] sm:text-2xl md:text-4xl lg:text-[40px] font-bold leading-[1.2] tracking-tight mb-2.5 text-white md:text-[#2B0813] drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:drop-shadow-none"
          >
            Перестань витрачати години на контент,{" "}
            <span className="italic block mt-0.5 text-[#f5d0a6] md:text-[#451220] font-normal">
              який не дає результату
            </span>
          </motion.h1>

          {/* Subtitle & Logic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-3 font-manrope text-xs sm:text-sm md:text-base leading-relaxed text-white/95 md:text-[#2B0813]/85"
          >
            <p className="font-medium text-white md:text-[#451220] bg-white/10 md:bg-[#451220]/5 p-2.5 sm:p-3 rounded-xl border border-white/15 md:border-[#451220]/15 shadow-sm leading-relaxed backdrop-blur-sm text-[12px] sm:text-[13.5px] md:text-[15px]">
              За 4 уроки побудуєш систему, з якою зможеш швидко створювати контент, залучати нову аудиторію та приводити клієнтів у блог — без постійного хаосу й виснаження.
            </p>
          </motion.div>

          {/* Price Row & Trust features & CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col gap-2 sm:gap-3"
          >
            {/* Price Row & Countdown Timer */}
            <div className="flex items-center gap-2.5 font-manrope">
              <div className="flex items-baseline gap-1.5">
                <span className="font-extrabold text-2xl sm:text-3xl text-[#FFF500] md:text-[#451220]">9€</span>
                <span className="line-through text-xs sm:text-sm opacity-50 text-white md:text-[#2B0813]">49€</span>
              </div>
              <span className="rounded-md bg-[#16A34A] text-white text-[9px] sm:text-[11px] font-extrabold px-2 py-0.5 uppercase tracking-wide">
                -80% ЗНИЖКА
              </span>
              <div className="ml-auto inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#f5d0a6] md:text-[#451220]">
                <Clock size={12} className="animate-pulse" />
                <span>ще {formattedTime}</span>
              </div>
            </div>

            {/* Trust Features */}
            <div className="flex items-center justify-between sm:justify-start sm:gap-6 text-white/80 md:text-[#2B0813]/70 text-[10px] sm:text-xs font-manrope py-0.5">
              <span className="flex items-center gap-1">
                <Video size={12} />
                4 відео-уроки
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <GraduationCap size={12} />
                Авторська система
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Sparkles size={12} />
                100% результат
              </span>
            </div>

            {/* Main Action Button */}
            <button
              onClick={onOpenCheckout}
              className="w-full inline-flex items-center justify-center gap-2.5 rounded-full py-3.5 sm:py-4 px-6 text-sm sm:text-base font-extrabold uppercase tracking-wide shadow-2xl transition-all duration-300 bg-[#5c172a] md:bg-[#451220] hover:bg-[#380d17] md:hover:bg-[#2B0813] text-[#FAF6EE] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20 md:border-none"
            >
              <span>Хочу систему</span>
              <ArrowRight size={17} />
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
