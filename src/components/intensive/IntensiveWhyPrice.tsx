"use client";

import React from "react";
import { motion } from "framer-motion";
import { HelpCircle, ArrowRight } from "lucide-react";

interface IntensiveWhyPriceProps {
  onOpenCheckout: () => void;
}

export function IntensiveWhyPrice({ onOpenCheckout }: IntensiveWhyPriceProps) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#141416] border-t border-white/10 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[#18181a] border-2 border-[#fff500] p-8 sm:p-12 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] text-center flex flex-col items-center"
        >
          <div className="w-12 h-12 bg-[#fff500]/10 border border-[#fff500] flex items-center justify-center text-[#fff500] mb-4">
            <HelpCircle size={26} />
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl font-black text-white uppercase tracking-tight mb-6">
            ЧОМУ ТАКА ЦІНА?
          </h2>

          <p className="font-manrope text-base sm:text-lg text-white/85 leading-relaxed max-w-2xl mb-8">
            Якщо впровадиш хоча б те, що є в уроках — це вже окупить інтенсив у рази. Повна версія цієї системи коштує значно дорожче, але хочу, щоб якомога більше людей нарешті перестали вигадувати контент щодня з нуля.
          </p>

          <button
            onClick={onOpenCheckout}
            className="w-full max-w-md py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Зайти за 9€ замість 49€ →</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
