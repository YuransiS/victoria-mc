"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass } from "lucide-react";

export function StyleRoadmap() {
  const steps = [
    {
      num: "01",
      title: "ДІАГНОСТИКА БЛОГУ",
      desc: "Зрозумієш, чому твій контент може бути гарним, але не запам'ятовуватися.",
    },
    {
      num: "02",
      title: "КОНТЕНТ БЕЗ ХАОСУ",
      desc: "Побачиш, як спростити роботу з контентом і не витрачати години на кожну публікацію.",
    },
    {
      num: "03",
      title: "ВЛАСНИЙ СТИЛЬ І ВІЗУАЛ",
      desc: "Дізнаєшся, як знайти свою подачу та зробити блог цілісним і впізнаваним.",
    },
  ];

  return (
    <section className="relative py-6 px-4 max-w-lg md:max-w-xl mx-auto">
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#F0FAF3] text-[#06874F] border border-[#C9F7DB] px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-2">
          <Compass size={12} />
          ПРОГРАМА В 3 КРОКАХ
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#142117] tracking-tight">
          Маршрут, <span className="italic text-[#06874F]">який пройдемо</span>
        </h2>
      </div>

      {/* 3 Step Cards */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-5 border border-[#DFEADF] shadow-[0_4px_16px_rgba(13,78,42,0.04)] flex items-start gap-4 hover:border-[#18B66F]/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-[#142117] text-[#7EDEAA] flex items-center justify-center font-extrabold text-sm shrink-0 shadow-md">
              {step.num}
            </div>
            <div>
              <h3 className="font-manrope text-sm sm:text-base font-extrabold uppercase tracking-wide text-[#142117] mb-1">
                {step.title}
              </h3>
              <p className="font-manrope text-xs sm:text-sm text-[#142117]/80 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
