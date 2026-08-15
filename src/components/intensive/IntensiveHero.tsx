"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";

interface IntensiveHeroProps {
  onOpenCheckout: () => void;
}

export function IntensiveHero({ onOpenCheckout }: IntensiveHeroProps) {
  const { formattedTime } = use10MinTimer();

  return (
    <section className="relative min-h-[92svh] md:min-h-[88svh] w-full overflow-hidden bg-[#FAF6EE] text-[#2B0813] md:flex md:items-stretch">
      {/* Photo Column / Background on mobile with subtle blur */}
      <div className="absolute inset-0 md:relative md:w-[50%] md:h-auto overflow-hidden">
        <Image
          src="/rozbir/IMG_2534.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-[center_15%] md:object-center blur-[8px] md:blur-none scale-110 md:scale-100 opacity-75 md:opacity-100"
        />
        {/* Mobile Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1d050d] via-[#2B0813]/85 to-[#1d050d]/50 backdrop-blur-sm md:hidden" />
        {/* Desktop Gradient Blend */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#FAF6EE]/20" />
      </div>

      {/* Content Column */}
      <div className="relative z-10 flex flex-col justify-end md:justify-center md:w-[50%] px-4 sm:px-8 md:px-10 lg:px-14 pt-12 pb-14 md:py-16 text-[#FAF6EE] md:text-[#2B0813]">
        <div className="max-w-xl mx-auto md:mx-0 text-center md:text-left bg-[#1d050d]/80 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-5 sm:p-7 rounded-3xl border border-white/15 md:border-none shadow-2xl md:shadow-none">
          {/* Pill Badges */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-5"
          >
            <span className="rounded-full bg-[#5c172a] text-[#FAF6EE] text-[10px] sm:text-xs font-extrabold tracking-[0.18em] uppercase px-4 py-1.5 shadow-md border border-white/20">
              ІНТЕНСИВ · 4 УРОКИ
            </span>
            <span className="rounded-full bg-[#1c080f]/80 md:bg-[#451220]/10 text-[#FAF6EE] md:text-[#451220] text-[10px] sm:text-xs font-bold tracking-[0.14em] uppercase px-4 py-1.5 border border-white/20 md:border-current/20 backdrop-blur">
              СИСТЕМА КОНТЕНТУ 2026
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-[42px] font-bold leading-[1.2] tracking-tight mb-4 text-white md:text-[#2B0813] drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] md:drop-shadow-none"
          >
            Абсолютно випадковий контент може набрати мільйони.{" "}
            <span className="italic block mt-1.5 text-[#f5d0a6] md:text-[#451220] font-normal">
              А той, у який ти вклала душу — 5 лайків
            </span>
          </motion.h1>

          {/* Subtitle & Logic */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3 mb-6 font-manrope text-xs sm:text-sm md:text-base leading-relaxed text-[#FAF6EE]/95 md:text-[#2B0813]/85"
          >
            <p className="font-medium drop-shadow-[0_1px_6px_rgba(0,0,0,0.9)] md:drop-shadow-none">
              І поки ти не розумієш чому — кожна наступна одиниця контенту це не система, а випадковість.
            </p>
            <p className="font-semibold text-white md:text-[#451220] bg-[#451220]/90 md:bg-[#451220]/5 p-3.5 rounded-2xl border border-white/20 md:border-[#451220]/15 shadow-lg">
              За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів
            </p>
          </motion.div>

          {/* Price & CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col items-center md:items-start gap-4"
          >
            <button
              onClick={onOpenCheckout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#5c172a] hover:bg-[#380d17] text-[#FAF6EE] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-white/20"
            >
              <span>Хочу систему</span>
              <ArrowRight size={18} />
            </button>

            {/* Price Row & Timer */}
            <div className="flex items-center gap-4 text-xs sm:text-sm font-manrope">
              <div className="flex items-center gap-2">
                <span className="line-through opacity-60 text-[#FAF6EE] md:text-[#2B0813]">49€</span>
                <span className="font-bold text-lg sm:text-xl text-[#FFF500] md:text-[#451220]">9€</span>
              </div>
              <span className="opacity-40">·</span>
              <div className="inline-flex items-center gap-1.5 font-semibold text-[#f5d0a6] md:text-[#451220]">
                <Clock size={14} className="animate-pulse" />
                <span>Ціна діє ще <strong className="font-bold">{formattedTime}</strong></span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
