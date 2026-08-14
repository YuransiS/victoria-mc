"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ChevronLeft, ChevronRight, ArrowRight, MessageSquare, Sparkles } from "lucide-react";

interface IntensiveCasesReviewsProps {
  onOpenCheckout: () => void;
}

const casesData = [
  {
    name: "Мар’яна",
    niche: "Вчителька танців",
    id: "01",
    before: "https://i.ibb.co/350Z2MCW/IMG-5900.jpg",
    after: "https://i.ibb.co/dhn0HQx/IMG-5901.jpg",
    result: "Вибудували систему візуалу та змістів — отримала перші стабільні заявки з блогу."
  },
  {
    name: "Бізнес",
    niche: "Будівництво басейнів",
    id: "02",
    before: "https://i.ibb.co/F4JG4p7D/IMG-5896.jpg",
    after: "https://i.ibb.co/2Y7pmktn/IMG-5897.jpg",
    result: "Перевели складну нішу у зрозумілий контент, який генерує ліди."
  },
  {
    name: "Аня",
    niche: "Дизайнер одягу",
    id: "03",
    before: "https://i.ibb.co/ycV62Bsy/IMG-5898.jpg",
    after: "https://i.ibb.co/kgCgSsyz/IMG-5899.jpg",
    result: "Створили естетичні каруселі та Reels, що підкреслюють авторський бренд."
  },
  {
    name: "Катя",
    niche: "Лайфстайл та експертний блог",
    id: "04",
    before: "https://i.ibb.co/fdF1Y1b2/IMG-5892.jpg",
    after: "https://i.ibb.co/fVgSyWQJ/IMG-5893.jpg",
    result: "Зрозуміла, як транслювати цінності без страху камери та хаосу."
  }
];

const reviews = [
  "/rozbir/r1.jpg",
  "/rozbir/r2.jpg",
  "/rozbir/r3.jpg",
  "/rozbir/r4.jpg",
  "/rozbir/r5.jpg",
  "/rozbir/r6.jpg",
  "/rozbir/r7.jpg",
  "/rozbir/r8.jpg",
  "/rozbir/r9.jpg",
  "/rozbir/r10.jpg"
];

export function IntensiveCasesReviews({ onOpenCheckout }: IntensiveCasesReviewsProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className="py-20 px-4 sm:px-6 bg-[#141416] border-y border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} />
            <span>Реальні результати</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            РЕЗУЛЬТАТИ ТИХ, <span className="text-[#fff500]">ХТО ВЖЕ РОЗІБРАВСЯ</span>
          </h2>
          <p className="font-manrope text-sm sm:text-base text-white/70 mt-3">
            Подивіться, як змінюється візуал, охоплення та впевненість учениць після впровадження системи
          </p>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        {/* Section 1: Before / After Transformations */}
        <div className="mb-16">
          <h3 className="font-inter text-lg sm:text-xl font-black text-white uppercase tracking-wider mb-6 flex items-center gap-2">
            <span>✨ Трансформація профілів ДО та ПІСЛЯ</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {casesData.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#18181a] border border-white/10 p-5 sm:p-6 shadow-[6px_6px_0px_rgba(0,0,0,0.4)]"
              >
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div>
                    <h4 className="font-inter text-base sm:text-lg font-bold text-white">
                      {item.name}
                    </h4>
                    <p className="font-manrope text-xs text-[#fff500] uppercase tracking-wider font-bold">
                      {item.niche}
                    </p>
                  </div>
                  <span className="font-newsreader italic text-2xl text-white/30 font-bold">
                    #{item.id}
                  </span>
                </div>

                {/* 2-image grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div
                    className="relative aspect-[3/4] bg-black/50 border border-white/10 overflow-hidden cursor-pointer group"
                    onClick={() => setActiveImage(item.before)}
                  >
                    <img
                      src={item.before}
                      alt={`До — ${item.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-black/80 text-white font-manrope text-[10px] font-black uppercase px-2 py-0.5 border border-white/20">
                      ДО
                    </span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={20} className="text-white" />
                    </div>
                  </div>

                  <div
                    className="relative aspect-[3/4] bg-black/50 border border-[#fff500]/50 overflow-hidden cursor-pointer group"
                    onClick={() => setActiveImage(item.after)}
                  >
                    <img
                      src={item.after}
                      alt={`Після — ${item.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 left-2 bg-[#fff500] text-black font-manrope text-[10px] font-black uppercase px-2 py-0.5 border border-black">
                      ПІСЛЯ
                    </span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ZoomIn size={20} className="text-white" />
                    </div>
                  </div>
                </div>

                <p className="font-manrope text-xs sm:text-sm text-white/80 leading-relaxed italic">
                  «{item.result}»
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Section 2: Student Feedback Screenshots */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-inter text-lg sm:text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <MessageSquare size={18} className="text-[#fff500]" />
              <span>Що пишуть у чатах та відгуках</span>
            </h3>
            <span className="font-manrope text-xs text-white/40 uppercase tracking-widest hidden sm:inline-block">
              Натисніть на фото для збільшення
            </span>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {reviews.map((imgSrc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="relative aspect-square bg-[#18181a] border border-white/10 overflow-hidden cursor-pointer group hover:border-[#fff500] transition-colors"
                onClick={() => setActiveImage(imgSrc)}
              >
                <img
                  src={imgSrc}
                  alt={`Відгук ${idx + 1}`}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-12">
          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[5px_5px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer"
          >
            <span>Хочу такий самий результат — за 9€ →</span>
          </button>
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white p-2"
              aria-label="Закрити"
            >
              <X size={32} />
            </button>

            <div
              className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={activeImage}
                alt="Збільшений відгук"
                className="max-w-full max-h-[85vh] object-contain border border-white/20 shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
