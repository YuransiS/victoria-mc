"use client";

import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function IntensiveGuarantee() {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#451220] text-[#FAF6EE] relative">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-[#FAF6EE] text-3xl font-bold font-manrope mx-auto">
            ✓
          </div>

          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            100% БЕЗУМОВНА ГАРАНТІЯ<br />
            <span className="italic font-normal">без зайвих питань</span>
          </h2>

          <div className="rounded-2xl border border-[#FAF6EE]/30 p-7 sm:p-10 max-w-2xl mx-auto bg-[#2B0813]/60 text-left font-manrope space-y-4">
            <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#E5B887]">
              Подивись 4 уроки і зроби ДЗ з першого
            </h3>
            <p className="text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed">
              Якщо не спрацює — я поверну всю ціну <strong>9€</strong>, а бонуси вартістю <strong>125€</strong> залишаться тобі.
            </p>
            <p className="text-xs text-[#FAF6EE]/70 uppercase tracking-widest pt-2 border-t border-white/10">
              Ти нічим не ризикуєш. Усі ризики я беру на себе.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
