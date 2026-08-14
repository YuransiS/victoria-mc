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
          className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-[#141416]/95 backdrop-blur-md border-t border-white/15 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]"
        >
          <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-manrope text-xs text-white/40 line-through">49€</span>
                <span className="font-inter text-xl font-black text-[#fff500]">9€</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-manrope text-white/60 uppercase">
                <Clock size={10} className="text-[#fff500]" />
                <span>{formattedTime}</span>
              </div>
            </div>

            <button
              onClick={onOpenCheckout}
              className="flex-1 max-w-xs py-3 px-4 bg-[#fff500] text-black font-inter font-black text-xs sm:text-sm uppercase tracking-wider border border-black shadow-[3px_3px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Забрати за 9€</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
