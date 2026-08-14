"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Check, Award, Users, Globe2, Heart } from "lucide-react";

interface IntensiveExpertProps {
  onOpenCheckout?: () => void;
}

export function IntensiveExpert({ onOpenCheckout }: IntensiveExpertProps) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#141416] border-y border-white/10 relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/15 text-white/80 font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Award size={14} className="text-[#fff500]" />
            <span>Експертність та досвід</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            ХТО АВТОР <span className="text-[#fff500]">ІНТЕНСИВУ</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        {/* 2-Column Expert Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12">
          {/* Photo Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 relative flex justify-center"
          >
            <div className="relative w-full max-w-sm aspect-[4/5] bg-[#1a1a1d] border-2 border-white/20 p-2 shadow-[10px_10px_0px_rgba(0,0,0,0.6)]">
              <div className="relative w-full h-full overflow-hidden">
                <Image
                  src="/rozbir/vik.jpg"
                  alt="Вікторія Мещерякова"
                  fill
                  className="object-cover object-top"
                />
              </div>

              {/* Instagram Floating Tag */}
              <a
                href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
                target="_blank"
                rel="noopener noreferrer"
                className="absolute bottom-5 right-5 bg-black/90 border border-white/20 backdrop-blur-md px-3.5 py-2 flex items-center gap-2 text-white hover:text-[#fff500] transition-colors shadow-lg"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                <span className="font-manrope text-xs font-bold">@victoria_meshcheriakova</span>
              </a>
            </div>
          </motion.div>

          {/* Info Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 flex flex-col justify-center space-y-6"
          >
            <div>
              <h3 className="font-inter text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
                Вікторія Мещерякова
              </h3>
              <p className="font-manrope text-sm sm:text-base text-white/80 leading-relaxed font-medium">
                З контентом — <span className="text-[#fff500] font-bold">з 2015 року</span>. Встигла попрацювати з блогами всіх форматів: від тих, хто щойно завів акаунт, до тих, хто веде спільноту на десятки тисяч людей.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-3.5">
              {[
                { text: "понад 250 учнів", icon: Users },
                { text: "більше 100 розібраних блогів", icon: Award },
                {
                  text: "стратегії для міжнародних брендів зокрема Fisher. Працювала з аудиторіями трьох країн: Британія, США, Польща.",
                  icon: Globe2
                },
                {
                  text: "Мама двох дітей. Система «контент за 30 хвилин» — це не маркетинговий слоган. Це єдиний спосіб яким я сама веду блог між дитиною, роботою і реальним життям.",
                  icon: Heart
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 bg-[#18181a] border border-white/10 p-3.5 sm:p-4"
                >
                  <div className="w-6 h-6 rounded-none bg-[#fff500]/10 border border-[#fff500] flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={14} className="text-[#fff500]" />
                  </div>
                  <p className="font-manrope text-sm sm:text-base text-white/90 leading-relaxed font-normal">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Manifest Quote Box */}
            <div className="p-5 bg-black/60 border-l-4 border-[#fff500] border-y border-r border-white/10">
              <p className="font-newsreader italic text-lg sm:text-xl text-white font-medium mb-1">
                «Я не навчаю робити просто красиво.»
              </p>
              <p className="font-manrope text-sm sm:text-base text-[#fff500] font-bold uppercase tracking-wider">
                Я навчаю створювати контент, який читають, запам{`'`}ятовують — і після якого купують.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
