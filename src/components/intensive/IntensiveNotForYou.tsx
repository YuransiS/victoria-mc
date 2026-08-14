"use client";

import React from "react";
import { motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";

const notForYouPoints = [
  "Якщо ти шукаєш магічну пігулку — один рілс, який принесе 100К переглядів і чергу клієнтів без твоєї участі.",
  "Якщо не готова нічого змінювати — хочеш продовжувати робити контент так само, але отримати принципово інший результат.",
  "Якщо хочеш просто подивитися уроки — без практики, аналізу власного блогу та впровадження.",
  "Якщо тобі важливіше знайти виправдання, ніж знайти рішення — «у мене вузька ніша», «немає часу», «алгоритми не дають охоплень».",
  "Якщо ти не хочеш продавати через блог і тобі достатньо просто вести красиву сторінку без конкретного результату."
];

export function IntensiveNotForYou() {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#141416] border-t border-white/10 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-500/10 border border-red-500/40 text-red-400 font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <XCircle size={14} />
            <span>Важливий фільтр</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            КОМУ ТОЧНО <span className="text-red-400">НЕ ПІДІЙДЕ</span> ЦЕЙ ІНТЕНСИВ
          </h2>
          <div className="w-16 h-0.5 bg-red-400 mx-auto mt-4" />
        </div>

        {/* List of exclusions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {notForYouPoints.map((point, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.07 }}
              className="bg-[#18181a] border border-red-500/20 p-5 sm:p-6 flex items-start gap-4 hover:border-red-500/40 transition-colors"
            >
              <span className="text-xl shrink-0 mt-0.5">❌</span>
              <p className="font-manrope text-sm sm:text-base text-white/80 leading-relaxed">
                {point}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Positive Filter Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#1b1b1e] border-2 border-[#fff500] p-6 sm:p-8 flex items-start sm:items-center gap-4 text-left shadow-[6px_6px_0px_rgba(0,0,0,0.4)]"
        >
          <div className="p-3 bg-[#fff500] text-black shrink-0 rounded-none">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="font-inter text-base sm:text-lg font-bold text-white uppercase mb-1">
              ДЛЯ КОГО ЦЕЙ ІНТЕНСИВ:
            </h4>
            <p className="font-manrope text-sm sm:text-base text-white/90 leading-relaxed font-medium">
              Для тих, хто готовий розібратися, що не працює, змінити підхід і нарешті почати створювати контент не навмання, а з розумінням, навіщо він потрібен.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
