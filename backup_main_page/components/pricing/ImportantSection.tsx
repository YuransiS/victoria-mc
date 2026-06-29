"use client";

import React from "react";
import { motion } from "framer-motion";

export const ImportantSection = () => {
  return (
    <section className="bg-black text-white py-32 px-8">
      <div className="max-w-screen-xl mx-auto text-center">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="font-headline font-extrabold text-6xl md:text-8xl mb-24 uppercase tracking-tighter"
        >
          ВАЖЛИВО:
        </motion.h2>
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-16 text-left max-w-5xl mx-auto"
        >
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Уроки без води з чіткою покроковою інформацією
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Вийде у всіх, навіть у тих, хто вважає, що немає таланту, адже ми почнео опрацьовувати цю навичку з перших днів
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Уроки короткі, можна проходити у власному темпі в зручний для себе час
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Отримуєте систему, яка приведе вас до 100% результату без хаосу
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Почнете знімати більше не тому, що "змушує курс", а тому що нарешті будете знати як
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4">
            Без студій чи додаткової техніки : будемо знімати так, щоб виглядало “як в Pinterest” навіть у звичайній кімнаті
          </p>
          <p className="font-space text-lg opacity-80 border-b border-white/10 pb-4 md:col-span-2">
            Максимум практики: дивишся урок → повторюєш → бачиш результат
          </p>
        </motion.div>
      </div>
    </section>
  );
};
