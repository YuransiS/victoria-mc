"use client";

import { useState } from "react";
import { BookingModal } from "./BookingModal";

export const PricingSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingAmount, setSelectedBookingAmount] = useState<string>("");

  const handleBook = (amount: string) => {
    setSelectedBookingAmount(amount);
    setIsModalOpen(true);
  };

  return (
    <section className="relative w-full min-h-screen bg-black py-24 px-6 lg:px-12 flex flex-col">
      <div className="container mx-auto z-10">
        <p className="font-inter text-sm text-[#9e9e9e] mb-4 tracking-widest uppercase">
          02 / ФОРМАТИ ТА БРОНЬ
        </p>
        <h2 className="font-manrope text-4xl md:text-5xl text-[#c6c6c7] font-bold uppercase mb-16">
          Обери свій рівень
        </h2>

        {/* Special Offer Glassmorphism Panel */}
        <div className="relative mb-24 max-w-4xl mx-auto">
          <div className="absolute inset-0 bg-white/5 backdrop-blur-[20px] shadow-[0_40px_60px_rgba(0,0,0,0.4)] z-0" />
          <div className="relative z-10 p-8 md:p-12">
            <h3 className="font-manrope text-xl md:text-2xl text-white font-bold mb-4">
              УМОВИ ДЛЯ УЧАСНИКІВ ВЕБІНАРУ
            </h3>
            <p className="font-inter text-[#e0e0e0] text-base md:text-lg mb-6 leading-relaxed">
              Забронюйте місце прямо зараз, щоб зафіксувати найнижчу ціну та отримати спеціальні бонуси. Сума броні входить у загальну вартість.
            </p>
            <ul className="font-inter text-[#c6c6c7] text-base md:text-lg space-y-3 pl-4">
              <li className="relative before:content-['—'] before:absolute before:-left-6">
                Спеціальна ціна зі знижкою
              </li>
              <li className="relative before:content-['—'] before:absolute before:-left-6">
                Журнал з ідеями «Створюй» у подарунок
              </li>
            </ul>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch justify-center">
          {/* Card 1: Самостійний */}
          <div className="flex-1 bg-[#000000] p-10 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h3 className="font-manrope text-3xl text-white font-bold mb-8">Самостійний</h3>
            <ul className="font-inter text-[#e0e0e0] space-y-4 mb-12 flex-grow">
              <li>Доступ до всіх модулів</li>
              <li>Доступ до уроків на 3 місяці</li>
              <li>Присутність на зустрічах як глядач</li>
            </ul>
            <div className="mb-8">
              <p className="text-[#6e6e6e] line-through text-sm mb-1">$450</p>
              <p className="font-manrope text-4xl text-white font-bold">$390</p>
            </div>
            <button
              onClick={() => handleBook("20")}
              className="w-full bg-[#c6c6c7] text-black font-inter font-semibold py-4 uppercase tracking-wide hover:bg-white transition-colors duration-300 shadow-[0_40px_60px_rgba(198,198,199,0.08)]"
            >
              Забронювати за $20
            </button>
          </div>

          {/* Card 2: Груповий (Accent) */}
          <div className="flex-1 bg-[#121212] p-10 flex flex-col transform lg:-translate-y-4 shadow-[0_40px_80px_rgba(0,0,0,0.8)] relative z-20">
            <h3 className="font-manrope text-3xl text-white font-bold mb-8">Груповий</h3>
            <ul className="font-inter text-[#e0e0e0] space-y-4 mb-12 flex-grow">
              <li>Доступ до всіх модулів на пів року</li>
              <li>Участь в челенджах</li>
              <li>Перевірка ДЗ особисто мною</li>
              <li>Групові зум-зустрічі та розбори</li>
              <li>Готові шаблони та матеріали</li>
            </ul>
            <div className="mb-8">
              <p className="text-[#6e6e6e] line-through text-sm mb-1">$590</p>
              <p className="font-manrope text-4xl text-white font-bold">$490</p>
            </div>
            <button
              onClick={() => handleBook("30")}
              className="w-full bg-[#c6c6c7] text-black font-inter font-semibold py-4 uppercase tracking-wide hover:bg-white transition-colors duration-300 shadow-[0_40px_60px_rgba(198,198,199,0.08)]"
            >
              Забронювати за $30
            </button>
          </div>

          {/* Card 3: Індивідуальний */}
          <div className="flex-1 bg-[#252626] p-10 flex flex-col shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
            <h3 className="font-manrope text-3xl text-white font-bold mb-8">Індивідуальний</h3>
            <ul className="font-inter text-[#e0e0e0] space-y-4 mb-12 flex-grow">
              <li>Все, що в груповому тафірі</li>
              <li>Індивідуальна робота над вашим контентом</li>
              <li>2 індивідуальні зустрічі зі мною</li>
              <li>Місяць особистої підтримки після курсу</li>
            </ul>
            <div className="mb-8">
              <p className="text-[#6e6e6e] line-through text-sm mb-1">$1090</p>
              <p className="font-manrope text-4xl text-white font-bold">$890</p>
            </div>
            <button
              onClick={() => handleBook("50")}
              className="w-full bg-transparent border border-[#c6c6c7]/20 text-[#c6c6c7] font-inter font-semibold py-4 uppercase tracking-wide hover:bg-white/5 transition-colors duration-300 shadow-[0_40px_60px_rgba(198,198,199,0.04)]"
            >
              Забронювати за $50
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        amount={selectedBookingAmount}
      />
    </section>
  );
};
