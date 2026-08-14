"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqList = [
  {
    q: "Чи підійде, якщо в мене дуже вузька/специфічна ніша?",
    a: "Так. І навіть більше — система працює добре у вузьких нішах. Багато хто думає, що для маленької аудиторії потрібно вигадувати щось особливе. Насправді проблема майже завжди не в ніші, а у відсутності зрозумілої системи контенту.\n\nПід час інтенсиву ти не отримаєш шаблон «роби так, як усі». Ти навчишся будувати систему навколо своєї експертності, щоб з однієї теми створювати десятки одиниць контенту, які будуть цікаві саме твоїй аудиторії.\n\nНеважливо, чи ти психолог, кондитер, дизайнер, лікар, фотограф або продаєш товари ручної роботи — принцип однаково працює в будь-якій ніші."
  },
  {
    q: "Чи підійде, якщо я вже веду блог і маю систему, яка не працює?",
    a: "Саме для таких людей цей інтенсив часто стає найкориснішим. Дуже багато експертів уже мають контент-план, рубрики або навіть проходили різні навчання. Але проблема в тому, що система існує лише на папері.\n\nВона не допомагає регулярно виходити в блог. Не приводить нову аудиторію. Не приносить заявки.\n\nНа інтенсиві ми не будемо змушувати тебе починати все заново. Навпаки — покажемо, як подивитися на свою систему зі сторони, знайти слабкі місця і переробити її так, щоб вона реально працювала на тебе, а не просто займала місце в нотатках."
  },
  {
    q: "Чи не «з'їсть» система мою індивідуальність і голос?",
    a: "Це один із найпоширеніших страхів. Багато хто думає, що система — це шаблони, однакові пости й блог, схожий на сотні інших. Але хороша система працює навпаки.\n\nВона не визначає, що ти говориш. Вона допомагає зрозуміти, як доносити свої думки так, щоб їх хотілося читати. Твій стиль, голос, подача, жарти, історії та характер залишаються твоїми.\n\nСистема лише прибирає хаос і допомагає перестати щоразу починати з чистого аркуша. Саме тому після інтенсиву блог не стане менш живим — навпаки, проявлятися стане значно легше."
  },
  {
    q: "У мене немає часу навіть на курс",
    a: "Саме тому тут лише 4 уроки приблизно по 20 хвилин. Ти не прив’язана до розкладу — проходиш їх у своєму темпі, впроваджуєш одразу у свій блог і отримуєш чат + перевірку домашніх завдань, щоб не просто подивитися уроки, а реально зібрати свою систему."
  },
  {
    q: "У тебе й так багато безкоштовного контенту. Навіщо мені платити?",
    a: "Безкоштовний контент дає окремі знання, тільки по ключовим моментам. Тут ти отримуєш готову структуру, послідовність дій і практику, щоб зібрати все це у власну систему.\n\nІ зараз це коштує всього 9€ — набагато менше, ніж коштує одна година консультації."
  }
];

export function IntensiveFAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIdx(openIdx === i ? null : i);
  };

  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] border-t border-[#2B0813]/10 relative">
      <div className="max-w-4xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="font-playfair italic text-2xl sm:text-3xl text-[#451220] mb-2">
            FAQ
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            Запитання та відповіді
          </h2>
        </div>

        {/* Accordions */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqList.map((item, idx) => {
            const isOpen = openIdx === idx;

            return (
              <div
                key={idx}
                className="border-b border-[#2B0813]/15 pb-4 transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  type="button"
                  className="w-full py-4 flex items-center justify-between text-left gap-4 cursor-pointer group"
                >
                  <span className="font-playfair text-lg sm:text-xl font-bold group-hover:text-[#451220] transition-colors leading-snug">
                    {item.q}
                  </span>
                  <div
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center border border-[#2B0813]/20 transition-transform duration-200 ${
                      isOpen ? "rotate-180 bg-[#451220] text-[#FAF6EE] border-[#451220]" : "text-[#2B0813]"
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="font-manrope text-sm sm:text-base text-[#2B0813]/85 leading-relaxed space-y-3 pt-2 pb-4 whitespace-pre-line font-medium">
                        {item.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
