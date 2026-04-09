"use client";

import { useState } from "react";
import { BookingModal } from "./BookingModal";
import { motion } from "framer-motion";
import { usePersistentTimer } from "@/hooks/usePersistentTimer";

interface Feature {
  text: string;
  included: boolean;
  bold?: boolean;
}

interface PriceSet {
  badge: string;
  secondary: string;
  full: string;
}

interface Tariff {
  id: string;
  name: string;
  isBestChoice?: boolean;
  features: Feature[];
  prices: {
    special: PriceSet;
    regular: PriceSet;
  };
}

const TARIFFS: Tariff[] = [
  {
    id: "self",
    name: "САМОСТІЙНИЙ",
    features: [
      { text: "ДОСТУП ДО ВСІХ МОДУЛІВ", included: true },
      { text: "ДОСТУП ДО УРОКІВ НА 3 МІСЯЦІ", included: true },
      { text: "ПРИСУТНІСТЬ НА ЗУСТРІЧАХ ЯК ГЛЯДАЧ", included: true },
      { text: "УЧАСТЬ В ЧЕЛЕНДЖАХ", included: false },
      { text: "РОБОТА ЗІ СПІКЕРАМИ", included: false },
      { text: "ЧАТ З УЧАСНИКАМИ", included: false },
      { text: "ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ", included: false },
      { text: "ГРУПОВІ ЗУМ-ЗУСТРІЧ", included: false },
      { text: "ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ", included: true },
    ],
    prices: {
      special: { badge: "$390", secondary: "$450", full: "$550" },
      regular: { badge: "$450", secondary: "$550", full: "$650" }
    }
  },
  {
    id: "group",
    name: "ГРУПОВИЙ",
    isBestChoice: true,
    features: [
      { text: "ДОСТУП ДО ВСІХ МОДУЛІВ", included: true },
      { text: "УЧАСТЬ В ЧЕЛЕНДЖАХ", included: true },
      { text: "РОБОТА ЗІ СПІКЕРАМИ", included: true },
      { text: "ДОСТУП ДО УРОКІВ НА ПІВ РОКУ", included: true },
      { text: "ЧАТ З УЧАСНИКАМИ", included: true },
      { text: "ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ", included: true },
      { text: "ГРУПОВІ ЗУМ-ЗУСТРІЧІ ТА РОЗБОРИ ЗІ МНОЮ", included: true },
      { text: "ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ", included: true },
    ],
    prices: {
      special: { badge: "$490", secondary: "$590", full: "$790" },
      regular: { badge: "$590", secondary: "$790", full: "$990" }
    }
  },
  {
    id: "individual",
    name: "ІНДИВІДУАЛЬНИЙ",
    features: [
      { text: "ДОСТУП ДО ВСІХ МОДУЛІВ", included: true },
      { text: "УЧАСТЬ В ЧЕЛЕНДЖАХ", included: true },
      { text: "РОБОТА ЗІ СПІКЕРАМИ", included: true },
      { text: "ДОСТУП ДО УРОКІВ НА ПІВ РОКУ", included: true },
      { text: "ЧАТ З УЧАСНИКАМИ", included: true },
      { text: "ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ", included: true },
      { text: "ГРУПОВІ ЗУМ-ЗУСТРІЧІ ТА РОЗБОРИ ЗІ МНОЮ", included: true },
      { text: "ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ", included: true },
      { text: "ІНДИВІДУАЛЬНА РОБОТА НАД ВАШИМ КОНТЕНТОМ", included: true, bold: true },
      { text: "2 ІНДИВІДУАЛЬНІ ЗУСТРІЧІ ЗІ МНОЮ", included: true, bold: true },
      { text: "МІСЯЦЬ ПІСЛЯ КУРСУ Я НА ЗВ'ЯЗКУ", included: true, bold: true },
    ],
    prices: {
      special: { badge: "$890", secondary: "$1090", full: "$1290" },
      regular: { badge: "$1090", secondary: "$1290", full: "$1590" }
    }
  }
];

