"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Award, Users, Sparkles } from "lucide-react";

export function StyleSpeaker() {
  return (
    <section className="relative py-8 px-4 max-w-lg md:max-w-xl mx-auto">
      {/* Section Header */}
      <div className="text-center mb-6">
        <span className="inline-flex items-center gap-1.5 bg-[#F0FAF3] text-[#06874F] border border-[#C9F7DB] px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-[0.16em] mb-2">
          СПІКЕРКА НАВЧАННЯ
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl font-bold text-[#142117] tracking-tight">
          Віка <span className="italic text-[#06874F]">Міщерякова</span>
        </h2>
      </div>

      {/* Main Speaker Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#DFEADF] shadow-[0_10px_30px_rgba(13,78,42,0.06)] relative overflow-hidden"
      >
        {/* Speaker Photo & Bio Row */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-5 text-center sm:text-left">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-[#18B66F] shadow-md shrink-0">
            <Image
              src="/rozbir/vik.jpg"
              alt="Віка Міщерякова"
              fill
              className="object-cover object-top"
            />
          </div>

          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#06874F] mb-1 font-manrope">
              Експертка з візуалу та соцмереж
            </div>
            <h3 className="font-playfair text-xl font-bold text-[#142117] mb-2">
              Віка Міщерякова
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-[#142117]/80 font-medium">
              Працює із соцмережами з <strong>2015 року</strong>
            </p>
            <a
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06874F] hover:underline mt-2 font-manrope bg-[#F0FAF3] px-3 py-1 rounded-full border border-[#C9F7DB]"
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
        <div className="space-y-3 font-manrope text-xs sm:text-sm text-[#142117]/85 border-t border-[#DFEADF] pt-4">
          <div className="bg-[#F8FFF9] p-4 rounded-2xl border border-[#C9F7DB]">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#06874F] mb-2">
              Допомагає експертам і спеціалістам:
            </div>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center gap-2">
                <span className="text-[#18B66F] font-bold">→</span>
                <span>знаходити власну подачу</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#18B66F] font-bold">→</span>
                <span>створювати контент без хаосу</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#18B66F] font-bold">→</span>
                <span>будувати блог, який працює на аудиторію та клієнтів</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#142117] text-white p-3.5 rounded-2xl">
            <Users size={20} className="text-[#7EDEAA] shrink-0" />
            <span className="text-xs sm:text-sm font-bold">
              Навчила понад <span className="text-[#7EDEAA]">250+ студентів</span>
            </span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
