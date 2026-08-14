"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Clock } from "lucide-react";

interface IntensiveCurriculumProps {
  onOpenCheckout: () => void;
}

const lessons = [
  {
    num: "01",
    time: "20 хв",
    name: "УРОК 1",
    title: "Діагностика блогу",
    points: [
      "Розберемо, як зараз працює контент у 2026 році",
      "Подивимося, чому один контент отримує увагу, а інші — ні",
      "Знайдемо, що саме не працює у твоєму блозі"
    ],
    result: "Ти чітко розумієш, що зараз працює, що заважає твоєму блогу рости та що потрібно виправити."
  },
  {
    num: "02",
    time: "20 хв",
    name: "УРОК 2",
    title: "Ідеї та формати",
    points: [
      "Розберемо, де брати ідеї для контенту без виснажливих роздумів",
      "Покажемо, як із однієї теми зробити декілька різних типів контенту",
      "Розберемо, коли краще використовувати Reels, каруселі та Stories",
      "Покажемо, як створювати контент під різні задачі"
    ],
    result: "У тебе буде готова база тем і розуміння, що та в якому форматі створювати."
  },
  {
    num: "03",
    time: "20 хв",
    name: "УРОК 3",
    title: "Створення контенту",
    points: [
      "Покажемо, як створювати Reels, які хочеться дивитися",
      "Розберемо структуру каруселі від першого до останнього слайду",
      "Покажемо, як знімати та монтувати відео без складного монтажу",
      "Розберемо, як зробити контент цікавим, а не просто «корисним»"
    ],
    result: "Ти зможеш самостійно створювати Reels і каруселі та одразу тестувати їх у своєму блозі."
  },
  {
    num: "04",
    time: "20 хв",
    name: "УРОК 4",
    title: "Контент → Аудиторія → Клієнти",
    points: [
      "Розберемо, який контент приводить нових людей",
      "Покажемо, як вести людину від першого перегляду до довіри",
      "Розберемо, як через контент підводити до своїх послуг або продукту",
      "Покажемо, як переводити аудиторію в Директ і продаж"
    ],
    result: "Ти збереш просту систему ведення блогу, де розумієш, що створювати, навіщо це робити та як контент приводить тобі клієнтів."
  }
];

export function IntensiveCurriculum({ onOpenCheckout }: IntensiveCurriculumProps) {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="font-playfair italic text-2xl sm:text-3xl text-[#451220] mb-2">
            Програма
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            ЩО ВСЕРЕДИНІ —<br />
            <span className="italic font-normal">4 уроки по 20 хв</span>
          </h2>
        </div>

        {/* 4 Deep Wine Lesson Cards */}
        <div className="space-y-6 mb-12">
          {lessons.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="rounded-2xl bg-[#2B0813] text-[#FAF6EE] border border-[#2B0813]/40 p-7 sm:p-10 shadow-lg relative overflow-hidden"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3 mb-2">
                <div className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#FAF6EE]/80 font-bold font-manrope flex items-center gap-2">
                  <span>{item.name}</span>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-normal opacity-80">
                    <Clock size={12} /> {item.time}
                  </span>
                </div>
                <div className="font-newsreader italic text-3xl text-[#E5B887] font-bold">
                  #{item.num}
                </div>
              </div>

              <h3 className="font-playfair text-2xl sm:text-3xl mt-1 text-[#FAF6EE] font-bold">
                {item.title}
              </h3>

              <ul className="mt-5 space-y-2.5 font-manrope">
                {item.points.map((pt, pIdx) => (
                  <li key={pIdx} className="flex items-start gap-3 text-sm sm:text-base text-[#FAF6EE]/90">
                    <span className="text-[#E5B887] shrink-0 mt-0.5">◆</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-4 border-t border-white/15">
                <p className="font-manrope text-xs uppercase tracking-wider text-[#E5B887] font-bold mb-1">
                  Результат уроку:
                </p>
                <p className="font-manrope text-sm sm:text-base text-[#FAF6EE]/95 italic">
                  {item.result}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Final Result Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-[#451220] text-[#FAF6EE] p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-xl"
        >
          <span className="font-manrope text-xs uppercase tracking-[0.2em] text-[#E5B887] font-bold block mb-2">
            Фінальний результат
          </span>
          <h3 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-6">
            Після 4 уроків у тебе буде розуміння, який контент працює у 2026 році і як робити результат у вигляді нової аудиторії та продажів
          </h3>

          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#FAF6EE] text-[#2B0813] hover:bg-white hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Забрати всі 4 уроки за 9€ →</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
