"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Gift } from "lucide-react";

export function IntensiveGuarantee() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1c1c20] to-[#161619] border-2 border-white/20 p-8 sm:p-12 shadow-[10px_10px_0px_rgba(0,0,0,0.7)] text-center relative overflow-hidden"
        >
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#fff500]/5 blur-[60px] pointer-events-none" />

          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#fff500] text-black mb-6 shadow-lg">
            <ShieldCheck size={36} />
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-4">
            ✓ 100% БЕЗУМОВНА ГАРАНТІЯ
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 font-manrope text-base sm:text-lg text-white/90 leading-relaxed mb-6">
            <p className="font-bold text-white text-lg sm:text-xl">
              Подивись 4 уроки і зроби ДЗ з першого.
            </p>
            <p>
              Якщо не спрацює — я поверну всю ціну <span className="text-[#fff500] font-black">9€</span>, а бонуси вартістю <span className="text-[#fff500] font-black">125€</span> залишаться тобі у подарунок.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 bg-black/50 border border-white/10 px-4 py-2 text-xs sm:text-sm font-manrope text-white/70 uppercase tracking-widest font-semibold">
            <Gift size={15} className="text-[#fff500]" />
            <span>Ти нічим не ризикуєш. Усі ризики я беру на себе</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
