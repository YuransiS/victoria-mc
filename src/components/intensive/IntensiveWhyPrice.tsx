"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface IntensiveWhyPriceProps {
  onOpenCheckout: () => void;
}

export function IntensiveWhyPrice({ onOpenCheckout }: IntensiveWhyPriceProps) {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] border-t border-[#2B0813]/10 relative">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            ЧОМУ ТАКА<br />
            <span className="italic font-normal text-[#451220]">ціна?</span>
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 font-manrope text-base sm:text-lg text-[#2B0813]/85 leading-relaxed font-medium">
            <p>
              Якщо впровадиш хоча б те, що є в уроках — це вже окупить інтенсив у рази. Повна версія цієї системи коштує значно дорожче, але хочу, щоб якомога більше людей нарешті перестали вигадувати контент щодня з нуля.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 text-base sm:text-lg font-manrope pt-2">
            <span className="line-through opacity-60">49€</span>
            <span className="font-bold text-2xl sm:text-3xl text-[#451220]">9€</span>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenCheckout}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <span>Зайти за 9€ замість 49€ →</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
