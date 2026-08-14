"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";

interface IntensiveTransformationProps {
  onOpenCheckout: () => void;
}

const points = [
  "Ти перестанеш сприймати охоплення як випадковість.",
  "Замість чергових порад «пости о 19:00», трендових звуків і спроб вгадати алгоритми ти навчишся бачити, що саме змушує контент працювати — і як це повторювати у своїй ніші.",
  "Ти розбереш власний контент, знайдеш закономірності у своїх результатах і побудуєш систему, за якою зможеш створювати наступні пости, рілси та сторіс не навмання, а з конкретною логікою.",
  "Більше контролю над тим, що ти публікуєш і який результат це дає."
];

export function IntensiveTransformation({ onOpenCheckout }: IntensiveTransformationProps) {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            ЩО ЗМІНИТЬСЯ<br />
            <span className="italic font-normal text-[#451220]">після 4 уроків</span>
          </h2>
        </div>

        {/* Checkmark List */}
        <div className="space-y-4 max-w-3xl mx-auto mb-10">
          {points.map((p, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#2B0813]/10 shadow-sm"
            >
              <div className="w-7 h-7 rounded-full bg-[#451220] text-[#FAF6EE] flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Check size={16} />
              </div>
              <p className="font-manrope text-base md:text-lg text-[#2B0813]/90 leading-relaxed font-medium">
                {p}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Хочу побачити свою логіку →</span>
          </button>
        </div>
      </div>
    </section>
  );
}
