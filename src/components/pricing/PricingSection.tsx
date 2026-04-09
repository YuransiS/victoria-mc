"use client";

import { useState, useEffect } from "react";
import { BookingModal } from "./BookingModal";
import { motion } from "framer-motion";

export const PricingSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingAmount, setSelectedBookingAmount] = useState<string>("");

  const handleBook = (amount: string) => {
    setSelectedBookingAmount(amount);
    setIsModalOpen(true);
  };

  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0); // Next midnight (00:00)
      const diff = midnight.getTime() - now.getTime();
      
      if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      
      return { hours, minutes, seconds };
    };

    // Initial set
    setTimeLeft(calculateTimeLeft());

    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="relative pb-32 px-4 md:px-8 bg-surface overflow-hidden"
      style={{
        backgroundImage: 'url(/pricing_bg_muted.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay to ensure readability - adjusted for the new background */}
      <div className="absolute inset-0 bg-white/40 z-0" />

      <div className="max-w-screen-2xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-stretch pt-20">
          
          {/* Plan 1: САМОСТІЙНИЙ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="postage-stamp flex flex-col items-center text-center !p-12"
          >
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-12">
              САМОСТІЙНИЙ
            </h3>
            <ul className="text-left w-full space-y-3 mb-16 flex-grow px-4">
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО ВСІХ МОДУЛІВ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО УРОКІВ НА 3 МІСЯЦІ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ПРИСУТНІСТЬ НА ЗУСТРІЧАХ ЯК ГЛЯДАЧ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-30 leading-tight line-through">• УЧАСТЬ В ЧЕЛЕНДЖАХ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-30 leading-tight line-through">• РОБОТА ЗІ СПІКЕРАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-30 leading-tight line-through">• ЧАТ З УЧАСНИКАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-30 leading-tight line-through">• ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-30 leading-tight line-through">• ГРУПОВІ ЗУМ-ЗУСТРІЧ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ</li>
            </ul>
            
            <div className="w-full space-y-2 mb-8 px-4">
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Повна ціна</span>
                <div className="font-headline text-3xl text-gray-400 line-through opacity-50">$550</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Ціна вебінару</span>
                <div className="font-headline text-4xl text-black font-bold opacity-70">$450</div>
              </div>
              <div className="mt-4 price-badge text-white py-4 px-8 rounded-xl w-full">
                <div className="flex flex-col items-center">
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/70 mb-1">При броні під час дзвінку</span>
                  <span className="font-headline text-5xl font-black tracking-tighter">$390</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleBook("20")}
              className="w-full bg-primary text-white py-5 px-4 font-headline font-extrabold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
            >
              ЗАБРОНЮВАТИ ЗА $20
            </button>
          </motion.div>

          {/* Plan 2: ГРУПОВИЙ - Visually Larger */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="postage-stamp flex flex-col items-center text-center !p-12 relative z-10 md:scale-110 md:mx-4 bg-white shadow-2xl"
          >
            {/* Best Choice Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-black text-white px-4 py-1 text-[10px] uppercase tracking-[0.2em] font-bold z-20">
              BEST CHOICE
            </div>
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-12">
              ГРУПОВИЙ
            </h3>
            <ul className="text-left w-full space-y-3 mb-16 flex-grow px-4">
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО ВСІХ МОДУЛІВ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• УЧАСТЬ В ЧЕЛЕНДЖАХ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• РОБОТА ЗІ СПІКЕРАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО УРОКІВ НА ПІВ РОКУ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ЧАТ З УЧАСНИКАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ГРУПОВІ ЗУМ-ЗУСТРІЧІ ТА РОЗБОРИ ЗІ МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ</li>
            </ul>

            <div className="w-full space-y-2 mb-8 px-4">
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Повна ціна</span>
                <div className="font-headline text-3xl text-gray-400 line-through opacity-50">$790</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Ціна вебінару</span>
                <div className="font-headline text-4xl text-black font-bold opacity-70">$590</div>
              </div>
              <div className="mt-4 price-badge text-white py-4 px-8 rounded-xl w-full border-2 border-primary/20">
                <div className="flex flex-col items-center">
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/70 mb-1">При броні під час дзвінку</span>
                  <span className="font-headline text-5xl font-black tracking-tighter">$490</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleBook("30")}
              className="w-full bg-primary text-white py-5 px-4 font-headline font-extrabold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
            >
              ЗАБРОНЮВАТИ ЗА $30
            </button>
          </motion.div>

          {/* Plan 3: ІНДИВІДУАЛЬНИЙ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="postage-stamp flex flex-col items-center text-center !p-12"
          >
            <h3 className="font-headline text-3xl md:text-4xl font-extrabold uppercase tracking-tight mb-12">
              ІНДИВІДУАЛЬНИЙ
            </h3>
            <ul className="text-left w-full space-y-3 mb-16 flex-grow px-4">
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО ВСІХ МОДУЛІВ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• УЧАСТЬ В ЧЕЛЕНДЖАХ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• РОБОТА ЗІ СПІКЕРАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ДОСТУП ДО УРОКІВ НА ПІВ РОКУ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ЧАТ З УЧАСНИКАМИ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ПЕРЕВІРКА ДЗ ОСОБИСТО МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ГРУПОВІ ЗУМ-ЗУСТРІЧІ ТА РОЗБОРИ ЗІ МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-bold uppercase tracking-tighter opacity-80 leading-tight">• ГОТОВІ ШАБЛОНИ ТА ДОДАТКОВІ МАТЕРІАЛИ</li>
              <li className="font-headline text-[11px] md:text-xs font-black uppercase tracking-tighter pt-2">+ ІНДИВІДУАЛЬНА РОБОТА НАД ВАШИМ КОНТЕНТОМ</li>
              <li className="font-headline text-[11px] md:text-xs font-black uppercase tracking-tighter">+ 2 ІНДИВІДУАЛЬНІ ЗУСТРІЧІ ЗІ МНОЮ</li>
              <li className="font-headline text-[11px] md:text-xs font-black uppercase tracking-tighter">+ МІСЯЦЬ ПІСЛЯ КУРСУ Я НА ЗВ&apos;ЯЗКУ</li>
            </ul>

            <div className="w-full space-y-2 mb-8 px-4">
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Повна ціна</span>
                <div className="font-headline text-3xl text-gray-400 line-through opacity-50">$1290</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-label text-[10px] uppercase tracking-widest text-secondary">Ціна вебінару</span>
                <div className="font-headline text-4xl text-black font-bold opacity-70">$1090</div>
              </div>
              <div className="mt-4 price-badge text-white py-4 px-8 rounded-xl w-full">
                <div className="flex flex-col items-center">
                  <span className="font-label text-[10px] uppercase tracking-widest text-white/70 mb-1">При броні під час дзвінку</span>
                  <span className="font-headline text-5xl font-black tracking-tighter">$890</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleBook("50")}
              className="w-full bg-primary text-white py-5 px-4 font-headline font-extrabold text-sm uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all"
            >
              ЗАБРОНЮВАТИ ЗА $50
            </button>
          </motion.div>
        </div>

        {/* Timer Section */}
        <div className="mt-20 text-center flex flex-col items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
            <p className="font-headline text-sm md:text-lg font-extrabold uppercase tracking-widest">
              ЦІНА ДІЄ ДО 00:00 ДЛЯ УЧАСНИКІВ ВЕБІНАРУ
            </p>
            <div className="flex gap-4 font-headline text-4xl font-black bg-black text-white px-6 py-2 rounded-lg">
              <span>{String(timeLeft.hours).padStart(2, '0')}</span>:
              <span>{String(timeLeft.minutes).padStart(2, '0')}</span>:
              <span>{String(timeLeft.seconds).padStart(2, '0')}</span>
            </div>
          </div>
          <p className="font-label text-[10px] uppercase tracking-widest text-secondary italic">
            при броні/оплаті під час дзвінку
          </p>
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
