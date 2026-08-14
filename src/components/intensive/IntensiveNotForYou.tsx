"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const notForYouPoints = [
  "Якщо ти шукаєш магічну пігулку — один рілс, який принесе 100К переглядів і чергу клієнтів без твоєї участі.",
  "Якщо не готова нічого змінювати — хочеш продовжувати робити контент так само, але отримати принципово інший результат.",
  "Якщо хочеш просто подивитися уроки — без практики, аналізу власного блогу та впровадження.",
  "Якщо тобі важливіше знайти виправдання, ніж знайти рішення — «у мене вузька ніша», «немає часу», «алгоритми не дають охоплень».",
  "Якщо ти не хочеш продавати через блог і тобі достатньо просто вести красиву сторінку без конкретного результату."
];

export function IntensiveNotForYou() {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] relative border-t border-[#2B0813]/10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 bg-[#451220]/10 text-[#451220] text-xs font-bold uppercase tracking-[0.18em] mb-4">
            <X size={14} />
            <span>Важливий фільтр</span>
          </div>

          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            КОМУ ТОЧНО <span className="italic font-normal text-[#451220]">НЕ ПІДІЙДЕ</span> ЦЕЙ ІНТЕНСИВ
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-4 mb-10">
          {notForYouPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              className={`rounded-2xl bg-white border border-[#2B0813]/10 p-6 shadow-sm flex items-start gap-4 ${
                idx === 4 ? "md:col-span-2" : ""
              }`}
            >
              <span className="w-8 h-8 rounded-full bg-[#451220]/10 text-[#451220] flex items-center justify-center font-bold shrink-0 text-sm">
                ✕
              </span>
              <p className="font-manrope text-sm sm:text-base text-[#2B0813]/85 leading-relaxed font-medium">
                {point}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Positive Conclusion Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-[#451220] text-[#FAF6EE] p-7 sm:p-9 flex items-start sm:items-center gap-4 shadow-lg"
        >
          <div className="p-3 bg-[#FAF6EE] text-[#451220] rounded-full shrink-0">
            <Check size={22} className="stroke-[3]" />
          </div>
          <div>
            <h4 className="font-playfair text-lg sm:text-xl font-bold uppercase mb-1">
              Цей інтенсив для тих, хто:
            </h4>
            <p className="font-manrope text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed">
              Готовий розібратися, що не працює, змінити підхід і нарешті почати створювати контент не навмання, а з розумінням, навіщо він потрібен.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
