"use client";

import React from "react";
import { motion } from "framer-motion";
import { Eye } from "lucide-react";

export function StyleInsight() {
  return (
    <section className="relative py-6 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Dark Framer-Style Warm Espresso Contrast Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-[#1F1410] text-white rounded-3xl p-6 sm:p-7 border border-[#3A261D] shadow-xl relative overflow-hidden"
      >
        {/* Subtle warm amber glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#D96B27]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Small Tag */}
        <div className="inline-flex items-center gap-1.5 bg-white/10 text-[#F5C7A3] px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-4 border border-white/10">
          <Eye size={13} />
          <span>ПРАКТИЧНИЙ ФОРМАТ</span>
        </div>

        {/* Title */}
        <h2 className="font-playfair text-xl sm:text-2xl font-bold leading-snug mb-3">
          Ти не <span className="italic text-[#F5C7A3]">«просто подивишся відео»</span> — ти зрозумієш, що змінити у своєму блозі вже зараз
        </h2>

        {/* Route Steps Preview */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-4">
          <div className="text-[11px] font-extrabold text-[#F5C7A3] uppercase tracking-wider mb-2">
            За 3 дні в тебе буде маршрут:
          </div>
          <div className="flex flex-col gap-2 font-manrope text-xs sm:text-sm text-white/90">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#D96B27]/30 text-[#F5C7A3] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#D96B27]/50">
                1
              </span>
              <span>Зрозуміти, що зараз не так із блогом</span>
            </div>
            <div className="text-white/40 pl-2">↓</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#D96B27]/30 text-[#F5C7A3] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#D96B27]/50">
                2
              </span>
              <span>Спростити роботу з контентом</span>
            </div>
            <div className="text-white/40 pl-2">↓</div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#D96B27]/30 text-[#F5C7A3] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[#D96B27]/50">
                3
              </span>
              <span>Знайти власний стиль і зібрати цілісний візуал</span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
