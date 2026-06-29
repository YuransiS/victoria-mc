"use client";

import React from "react";

export const TestimonialsSection = () => {
  return (
    <section className="bg-surface py-32 px-8 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto">
        <div className="mb-20 text-center">
          <span className="font-space text-xs uppercase tracking-[0.5em] text-secondary-custom">
            Відгуки випускників
          </span>
          <h2 className="font-manrope font-extrabold text-5xl md:text-7xl mt-4 uppercase">
            Результати в реальному часі
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Chat Review 1 */}
          <div className="flex flex-col gap-4">
            <div className="chat-bubble chat-bubble-received">
              <p className="font-space text-[10px] font-bold text-primary-brand mb-2">Olichka Daranyi</p>
              <p className="text-sm leading-relaxed">
                Вона неймовірна, я настільки щаслива, що познайомилася з тобою, що попала до тебе на навчання. Я настільки вдячна тобі, це було дійсно неперевершено і твоя допомога та підтримка надихали створювати щось прекрасне...
              </p>
            </div>
            <div className="chat-bubble chat-bubble-sent">
              <p className="text-sm">Твій курс то ❤️</p>
            </div>
          </div>
          {/* Chat Review 2 */}
          <div className="flex flex-col gap-4">
            <div className="chat-bubble chat-bubble-received">
              <p className="font-space text-[10px] font-bold text-primary-brand mb-2">Тетяна</p>
              <p className="text-sm leading-relaxed">
                Мені дуже зайшло: і як естетично оформлений був кабінет, і сама структура, і взагалі обсяг нової інформації, сам підхід до подачі і фідбек, все дуже надихаюче та корисно! Дякую величезне!
              </p>
            </div>
          </div>
          {/* Chat Review 3 */}
          <div className="flex flex-col gap-4">
            <div className="chat-bubble chat-bubble-received">
              <p className="font-space text-[10px] font-bold text-primary-brand mb-2">Kristina</p>
              <p className="text-sm leading-relaxed">
                А взагалі за навчання хочу тобі подякувати, твій весь час фідбек це просто неймовірно і твої уроки теж 🔥🔥🔥
              </p>
            </div>
            <div className="chat-bubble chat-bubble-received">
              <p className="font-space text-[10px] font-bold text-primary-brand mb-2">Olexandera Ferber</p>
              <p className="text-sm leading-relaxed">
                Я так вдячна тобі що ти написала. Це тооочно буде найщиріший курс який я проходила у саме серденько!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
