"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Clock, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";
import sharedStyles from "./IntensiveShared.module.css";

interface IntensiveHeroProps {
  onOpenCheckout: () => void;
}

export function IntensiveHero({ onOpenCheckout }: IntensiveHeroProps) {
  const { formattedTime } = use10MinTimer();

  return (
    <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#101012] pt-20 pb-16 px-4 sm:px-6">
      {/* Background Image Layer with Gradient Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/rozbir/IMG_2534.jpg"
          alt="Вікторія Мещерякова"
          fill
          priority
          className="object-cover object-center md:object-[center_20%] opacity-25 filter grayscale contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#101012]/90 via-[#101012]/80 to-[#101012]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#101012_80%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs sm:text-sm font-black uppercase tracking-[0.2em] mb-6 shadow-[0_0_20px_rgba(255,245,0,0.15)]"
        >
          <Zap size={14} className="text-[#fff500]" />
          <span>ІНТЕНСИВ · 4 УРОКИ</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-inter text-3xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-tight leading-[1.15] mb-6 text-balance"
        >
          Абсолютно випадковий контент може набрати мільйони.{" "}
          <span className="text-[#fff500] block mt-1">
            А той, у який ти вклала душу — 5 лайків
          </span>
        </motion.h1>

        {/* Subtitle / Problem & Promise */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="max-w-2xl space-y-4 mb-8 text-white/85 font-manrope text-base sm:text-lg leading-relaxed"
        >
          <p className="border-l-2 border-[#fff500] pl-4 text-left sm:text-center sm:border-l-0 sm:pl-0 font-medium text-white/90">
            І поки ти не розумієш чому — кожна наступна одиниця контенту це не система, а випадковість.
          </p>
          <p className="font-bold text-white text-lg sm:text-xl bg-white/5 py-3 px-5 border border-white/10">
            За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів
          </p>
        </motion.div>

        {/* Price & Offer Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="w-full max-w-md bg-[#18181a]/90 border-2 border-white/15 p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] mb-6 flex flex-col items-center"
        >
          <div className="flex items-center justify-center gap-4 mb-3">
            <span className="font-manrope text-lg text-white/40 line-through font-bold">
              49€
            </span>
            <span className="px-2.5 py-0.5 bg-[#fff500] text-black font-manrope text-xs font-black uppercase tracking-wider">
              -82%
            </span>
            <span className="font-inter text-4xl sm:text-5xl font-black text-[#fff500]">
              9€
            </span>
          </div>

          {/* Countdown Timer */}
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-manrope font-bold text-white/80 uppercase tracking-wider mb-6 bg-black/40 px-4 py-2 border border-white/10">
            <Clock size={16} className="text-[#fff500] animate-pulse" />
            <span>
              Ціна діє ще <span className="text-[#fff500] font-black">{formattedTime}</span>
            </span>
          </div>

          {/* CTA Button */}
          <button
            onClick={onOpenCheckout}
            className="w-full py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-base sm:text-lg uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.4)] hover:bg-white hover:text-black transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3"
          >
            <span>Хочу систему</span>
            <ArrowRight size={20} />
          </button>
        </motion.div>

        {/* Micro guarantees */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs font-manrope text-white/50 uppercase tracking-widest font-semibold"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-[#fff500]" /> 100% гарантія повернення
          </span>
          <span className="flex items-center gap-1.5">
            <Zap size={14} className="text-[#fff500]" /> Доступ назавжди
          </span>
          <span className="flex items-center gap-1.5">
            🎁 4 бонуси на 125€ безкоштовно
          </span>
        </motion.div>
      </div>
    </section>
  );
}
