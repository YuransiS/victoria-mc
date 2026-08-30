"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Users } from "lucide-react";

export function StyleSpeaker() {
  return (
    <section className="relative py-8 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-2">
          СПІКЕРКА НАВЧАННЯ
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#231815] tracking-tight">
          Віка <span className="italic text-[#C85A17]">Мещерякова</span>
        </h2>
      </div>

      {/* Main Speaker Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCE] shadow-[0_10px_30px_rgba(163,61,18,0.06)] relative overflow-hidden"
      >
        {/* Speaker Photo & Bio Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-5 text-center sm:text-left">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#D96B27] shadow-md shrink-0">
            <Image
              src="/rozbir/IMG_2534.jpg"
              alt="Віка Мещерякова"
              fill
              className="object-cover object-top"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#A33D12] mb-1 font-manrope">
              Експертка з візуалу та соцмереж
            </div>
            <h3 className="font-playfair text-xl font-bold text-[#231815] mb-2">
              Віка Мещерякова
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-[#231815]/80 font-medium">
              Працює із соцмережами з <strong>2015 року</strong>
            </p>
            <a
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A33D12] hover:underline mt-2 font-manrope bg-[#FDF2E9] px-3 py-1 rounded-full border border-[#F5D6C1]"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              <span>@victoria_meshcheriakova</span>
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Credentials & Method */}
        <div className="space-y-3 font-manrope text-xs sm:text-sm text-[#231815]/85 border-t border-[#EADBCE] pt-4">
          <div className="bg-[#FEF5EE] p-4 rounded-2xl border border-[#F5D6C1]">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#A33D12] mb-2">
              Допомагає експертам і спеціалістам:
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-[#D96B27] font-bold">→</span>
                <span>знаходити власну подачу</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D96B27] font-bold">→</span>
                <span>створювати контент без хаосу</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#D96B27] font-bold">→</span>
                <span>будувати блог, який працює на аудиторію та клієнтів</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#1F1410] text-white p-3.5 rounded-2xl border border-[#3A261D]">
            <Users size={20} className="text-[#F5C7A3] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Навчила понад <span className="text-[#F5C7A3]">250+ студентів</span>
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
