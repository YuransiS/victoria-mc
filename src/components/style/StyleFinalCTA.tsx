"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2, Flame } from "lucide-react";

interface StyleFinalCTAProps {
  onOpenModal: () => void;
}

export function StyleFinalCTA({ onOpenModal }: StyleFinalCTAProps) {
  return (
    <section className="relative py-8 pb-16 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Final Card Container (Autumn Sunset Card) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-b from-[#FCE3CD] via-[#FDF0E2] to-white rounded-3xl p-6 sm:p-8 border border-[#F5C7A3] shadow-[0_14px_42px_rgba(163,61,18,0.12)] text-center relative overflow-hidden"
      >
        {/* Floating Sparkle Badge */}
        <div className="inline-flex items-center gap-1.5 bg-[#1F1410] text-[#F5C7A3] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-[0.16em] mb-4 shadow-md border border-[#3A261D]">
          <Sparkles size={13} />
          <span>ТВІЙ РЕЗУЛЬТАТ</span>
        </div>

        {/* Main Headline */}
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold leading-tight text-[#231815] mb-3">
          Почни змінювати свій блог{" "}
          <span className="italic text-[#C85A17]">не з нового шаблону</span>,{" "}
          <span className="block mt-1">
            а з розуміння, яким він має бути саме для тебе
          </span>
        </h2>

        {/* Tagline */}
        <p className="font-manrope font-extrabold text-xs sm:text-sm uppercase tracking-wider text-[#A33D12] mb-5 bg-white/70 backdrop-blur-sm py-2 px-4 rounded-full inline-block border border-[#F5D6C1]">
          3 дні. 3 кроки. Один зрозумілий маршрут.
        </p>

        {/* Urgency Counter Badge */}
        <div className="bg-[#FEF5EE] border border-[#F5D6C1] rounded-2xl p-3.5 mb-5 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-black text-[#A33D12] uppercase mb-1">
            <Flame size={14} className="text-[#D96B27]" />
            <span>Безкоштовно для перших 100 учасників</span>
          </div>
          <p className="text-xs text-[#2D1E18]/80 font-medium font-manrope">
            Вже зайнято <strong>79 з 100 місць</strong>. Залишився 21 квиток за <strong>0 грн</strong> замість 690 грн!
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onOpenModal}
          className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-sm sm:text-base uppercase tracking-wider py-4 px-8 rounded-2xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_14px_34px_rgba(200,90,23,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <span>Хочу знайти свій стиль безкоштовно</span>
          <ArrowRight size={18} />
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-4 text-[#2D1E18]/70 text-xs font-manrope font-semibold pt-4">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-[#D96B27]" />
            100% практично
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <CheckCircle2 size={14} className="text-[#D96B27]" />
            Миттєвий старт
          </span>
        </div>
      </motion.div>
    </section>
  );
}