export const PricingSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTariff, setSelectedTariff] = useState<{name: string, amount: number}>({name: "", amount: 1000});
  
  const { isExpired, timeParts } = usePersistentTimer(24);

  const handleBook = (tariffName: string) => {
    setSelectedTariff({ name: tariffName, amount: 1000 });
    setIsModalOpen(true);
  };

  return (
    <section 
      className="relative pb-32 px-4 md:px-8 bg-surface overflow-hidden"
      style={{
        backgroundImage: 'url(/pricing_bg_muted.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-white/40 z-0" />

      <div className="max-w-screen-2xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch pt-20">
          {TARIFFS.map((tariff, index) => {
            const currentPrices = isExpired ? tariff.prices.regular : tariff.prices.special;
            
            return (
              <motion.div 
                key={tariff.id}
                id={tariff.id === 'group' ? 'group-tariff' : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`postage-stamp flex flex-col items-center text-center !p-12 relative ${
                  tariff.isBestChoice ? "z-10 md:scale-110 md:mx-4 bg-white shadow-2xl" : ""
                }`}
              >
                {tariff.isBestChoice && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold z-20">
                    BEST CHOICE
                  </div>
                )}
                
                <h3 className="font-headline text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-12">
                  {tariff.name}
                </h3>

                <ul className="text-left w-full space-y-3 mb-16 flex-grow px-4">
                  {tariff.features.map((feature, fIndex) => (
                    <li 
                      key={fIndex}
                      className={`font-headline text-[11px] md:text-xs uppercase tracking-tighter leading-tight ${
                        feature.included ? "opacity-80 font-bold" : "opacity-30 line-through"
                      } ${feature.bold ? "font-black pt-2" : ""}`}
                    >
                      • {feature.text}
                    </li>
                  ))}
                </ul>

                <div className="w-full space-y-2 mb-8 px-4">
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Повна ціна</span>
                    <div className="font-headline text-3xl text-gray-400 line-through opacity-50">{currentPrices.full}</div>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Ціна вебінару</span>
                    <div className="font-headline text-4xl text-black font-bold opacity-70">{currentPrices.secondary}</div>
                  </div>
                  <div className={`mt-4 price-badge text-white py-4 px-8 rounded-xl w-full ${tariff.isBestChoice ? "border-2 border-primary/20" : ""}`}>
                    <div className="flex flex-col items-center">
                      <span className="font-label text-[10px] uppercase tracking-widest text-white/70 mb-1">
                        {isExpired ? "Спеціальна ціна" : "При броні зараз"}
                      </span>
                      <span className="font-headline text-5xl font-black tracking-tighter">{currentPrices.badge}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={() => handleBook(tariff.name)}
                  className="w-full bg-primary text-white py-5 px-4 font-headline font-extrabold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  ЗАБРОНЮВАТИ ЗА 1000 ГРН
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Timer Section */}
        {!isExpired && (
          <div className="mt-20 text-center flex flex-col items-center gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <p className="font-headline text-sm md:text-lg font-extrabold uppercase tracking-widest">
                СПЕЦІАЛЬНА ЦІНА ДІЄ ЩЕ:
              </p>
              <div 
                className="flex gap-4 font-headline text-4xl font-black bg-black text-white px-6 py-2 rounded-lg cursor-pointer"
                onClick={(e) => {
                  if (e.detail === 3) {
                    localStorage.removeItem('visitStartTime');
                    window.location.reload();
                  }
                }}
                title="Triple click to reset (Dev)"
              >
                <span>{String(timeParts.hours).padStart(2, '0')}</span>:
                <span>{String(timeParts.minutes).padStart(2, '0')}</span>:
                <span>{String(timeParts.seconds).padStart(2, '0')}</span>
              </div>
            </div>
            <p className="font-label text-[10px] uppercase tracking-widest text-secondary italic">
              зафіксуйте вартість поки таймер не вичерпався
            </p>
          </div>
        )}

        {isExpired && (
          <div className="mt-20 text-center flex flex-col items-center gap-6">
            <p className="font-headline text-sm md:text-lg font-extrabold uppercase tracking-widest text-red-600">
              ЧАС ДІЇ СПЕЦІАЛЬНОЇ ПРОПОЗИЦІЇ МИНУВ
            </p>
            <p className="font-label text-xs uppercase tracking-widest text-secondary">
              тепер доступні стандартні ціни
            </p>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tariffName={selectedTariff.name}
        amount={selectedTariff.amount}
      />
    </section>
  );
};
