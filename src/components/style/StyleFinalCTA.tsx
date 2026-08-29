"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface StyleFinalCTAProps {
  onOpenModal: () => void;
}

export function StyleFinalCTA({ onOpenModal }: StyleFinalCTAProps) {
  return (
    <section className="relative py-8 pb-16 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Final Card Container (Matches Framer Bottom Card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-b from-[#ACF2C6] via-[#DCF9E6] to-white rounded-3xl p-6 sm:p-8 border border-[#9EE2BA] shadow-[0_14px_42px_rgba(13,78,42,0.12)] text-center relative overflow-hidden"
      >
        {/* Floating Sparkle Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#142117] text-[#7EDEAA] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.16em] mb-4 shadow-md">
          <Sparkles size={13} />
          <span>ТВІЙ РЕЗУЛЬТАТ</span>
        </div>

        {/* Main Headline */}
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold leading-tight text-[#142117] mb-3">
          Почни змінювати свій блог{" "}
          <span className="italic text-[#06874F]">не з нового шаблону</span>,{" "}
          <span className="block mt-1">
            а з розуміння, яким він має бути саме для тебе
          </span>
        </h2>

        {/* Tagline */}
        <p className="font-manrope font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#06874F] mb-6 bg-white/60 backdrop-blur-sm py-2 px-4 rounded-full inline-block border border-[#C9F7DB]">
          3 дні. 3 кроки. Один зрозумілий маршрут.
        </p>

        {/* CTA Button */}
        <button
          onClick={onOpenModal}
          className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#18B66F] to-[#06874F] hover:from-[#159f61] hover:to-[#057343] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider py-4 px-8 rounded-2xl shadow-[0_10px_28px_rgba(24,182,111,0.4)] hover:shadow-[0_14px_34px_rgba(24,182,111,0.5)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <span>Хочу знайти свій стиль</span>
          <ArrowRight size={18} />
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[#142117]/70 text-xs font-manrope font-semibold pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-[#18B66F]" />
            100% практично
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-[#18B66F]" />
            Швидкий результат
          </span>
        </div>
      </motion.div>
    </section>
  );
}
