"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Clock, ChevronDown, CheckCircle2, ArrowRight } from "lucide-react";

interface IntensiveCurriculumProps {
  onOpenCheckout: () => void;
}

const lessons = [
  {
    num: "01",
    time: "~20 хв",
    title: "УРОК 1. ДІАГНОСТИКА БЛОГУ",
    topics: [
      "Розберемо, як зараз працює контент у 2026 році",
      "Подивимося, чому один контент отримує увагу, а інші — ні",
      "Знайдемо, що саме не працює у твоєму блозі"
    ],
    result: "Ти чітко розумієш, що зараз працює, що заважає твоєму блогу рости та що потрібно виправити."
  },
  {
    num: "02",
    time: "~20 хв",
    title: "УРОК 2. ІДЕЇ ТА ФОРМАТИ",
    topics: [
      "Розберемо, де брати ідеї для контенту без виснажливих роздумів",
      "Покажемо, як із однієї теми зробити декілька різних типів контенту",
      "Розберемо, коли краще використовувати Reels, каруселі та Stories",
      "Покажемо, як створювати контент під різні задачі (охоплення, довіра, продаж)"
    ],
    result: "У тебе буде готова база тем і чітке розуміння, що та в якому форматі створювати щотижня."
  },
  {
    num: "03",
    time: "~20 хв",
    title: "УРОК 3. СТВОРЕННЯ КОНТЕНТУ",
    topics: [
      "Покажемо, як створювати Reels, які хочеться додивитися до кінця",
      "Розберемо структуру каруселі від першого до останнього слайду",
      "Покажемо, як знімати та монтувати відео без складного монтажу та дорогого світла",
      "Розберемо, як зробити контент цікавим, а не просто сухою «користю»"
    ],
    result: "Ти зможеш самостійно швидко створювати Reels і каруселі та одразу тестувати їх у своєму блозі."
  },
  {
    num: "04",
    time: "~20 хв",
    title: "УРОК 4. КОНТЕНТ → АУДИТОРІЯ → КЛІЄНТИ",
    topics: [
      "Розберемо, який контент приводить нових цільових людей",
      "Покажемо, як вести людину від першого випадкового перегляду до повної довіри",
      "Розберемо, як через контент ненав'язливо підводити до своїх послуг або продукту",
      "Покажемо, як екологічно переводити аудиторію в Директ і продажі"
    ],
    result: "Ти збереш просту систему ведення блогу, де розумієш, що створювати, навіщо це робити та як контент приводить тобі клієнтів."
  }
];

export function IntensiveCurriculum({ onOpenCheckout }: IntensiveCurriculumProps) {
  const [openLesson, setOpenLesson] = useState<number | null>(0); // First open by default

  const toggle = (idx: number) => {
    setOpenLesson(openLesson === idx ? null : idx);
  };

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <BookOpen size={14} />
            <span>Програма навчання</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            ЩО ВСЕРЕДИНІ — <span className="text-[#fff500]">4 УРОКИ ПО 20 ХВ</span>
          </h2>
          <p className="font-manrope text-sm sm:text-base text-white/70 mt-3">
            Чітка концентрована система без води та зайвої теорії
          </p>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        {/* Lessons Accordion List */}
        <div className="space-y-4 mb-12">
          {lessons.map((lesson, idx) => {
            const isOpen = openLesson === idx;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className={`border-2 transition-all duration-300 ${
                  isOpen
                    ? "bg-[#18181b] border-[#fff500] shadow-[6px_6px_0px_rgba(0,0,0,0.5)]"
                    : "bg-[#141416] border-white/10 hover:border-white/25"
                }`}
              >
                {/* Header button */}
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-7 flex items-center justify-between text-left gap-4 cursor-pointer"
                >
                  <div className="flex items-center gap-4 sm:gap-6">
                    <span
                      className={`font-inter text-2xl sm:text-3xl font-black transition-colors ${
                        isOpen ? "text-[#fff500]" : "text-white/40"
                      }`}
                    >
                      {lesson.num}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1 font-manrope text-[11px] font-bold text-white/50 bg-white/5 px-2 py-0.5 border border-white/10 uppercase">
                          <Clock size={11} /> {lesson.time}
                        </span>
                      </div>
                      <h3 className="font-inter text-base sm:text-xl font-bold text-white uppercase tracking-tight">
                        {lesson.title}
                      </h3>
                    </div>
                  </div>

                  <div
                    className={`w-8 h-8 rounded-none flex items-center justify-center border transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-[#fff500] text-black border-[#fff500]"
                        : "bg-white/5 text-white/60 border-white/15"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </div>
                </button>

                {/* Body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-7 pt-0 border-t border-white/10 space-y-4">
                        <ul className="space-y-2.5 pt-4">
                          {lesson.topics.map((t, tIdx) => (
                            <li
                              key={tIdx}
                              className="flex items-start gap-3 font-manrope text-sm sm:text-base text-white/85"
                            >
                              <span className="text-[#fff500] font-bold mt-0.5">—</span>
                              <span>{t}</span>
                            </li>
                          ))}
                        </ul>

                        {/* Result pill */}
                        <div className="p-4 bg-black/60 border-l-3 border-[#fff500] mt-4">
                          <p className="font-manrope text-xs sm:text-sm font-bold text-[#fff500] uppercase tracking-wider mb-1">
                            🎯 Твій результат після уроку:
                          </p>
                          <p className="font-manrope text-sm sm:text-base text-white/90 font-medium">
                            {lesson.result}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Final Result Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#1a1a1e] via-[#202026] to-[#1a1a1e] border-2 border-[#fff500] p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] text-center flex flex-col items-center"
        >
          <p className="font-manrope text-xs sm:text-sm font-extrabold text-[#fff500] uppercase tracking-widest mb-2">
            Головний підсумок інтенсиву
          </p>
          <h3 className="font-inter text-xl sm:text-3xl font-black text-white uppercase leading-snug mb-6 max-w-3xl">
            Після 4 уроків у тебе буде розуміння, який контент працює у 2026 році і як робити результат у вигляді нової аудиторії та продажів
          </h3>

          <button
            onClick={onOpenCheckout}
            className="w-full max-w-md py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Забрати всі 4 уроки за 9€ →</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
