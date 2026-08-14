"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCheck } from "lucide-react";

interface IntensiveTransformationProps {
  onOpenCheckout: () => void;
}

const transformationPoints = [
  {
    title: "Охоплення перестануть бути випадковістю",
    desc: "Замість чергових порад «пости о 19:00», трендових звуків і спроб вгадати алгоритми ти навчишся бачити, що саме змушує контент працювати — і як це повторювати у своїй ніші."
  },
  {
    title: "Побудуєш свою працюючу логіку",
    desc: "Ти розбереш власний контент, знайдеш закономірності у своїх результатах і побудуєш систему, за якою зможеш створювати наступні пости, рілси та сторіс не навмання, а з конкретною логікою."
  },
  {
    title: "Повний контроль над публікаціями",
    desc: "Більше контролю над тим, що ти публікуєш і який результат це дає — без стресу, вигорання та марнування годин на пусті охоплення."
  }
];

export function IntensiveTransformation({ onOpenCheckout }: IntensiveTransformationProps) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} />
            <span>Трансформація підходу</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            ЩО ЗМІНИТЬСЯ <span className="text-[#fff500]">ПІСЛЯ 4 УРОКІВ</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {transformationPoints.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#18181a] border-t-4 border-t-[#fff500] border-x border-b border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,0.4)]"
            >
              <div>
                <div className="w-10 h-10 bg-white/5 border border-white/10 flex items-center justify-center text-[#fff500] font-inter font-black text-lg mb-4">
                  0{idx + 1}
                </div>
                <h3 className="font-inter text-lg sm:text-xl font-bold text-white mb-3 leading-snug">
                  {item.title}
                </h3>
                <p className="font-manrope text-sm sm:text-base text-white/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-3 px-10 py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer"
          >
            <span>Хочу побачити свою логіку →</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
