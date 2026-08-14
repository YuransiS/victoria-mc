"use client";

import React from "react";
import { motion } from "framer-motion";
import { Gift, Clock, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";
import styles from "./IntensiveShared.module.css";

interface IntensiveBonusesProps {
  onOpenCheckout: () => void;
}

const bonusesData = [
  {
    num: "1",
    title: "Як я створюю контент за 30 хвилин на день",
    desc: "Покажу свою реальну систему роботи, як я поєдную життя матері двох дітей і ведення блогу, поділюсь 11-ти річним досвідом створення контенту.",
    oldPrice: "30€",
    bullets: [
      "Організація щоденної роботи без вигорання",
      "Як готувати контент блоками на тиждень вперед",
      "Лайфхаки поєднання сім'ї, двох дітей та блогу"
    ]
  },
  {
    num: "2",
    title: "Ефір з розборами профілей",
    desc: "Покроковий аналіз реальних профілей з покращеннями від мене під різні ніші. Після цього розбору ти по-іншому подивишся на власний блог. Кожен знайде для себе рішення і інструменти для контенту та візуалу.",
    oldPrice: "30€",
    bullets: [
      "Аналіз типових помилок у позиціонуванні",
      "Розбір структури шапки, хайлайтс та візуалу",
      "Готові ідеї для швидкого впровадження у своїй ніші"
    ]
  },
  {
    num: "3",
    title: "Формула працюючих заголовків, які не хочеться прогортати",
    desc: "Ти отримаєш готову формулу створення сильних заголовків для офферів і контенту + приклади її застосування в різних нішах. Береш формулу — підставляєш свою тему — отримуєш заголовок, який чіпляє конкретну проблему або бажання твоєї аудиторії.",
    oldPrice: "40€",
    bullets: [
      "Готовий конструктор заголовків для Reels та постів",
      "Слова-тригери для залучення платоспроможної аудиторії",
      "Приклади адаптації під м'які та тверді ніші"
    ]
  },
  {
    num: "4",
    title: "30 закликів до дії без нав'язливих «Купуйте зараз»",
    desc: "Ти отримаєш 30 готових закликів до дії, які можна використовувати в рілс, сторіс, постах, каруселях та прогрівах. У результаті ти не просто привертаєш увагу — ти розумієш, як направити людину до дії (купити, написати у дірект, залишити коментар).",
    oldPrice: "25€",
    bullets: [
      "30 готових CTA для сторіз, рілс та каруселей",
      "Екологічні переводи в Директ на консультації та продажі",
      "Як стимулювати збереження, репости та коментарі"
    ]
  }
];

export function IntensiveBonuses({ onOpenCheckout }: IntensiveBonusesProps) {
  const { formattedTime } = use10MinTimer();

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#141416] border-y border-white/10 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Gift size={14} />
            <span>Спеціальний пакет бонусів</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight mb-4">
            БОНУСИ, якщо зареєструєшся <span className="text-[#fff500]">прямо зараз</span>
          </h2>

          <p className="font-manrope text-sm sm:text-base text-white/70">
            Отримай 4 практичні інструменти, які посилять твою систему контенту з першого дня
          </p>

          {/* Floating Timer Bar */}
          <div className="inline-flex items-center gap-3 bg-black/60 border border-[#fff500]/50 px-5 py-2.5 mt-6 shadow-[0_0_25px_rgba(255,245,0,0.1)]">
            <Clock size={18} className="text-[#fff500] animate-pulse" />
            <span className="font-manrope text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
              Бонуси зникнуть через: <span className="text-[#fff500] font-black text-base">{formattedTime}</span>
            </span>
          </div>
        </div>

        {/* 4 Bonuses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {bonusesData.map((bonus, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#1a1a1d] border-2 border-white/10 p-6 sm:p-8 flex flex-col justify-between relative group hover:border-[#fff500]/50 transition-all duration-300 shadow-[6px_6px_0px_rgba(0,0,0,0.4)]"
            >
              <div>
                {/* Top Badge */}
                <div className="flex items-center justify-between gap-2 mb-4 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-[#fff500] text-black font-manrope text-xs font-black uppercase tracking-wider">
                      БОНУС #{bonus.num}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-manrope text-xs text-white/40 line-through mr-2">
                      {bonus.oldPrice}
                    </span>
                    <span className="font-manrope text-xs font-black text-[#fff500] uppercase">
                      Безкоштовно
                    </span>
                  </div>
                </div>

                <h3 className="font-inter text-lg sm:text-xl font-bold text-white mb-3 leading-snug">
                  {bonus.title}
                </h3>

                <p className="font-manrope text-sm text-white/75 leading-relaxed mb-5">
                  {bonus.desc}
                </p>

                {/* Bullets */}
                <div className="space-y-2 mb-6">
                  {bonus.bullets.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-2 font-manrope text-xs sm:text-sm text-white/90">
                      <CheckCircle2 size={16} className="text-[#fff500] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-manrope text-white/50">
                <span>Формат: PDF / Відеозапис</span>
                <span className="text-[#fff500] font-bold">Доступ назавжди</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bonus Summary Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[#1e1e24] via-[#1a1a1f] to-[#1e1e24] border-2 border-[#fff500] p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] text-center flex flex-col items-center"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <span className="font-manrope text-base sm:text-lg text-white/70">
              Сумарна цінність бонусів: <strong className="line-through text-white/40">125€</strong>
            </span>
            <span className="px-3 py-1 bg-[#fff500] text-black font-manrope text-sm font-black uppercase tracking-wider">
              Ціна зараз: 0€
            </span>
          </div>

          <p className="font-inter text-xl sm:text-2xl font-bold text-white mb-6 uppercase">
            Забирай 4 уроки інтенсиву + усі 4 бонуси всього за <span className="text-[#fff500]">9€</span>
          </p>

          <button
            onClick={onOpenCheckout}
            className="w-full max-w-md py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Забрати місце за 9€ замість 49€</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </div>
    </section>
  );
}
