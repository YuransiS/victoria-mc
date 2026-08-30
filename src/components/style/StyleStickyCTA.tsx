"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame } from "lucide-react";

interface StyleStickyCTAProps {
  onOpenModal: () => void;
}

export function StyleStickyCTA({ onOpenModal }: StyleStickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 320) {
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
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 bg-white/95 backdrop-blur-lg border-t border-[#EADBCE] shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:hidden"
        >
          <div className="max-w-md mx-auto flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[11px] font-manrope font-bold text-[#A33D12] px-1">
              <span className="flex items-center gap-1">
                <Flame size={12} className="text-[#D96B27]" />
                79/100 місць зайнято
              </span>
              <span>Безкоштовно (0 грн)</span>
            </div>
            <button
              onClick={onOpenModal}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] text-white font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl shadow-[0_4px_16px_rgba(200,90,23,0.35)] active:scale-[0.98] transition-transform cursor-pointer"
            >
              <span>Зареєструватися безкоштовно</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
