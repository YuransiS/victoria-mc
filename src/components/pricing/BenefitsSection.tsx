"use client";

import React from "react";

export const BenefitsSection = () => {
  return (
    <section className="bg-white py-32 px-8 border-y border-black/5">
      <div className="max-w-screen-xl mx-auto">
        <div className="border-l-4 border-primary-brand pl-8">
          <h2 className="font-manrope font-extrabold text-4xl md:text-5xl uppercase tracking-tight mb-12">
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
                  Доступ до уроку «Як знайти свої сенси?»
                </p>
              </li>
            </ul>
            <div className="bg-surface-variant-custom p-10 flex flex-col justify-center">
              <p className="font-space text-lg italic text-on-surface-custom leading-relaxed">
                "Ви отримуєте один із уроків основної програми курсу СТВОРЮЙ. Зможете протестувати мою методологію на практиці."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
