"use client";

import React from "react";
import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Sparkles, ArrowRight, Flame } from "lucide-react";

interface StyleProgramProps {
  onOpenModal: () => void;
}

export function StyleProgram({ onOpenModal }: StyleProgramProps) {
  const days = [
    {
      day: "ДЕНЬ 1",
      badge: "Вступний урок · 10 хв",
      title: "Вступний урок, після якого ти побачиш, що зараз не так із твоїм блогом",
      intro: "За 10 хвилин розберемо:",
      points: [
        "чому красивий візуал ще не означає впізнаваність",
        "чому блог може виглядати «як у всіх»",
        "що саме заважає тобі виділятися",
      ],
      result: "Ти зрозумієш, що зараз потрібно змінити у своєму блозі, щоб він почав відображати тебе, а не просто повторювати інших.",
    },
    {
      day: "ДЕНЬ 2",
      badge: "Особистий досвід та звички",
      title: "Моє особисте відео про звички, які спрощують мені життя та роботу з контентом",
      intro: "Покажу на власному прикладі:",
      points: [
        "як не залежати від натхнення",
        "як спрощувати роботу з контентом",
        "чому не потрібно повторювати інших",
        "як рухатися до результату без постійного хаосу",
      ],
      result: "Ти побачиш, що блог не має забирати весь твій час і сили, якщо правильно вибудувати свій підхід.",
    },
    {
      day: "ДЕНЬ 3",
      badge: "Майстер-клас + Розбори",
      title: "Майстер-клас, після якого ти по-іншому подивишся на свій візуал",
      intro: "Разом розберемо:",
      points: [
        "як знайти власний стиль",
        "як працювати з референсами",
        "як зробити блог цілісним",
        "як через візуал виділятися серед конкурентів",
        "як упакувати себе та свою експертність",
        "і розберемо реальні блоги учасників прямо на майстер-класі",
      ],
      result: "Ти зрозумієш, у якому напрямку рухатися, щоб твій блог виглядав як твій, а не як ще один акаунт із сотень схожих.",
    },
  ];

  return (
    <section className="relative py-8 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-2">
          <Calendar size={12} />
          3-ДЕННИЙ ІНТЕНСИВ
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#231815] tracking-tight">
          До блогу, <span className="italic text-[#C85A17]">який запам'ятовують</span>
        </h2>
      </div>

      {/* Program Cards */}
      <div className="space-y-5">
        {days.map((d, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="bg-white rounded-3xl p-5 sm:p-6 border border-[#EADBCE] shadow-[0_8px_24px_rgba(163,61,18,0.06)] relative overflow-hidden"
          >
            {/* Day Header Row */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="bg-[#1F1410] text-[#F5C7A3] font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider border border-[#3A261D]">
                {d.day}
              </span>
              <span className="text-[11px] font-semibold text-[#A33D12] bg-[#FDF2E9] border border-[#F5D6C1] px-2.5 py-0.5 rounded-full">
                {d.badge}
              </span>
            </div>

            {/* Day Title */}
            <h3 className="font-playfair text-base sm:text-lg font-bold text-[#231815] leading-snug mb-3">
              {d.title}
            </h3>

            {/* Intro label */}
            <div className="text-xs font-bold text-[#231815]/70 uppercase tracking-wider mb-2 font-manrope">
              {d.intro}
            </div>

            {/* Points List */}
            <ul className="space-y-2 mb-4 font-manrope text-xs sm:text-sm text-[#231815]/85">
              {d.points.map((pt, pIdx) => (
                <li key={pIdx} className="flex items-start gap-2">
                  <CheckCircle2 size={15} className="text-[#D96B27] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </li>
              ))}
            </ul>

            {/* Outcome / Result Card */}
            <div className="bg-[#FEF5EE] border border-[#F5D6C1] rounded-2xl p-3.5 text-xs sm:text-sm text-[#231815] font-manrope">
              <div className="text-[10px] font-black text-[#A33D12] uppercase tracking-widest mb-1 flex items-center gap-1">
                <Sparkles size={12} className="text-[#D96B27]" />
                РЕЗУЛЬТАТ:
              </div>
              <p className="font-semibold leading-relaxed text-[#231815]/90">
                {d.result}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Urgency Micro Banner */}
      <div className="mt-5 p-3 bg-[#FEF5EE] border border-[#F5D6C1] rounded-2xl flex items-center justify-between text-xs font-manrope">
        <span className="flex items-center gap-1.5 font-bold text-[#A33D12]">
          <Flame size={14} className="text-[#D96B27]" />
          Залишився 21 безкоштовний слот із 100
        </span>
        <span className="font-black text-[#D96B27]">0 грн</span>
      </div>

      {/* Mid CTA Button */}
      <div className="pt-3">
        <button
          onClick={onOpenModal}
          className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_14px_34px_rgba(200,90,23,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
        >
          <span>Хочу знайти свій стиль безкоштовно</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </section>
  );
}
