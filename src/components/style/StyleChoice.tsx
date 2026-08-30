"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

export function StyleChoice() {
  return (
    <section className="relative py-6 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-2">
          ТВІЙ ВИБІР
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#231815] tracking-tight">
          3 дні, <span className="italic text-[#C85A17]">після яких</span>
        </h2>
      </div>

      <div className="space-y-4">
        {/* Option 1: The Winning Choice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-[#FEF5EE] to-[#FDF0E2] rounded-3xl p-6 border-2 border-[#D96B27] shadow-[0_8px_24px_rgba(217,107,39,0.14)] relative"
        >
          <div className="flex items-center gap-2 mb-2 text-[#A33D12] font-extrabold text-xs uppercase tracking-widest">
            <span className="w-6 h-6 rounded-full bg-[#D96B27] text-white flex items-center justify-center font-bold text-xs shadow-sm">
              ✓
            </span>
            <span>ТИ АБО:</span>
          </div>
          <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#231815] leading-snug">
            Матимеш чітке розуміння, що змінити у своєму блозі, як знайти власний стиль і перестати створювати контент навмання
          </h3>
        </motion.div>

        {/* Option 2: The Stagnant Choice */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white rounded-3xl p-6 border border-[#EADBCE] opacity-70"
        >
          <div className="flex items-center gap-2 mb-2 text-[#231815]/60 font-extrabold text-xs uppercase tracking-widest">
            <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-xs">
              ✕
            </span>
            <span>АБО:</span>
          </div>
          <p className="font-manrope text-sm sm:text-base text-[#231815]/80 leading-relaxed">
            І далі зберігатимеш сотні референсів, копіюватимеш тренди і думатимеш, чому твій блог не виділяється
          </p>
        </motion.div>

        {/* Verdict Badge */}
        <div className="text-center pt-2">
          <span className="inline-flex items-center gap-2 bg-[#1F1410] text-[#F5C7A3] font-black text-xs sm:text-sm uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-lg border border-[#3A261D]">
            <span>🍂 ОБИРАЙ ПЕРШЕ</span>
            <ArrowDown size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
