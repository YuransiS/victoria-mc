"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, X, ArrowRight } from "lucide-react";

interface IntensiveCasesReviewsProps {
  onOpenCheckout: () => void;
}

const casesData = [
  {
    name: "Мар’яна",
    niche: "Вчителька танців",
    id: "01",
    before: "https://i.ibb.co/350Z2MCW/IMG-5900.jpg",
    after: "https://i.ibb.co/dhn0HQx/IMG-5901.jpg"
  },
  {
    name: "Бізнес",
    niche: "Будівництво басейнів",
    id: "02",
    before: "https://i.ibb.co/F4JG4p7D/IMG-5896.jpg",
    after: "https://i.ibb.co/2Y7pmktn/IMG-5897.jpg"
  },
  {
    name: "Аня",
    niche: "Дизайнер одягу",
    id: "03",
    before: "https://i.ibb.co/ycV62Bsy/IMG-5898.jpg",
    after: "https://i.ibb.co/kgCgSsyz/IMG-5899.jpg"
  },
  {
    name: "Катя",
    niche: "Лайфстайл блог",
    id: "04",
    before: "https://i.ibb.co/fdF1Y1b2/IMG-5892.jpg",
    after: "https://i.ibb.co/fVgSyWQJ/IMG-5893.jpg"
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
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#FAF6EE] text-[#2B0813] border-t border-[#2B0813]/10 relative">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="font-playfair italic text-2xl sm:text-3xl text-[#451220] mb-2">
            Трансформації & Відгуки
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            РЕЗУЛЬТАТИ ТИХ,<br />
            <span className="italic font-normal">хто вже розібрався</span>
          </h2>
        </div>

        {/* Before / After Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {casesData.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white rounded-2xl border border-[#2B0813]/10 p-6 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4 border-b border-[#2B0813]/10 pb-3">
                <div>
                  <h4 className="font-playfair text-lg font-bold">{item.name}</h4>
                  <p className="font-manrope text-xs text-[#451220] uppercase font-bold tracking-wider">
                    {item.niche}
                  </p>
                </div>
                <span className="font-newsreader italic text-2xl text-[#2B0813]/30">
                  #{item.id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div
                  className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group bg-[#FAF6EE]"
                  onClick={() => setActiveImage(item.before)}
                >
                  <img
                    src={item.before}
                    alt={`До — ${item.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-black/70 text-white font-manrope text-[10px] font-bold px-2.5 py-0.5">
                    До
                  </span>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>

                <div
                  className="relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer group bg-[#FAF6EE]"
                  onClick={() => setActiveImage(item.after)}
                >
                  <img
                    src={item.after}
                    alt={`Після — ${item.name}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2 left-2 rounded-full bg-[#451220] text-[#FAF6EE] font-manrope text-[10px] font-bold px-2.5 py-0.5">
                    Після
                  </span>
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ZoomIn size={20} className="text-white" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Reviews Grid */}
        <div className="mb-12">
          <h3 className="font-playfair text-xl sm:text-2xl font-bold text-center mb-6">
            Скріншоти відгуків
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {reviews.map((imgSrc, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="relative aspect-square rounded-2xl bg-white border border-[#2B0813]/10 overflow-hidden cursor-pointer group hover:border-[#451220] transition-colors p-2 shadow-sm"
                onClick={() => setActiveImage(imgSrc)}
              >
                <img
                  src={imgSrc}
                  alt={`Відгук ${idx + 1}`}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <ZoomIn size={20} className="text-white" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onOpenCheckout}
            className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-xl transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          >
            <span>Хочу такий самий результат — за 9€ →</span>
          </button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10005] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 text-white/80 hover:text-white p-2"
            >
              <X size={30} />
            </button>
            <div className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img
                src={activeImage}
                alt="Збільшений відгук"
                className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
