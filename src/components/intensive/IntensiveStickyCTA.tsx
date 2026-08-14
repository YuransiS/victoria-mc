"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";

interface IntensiveStickyCTAProps {
  onOpenCheckout: () => void;
}

export function IntensiveStickyCTA({ onOpenCheckout }: IntensiveStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { formattedTime } = use10MinTimer();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-0 right-0 z-50 px-4 flex justify-center pointer-events-none"
        >
          <div className="w-full max-w-md bg-[#2B0813]/95 backdrop-blur-md text-[#FAF6EE] p-3 sm:p-3.5 rounded-full shadow-2xl border border-white/20 flex items-center justify-between gap-3 pointer-events-auto">
            <div className="flex items-center gap-2 pl-3 font-manrope">
              <span className="line-through opacity-50 text-xs">49€</span>
              <span className="font-bold text-lg text-[#FAF6EE]">9€</span>
              <span className="opacity-30">·</span>
              <div className="flex items-center gap-1 text-[11px] font-semibold text-[#E5B887]">
                <Clock size={11} />
                <span>{formattedTime}</span>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="py-2.5 px-5 bg-[#FAF6EE] text-[#2B0813] font-manrope font-bold text-xs sm:text-sm rounded-full shadow-md hover:bg-white transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              <span>Забрати за 9€</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
