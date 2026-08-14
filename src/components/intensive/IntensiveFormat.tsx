"use client";

import React from "react";
import { motion } from "framer-motion";
import { PlayCircle, Infinity, Video, MessageCircle, UserCheck } from "lucide-react";

const formatItems = [
  {
    icon: PlayCircle,
    title: "У своєму темпі з практикою",
    desc: "Дивишся всі 4 уроки в будь-який зручний час, виконуєш прості покрокові завдання та одразу бачиш результат у блозі."
  },
  {
    icon: Infinity,
    title: "Доступ до всіх 4-х уроків назавжди",
    desc: "Матеріали залишаються у твоєму особистому кабінеті без обмежень за часом. Завжди зможеш повернутися та переглянути."
  },
  {
    icon: Video,
    title: "Участь у додаткових ефірах",
    desc: "Живі сесії відповідей на запитання та додаткові розбори практичних ситуацій від Вікторії."
  },
  {
    icon: MessageCircle,
    title: "Чат комюніті",
    desc: "Закритий чат однодумців для запитань, взаємної підтримки, нетворкінгу та обміну першими результатами."
  },
  {
    icon: UserCheck,
    title: "Персональний куратор",
    desc: "Для кожного учня буде закріплений куратор, який перевірятиме ваші домашні завдання та даватиме розвиваючий зворотний зв'язок."
  }
];

export function IntensiveFormat() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <span>Процес та умови</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            ЯК ПРОХОДИТЬ ІНТЕНСИВ І <span className="text-[#fff500]">ЩО ТИ ОТРИМУЄШ</span>
          </h2>
          <p className="font-manrope text-sm sm:text-base text-white/70 mt-3">
            Максимальна зручність, підтримка та супровід на кожному кроці
          </p>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        {/* 5 Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formatItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`bg-[#18181a] border border-white/10 p-6 sm:p-7 flex flex-col justify-between shadow-[6px_6px_0px_rgba(0,0,0,0.3)] hover:border-[#fff500]/40 transition-colors ${
                idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <div className="w-12 h-12 bg-[#fff500]/10 border border-[#fff500] flex items-center justify-center text-[#fff500] mb-5">
                  <item.icon size={24} />
                </div>
                <h3 className="font-inter text-lg font-bold text-white uppercase mb-2">
                  {item.title}
                </h3>
                <p className="font-manrope text-sm text-white/75 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
