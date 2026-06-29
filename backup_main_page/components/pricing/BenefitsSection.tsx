"use client";

import React from "react";
import { motion } from "framer-motion";

export const BenefitsSection = () => {
  return (
    <section className="bg-white py-32 px-8 border-y border-black/5">
      <div className="max-w-screen-xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8 }}
          className="border-l-4 border-primary pl-8"
        >
          <h2 className="font-headline font-extrabold text-4xl md:text-5xl uppercase tracking-tight mb-12">
            Що ви отримуєте за бронювання:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <ul className="space-y-8">
              <li className="flex gap-6 items-start">
                <span className="font-manrope text-3xl font-black text-outline-variant-custom">01</span>
                <p className="font-space text-lg font-medium leading-snug">
                  Персональний розбір вашої сторінки (візуалу, сенсів, системи створення контента)
                </p>
              </li>
              <li className="flex gap-6 items-start">
                <span className="font-manrope text-3xl font-black text-outline-variant-custom">02</span>
                <p className="font-space text-lg font-medium leading-snug">
                  Журнал з ідеями в подарунок
                </p>
              </li>
              <li className="flex gap-6 items-start">
                <span className="font-manrope text-3xl font-black text-outline-variant-custom">03</span>
                <p className="font-space text-lg font-medium leading-snug">
                  Доступ до уроку з чого складається власний стиль в блозі?
                </p>
              </li>
            </ul>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="bg-surface-variant p-10 flex flex-col justify-center"
            >
              <p className="font-label text-lg italic text-on-surface leading-relaxed">
                "Ви отримуєте один із уроків основної програми курсу СТВОРЮЙ. Зможете протестувати мою методологію на практиці."
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
