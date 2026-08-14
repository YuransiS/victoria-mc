"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface IntensiveExpertProps {
  onOpenCheckout?: () => void;
}

export function IntensiveExpert({ onOpenCheckout }: IntensiveExpertProps) {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] border-t border-[#2B0813]/10 relative">
      <div className="max-w-5xl mx-auto">
        {/* Author Header with Avatar */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-8 mb-6 text-center sm:text-left">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-full overflow-hidden border-3 border-[#451220] shadow-xl shrink-0">
            <Image
              src="/rozbir/vik.jpg"
              alt="Вікторія Мещерякова"
              fill
              className="object-cover object-top"
            />
          </div>
          <div>
            <span className="font-manrope text-xs font-bold uppercase tracking-[0.2em] text-[#451220] block mb-1">
              Автор інтенсиву
            </span>
            <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Я — <span className="italic font-normal">Вікторія Мещерякова</span>
            </h2>
            <a
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#451220] hover:underline mt-2 font-manrope"
            >
              <span>@victoria_meshcheriakova</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        <p className="text-center font-playfair italic text-lg sm:text-xl text-[#2B0813]/80 mb-8 max-w-2xl mx-auto">
          З контентом — з 2015 року. Встигла попрацювати з блогами всіх форматів: від тих, хто щойно завів акаунт, до тих, хто веде спільноту на десятки тисяч людей.
        </p>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-10">
          {[
            "понад 250 учнів у наставництві та практикумах",
            "більше 100 розібраних блогів з конкретними точками росту",
            "стратегії для міжнародних брендів зокрема Fisher. Працювала з аудиторіями трьох країн: Британія, США, Польща.",
            "Мама двох дітей. Система «контент за 30 хвилин» — це не маркетинговий слоган. Це єдиний спосіб яким я сама веду блог між дитиною, роботою і реальним життям."
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-start gap-3.5 p-5 bg-white rounded-2xl border border-[#2B0813]/10 shadow-sm"
            >
              <span className="text-[#451220] font-bold text-lg shrink-0 mt-0.5">✦</span>
              <span className="font-manrope text-sm sm:text-base text-[#2B0813]/90 leading-relaxed font-medium">
                {item}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Manifest box */}
        <div className="max-w-3xl mx-auto text-center bg-[#451220] text-[#FAF6EE] p-6 sm:p-8 rounded-2xl shadow-md">
          <p className="font-playfair italic text-xl sm:text-2xl font-normal mb-2">
            «Я не навчаю робити просто красиво.»
          </p>
          <p className="font-manrope text-sm sm:text-base font-bold uppercase tracking-wider text-[#FAF6EE]">
            Я навчаю створювати контент, який читають, запам{`'`}ятовують — і після якого купують.
          </p>
        </div>

        {onOpenCheckout && (
          <div className="mt-8 text-center">
            <button
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] cursor-pointer"
            >
              <span>Зайняти місце за 9€ →</span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
