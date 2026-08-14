"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, Clock, ArrowRight, Check } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";

interface IntensiveBonusesProps {
  onOpenCheckout: () => void;
}

const bonusesData = [
  {
    num: "Бонус 1",
    title: "Як я створюю контент за 30 хвилин на день",
    desc: "Покажу свою реальну систему роботи, як я поєдную життя матері двох дітей і ведення блогу, поділюсь 11-ти річним досвідом створення контенту.",
    oldPrice: "30€",
    cardBg: "bg-[#451220] border-[#451220]/30"
  },
  {
    num: "Бонус 2",
    title: "Ефір з розборами профілей",
    desc: "Покроковий аналіз реальних профілей з покращеннями від мене під різні ніші. Після цього розбору ти по-іншому подивишся на власний блог. Кожен знайде для себе рішення і інструменти для контенту та візуалу.",
    oldPrice: "30€",
    cardBg: "bg-[#451220] border-[#451220]/30"
  },
  {
    num: "Бонус 3",
    title: "Формула працюючих заголовків, які не хочеться прогортати",
    desc: "Ти отримаєш готову формулу створення сильних заголовків для офферів і контенту + приклади її застосування в різних нішах. Береш формулу — підставляєш свою тему — отримуєш заголовок, який чіпляє конкретну проблему або бажання твоєї аудиторії.",
    oldPrice: "40€",
    cardBg: "bg-[#2B0813] border-[#2B0813]/40"
  },
  {
    num: "Бонус 4",
    title: "30 закликів до дії без нав'язливих «Купуйте зараз»",
    desc: "Ти отримаєш 30 готових закликів до дії, які можна використовувати в рілс, сторіс, постах, каруселях та прогрівах. У результаті ти не просто привертаєш увагу — ти розумієш, як направити людину до дії (купити, написати у дірект, залишити коментар).",
    oldPrice: "25€",
    cardBg: "bg-[#2B0813] border-[#2B0813]/40"
  }
];

export function IntensiveBonuses({ onOpenCheckout }: IntensiveBonusesProps) {
  const { formattedTime } = use10MinTimer();

  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] relative overflow-hidden text-[#2B0813]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#451220]/10 text-[#451220] text-xs font-bold uppercase tracking-[0.18em] mb-4">
            <Gift size={14} />
            <span>Спеціальна пропозиція</span>
          </div>

          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight">
            ТВОЇ БОНУСИ,<br />
            <span className="italic font-normal">якщо зареєструєшся прямо зараз</span>
          </h2>
        </div>

        {/* 4 Bonuses Cards */}
        <div className="grid md:grid-cols-2 gap-6 relative z-10">
          {bonusesData.map((bonus, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className={`rounded-2xl text-[#FAF6EE] border p-7 sm:p-8 shadow-md relative overflow-hidden group ${bonus.cardBg}`}
            >
              {/* Circular gift icon top-right */}
              <div className="absolute top-5 right-5" aria-hidden="true">
                <span className="inline-flex items-center justify-center rounded-full p-3 bg-[#FAF6EE] text-[#451220] shadow-sm">
                  <Gift size={22} />
                </span>
              </div>

              <div className="text-xs uppercase tracking-[0.18em] text-[#FAF6EE]/80 font-bold font-manrope">
                {bonus.num}
              </div>

              <h3 className="font-playfair text-xl sm:text-2xl mt-2 text-[#FAF6EE] pr-14 leading-snug font-bold">
                {bonus.title}
              </h3>

              <p className="mt-3 text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed font-manrope">
                {bonus.desc}
              </p>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between font-manrope">
                <div className="flex items-center gap-3">
                  <span className="line-through opacity-60 text-sm">{bonus.oldPrice}</span>
                  <span className="font-bold text-[#FAF6EE] text-lg uppercase tracking-wider">
                    Безкоштовно
                  </span>
                </div>
                <span className="text-xs text-[#FAF6EE]/70 uppercase tracking-widest font-semibold">
                  Доступ назавжди
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Timer & Total Banner */}
        <div className="mt-14 text-center relative z-10 max-w-xl mx-auto">
          <p className="text-sm font-manrope uppercase tracking-[0.2em] text-[#451220] font-bold">
            Сумарна цінність бонусів 125€ · Зараз безкоштовно
          </p>

          <p className="mt-2 text-xs font-manrope uppercase tracking-widest text-[#2B0813]/60">
            Бонуси зникнуть через:
          </p>

          <div className="mt-2 font-manrope text-5xl md:text-6xl text-[#2B0813] font-bold tabular-nums tracking-tight">
            {formattedTime}
          </div>

          <div className="mt-6">
            <button
              onClick={onOpenCheckout}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Забрати місце за 9€ замість 49€</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
