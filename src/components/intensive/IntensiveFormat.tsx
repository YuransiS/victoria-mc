"use client";

import React from "react";
import { motion } from "framer-motion";

const formatItems = [
  {
    num: "01",
    title: "У своєму темпі з практикою",
    desc: "Дивишся всі 4 уроки у зручний для тебе час, без дедлайнів, з миттєвим впровадженням у блог."
  },
  {
    num: "02",
    title: "Доступ назавжди",
    desc: "Доступ до всіх 4-х уроків залишається у тебе назавжди — завжди можна повернутися і передивитися."
  },
  {
    num: "03",
    title: "Додаткові ефіри",
    desc: "Участь у додаткових живих ефірах та розборах від Вікторії Мещерякової."
  },
  {
    num: "04",
    title: "Чат комюніті",
    desc: "Закрите співтовариство однодумців для запитань, взаємної підтримки та обміну результатами."
  },
  {
    num: "05",
    title: "Закріплений куратор",
    desc: "Для кожного учня буде закріплений особистий куратор, який буде перевіряти ваші домашні завдання."
  }
];

export function IntensiveFormat() {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] border-t border-[#2B0813]/10 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            ЯК ПРОХОДИТЬ ІНТЕНСИВ<br />
            <span className="italic font-normal text-[#451220]">і що ти отримуєш</span>
          </h2>
        </div>

        {/* 5 Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formatItems.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className={`rounded-2xl bg-white border border-[#2B0813]/10 p-7 text-center shadow-sm flex flex-col justify-between ${
                idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <div className="font-newsreader italic text-4xl text-[#451220] font-bold mb-2">
                  {item.num}
                </div>
                <h3 className="font-playfair text-xl font-bold mb-2">
                  {item.title}
                </h3>
                <p className="font-manrope text-sm text-[#2B0813]/80 leading-relaxed font-medium">
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
