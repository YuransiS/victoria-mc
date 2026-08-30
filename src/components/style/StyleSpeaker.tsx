"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Globe, Clock, BookOpen, Sparkles, ArrowRight } from "lucide-react";

interface StyleSpeakerProps {
  onOpenModal?: () => void;
}

export function StyleSpeaker({ onOpenModal }: StyleSpeakerProps) {
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
        className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EADBCE] shadow-[0_12px_36px_rgba(163,61,18,0.08)] relative overflow-hidden"
      >
        {/* Speaker Photo & Bio Header */}
        <div className="flex flex-col sm:flex-row items-center gap-5 mb-6 text-center sm:text-left">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-[#D96B27] shadow-lg shrink-0 bg-[#FDF2E9]">
            <Image
              src="/IMG_2824.webp"
              alt="Віка Мещерякова"
              fill
              className="object-cover object-[center_12%]"
            />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-[#A33D12] bg-[#FDF2E9] border border-[#F5D6C1] px-2.5 py-0.5 rounded-full mb-1.5 font-manrope">
              ✦ Авторка та експертка з візуалу
            </div>
            <h3 className="font-playfair text-2xl font-bold text-[#231815] mb-1">
              Віка Мещерякова
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-[#231815]/80 font-medium mb-3">
              10+ років будує візуальні стратегії, які закохують аудиторію та приносять системні продажі
            </p>
            <a
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A33D12] hover:text-[#882F0B] transition-colors font-manrope bg-[#FEF5EE] px-3.5 py-1.5 rounded-full border border-[#F5D6C1] shadow-xs"
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

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6">
          <div className="bg-[#FEF5EE] p-3.5 rounded-2xl border border-[#F5D6C1] text-center">
            <div className="font-playfair text-xl sm:text-2xl font-black text-[#A33D12]">
              10+ років
            </div>
            <div className="font-manrope text-[11px] text-[#231815]/75 font-semibold leading-tight mt-0.5">
              у сфері контенту (з 2015 р.)
            </div>
          </div>
          <div className="bg-[#FEF5EE] p-3.5 rounded-2xl border border-[#F5D6C1] text-center">
            <div className="font-playfair text-xl sm:text-2xl font-black text-[#A33D12]">
              250+ учнів
            </div>
            <div className="font-manrope text-[11px] text-[#231815]/75 font-semibold leading-tight mt-0.5">
              пройшли навчання
            </div>
          </div>
          <div className="bg-[#FEF5EE] p-3.5 rounded-2xl border border-[#F5D6C1] text-center">
            <div className="font-playfair text-xl sm:text-2xl font-black text-[#A33D12]">
              3 ринки
            </div>
            <div className="font-manrope text-[11px] text-[#231815]/75 font-semibold leading-tight mt-0.5">
              США, Британія, Польща
            </div>
          </div>
          <div className="bg-[#FEF5EE] p-3.5 rounded-2xl border border-[#F5D6C1] text-center">
            <div className="font-playfair text-xl sm:text-2xl font-black text-[#A33D12]">
              100+ розборів
            </div>
            <div className="font-manrope text-[11px] text-[#231815]/75 font-semibold leading-tight mt-0.5">
              реальних блогів до результату
            </div>
          </div>
        </div>

        {/* Selling Facts & Credentials */}
        <div className="space-y-3 font-manrope text-xs sm:text-sm text-[#231815]/90 border-t border-[#EADBCE] pt-5">
          <div className="text-xs font-black uppercase tracking-wider text-[#A33D12] mb-1">
            Чому аудиторія та експерти обирають Віку:
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#FEF5EE]/70 rounded-2xl border border-[#F5D6C1]">
            <Globe className="w-5 h-5 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#231815] block font-bold mb-0.5">Міжнародний досвід та великі бренди</strong>
              <span className="text-[#231815]/80 leading-relaxed">
                Розробляла стратегії для світових брендів (зокрема Fisher) та вела контент для аудиторій Британії, США та Польщі.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#FEF5EE]/70 rounded-2xl border border-[#F5D6C1]">
            <Clock className="w-5 h-5 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#231815] block font-bold mb-0.5">Система «Контент за 30 хв без хаосу»</strong>
              <span className="text-[#231815]/80 leading-relaxed">
                Мама двох дітей. Для неї легкий та системний блог — це не теорія, а єдиний робочий формат у реальному житті без цілодобового сидіння в телефоні.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#FEF5EE]/70 rounded-2xl border border-[#F5D6C1]">
            <BookOpen className="w-5 h-5 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#231815] block font-bold mb-0.5">5 років викладання та простої мови</strong>
              <span className="text-[#231815]/80 leading-relaxed">
                Виробила покрокову методологію, яка легко пояснює композицію, світло, стиль та позиціонування для будь-якої ніші.
              </span>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#FEF5EE]/70 rounded-2xl border border-[#F5D6C1]">
            <Sparkles className="w-5 h-5 text-[#D96B27] shrink-0 mt-0.5" />
            <div>
              <strong className="text-[#231815] block font-bold mb-0.5">Пройшла шлях з самого нуля</strong>
              <span className="text-[#231815]/80 leading-relaxed">
                Починала з авторських виробів ручної роботи, де особисто будувала продажі через естетику. Точно знає, де ти зараз застрягла і як вивести твій блог на новий рівень.
              </span>
            </div>
          </div>
        </div>

        {/* Victoria's Manifest Quote */}
        <div className="mt-5 bg-[#1F1410] text-white p-5 rounded-2xl border border-[#3A261D] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D96B27]/15 rounded-full blur-2xl pointer-events-none" />
          <p className="font-playfair italic text-sm sm:text-base text-[#F5C7A3] leading-relaxed mb-2">
            «Я не вчу робити „просто красиву стрічку“. Я показую, як знайти свій справжній стиль, який виділяє тебе серед сотень однакових акаунтів, транслює твої сенси та приносить продажі.»
          </p>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-white/70 font-manrope">
            — Вікторія Мещерякова
          </div>
        </div>

        {/* Action Button */}
        {onOpenModal && (
          <div className="mt-6 pt-2">
            <button
              onClick={onOpenModal}
              className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_14px_34px_rgba(200,90,23,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
            >
              <span>Хочу навчатися у Віки безкоштовно</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
}
