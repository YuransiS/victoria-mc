"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface IntensiveAudienceProps {
  onOpenCheckout?: () => void;
}

const audiencePoints = [
  {
    num: "01",
    desc: "Ти регулярно ведеш блог, але не можеш пояснити, чому один контент набирає охоплення, а інший — ні. Результат залежить не від системи, а від випадку."
  },
  {
    num: "02",
    desc: "Ти можеш витратити 3 години на контент, який ніхто не побачить, а потім за 15 хвилин зробити пост чи рілс, який раптом «залітає». І ти досі не розумієш, що саме спрацювало."
  },
  {
    num: "03",
    desc: "Ти вже передивилась купу порад про алгоритми, тренди та «секрети охоплень», але замість ясності отримала ще більше інформації, яку не знаєш, як застосувати."
  },
  {
    num: "04",
    desc: "Ти постійно думаєш, що проблема в тобі. Хоча насправді тобі просто ніхто не показав, як вибудувати контент так, щоб ти розуміла, навіщо створюєш кожну одиницю контенту і на який результат вона має працювати."
  },
  {
    num: "05",
    desc: "Ти більше не хочеш сподіватися на удачу. Не хочеш навмання вигадувати теми, копіювати чужі формати та сподіватися, що цього разу «пощастить»."
  }
];

export function IntensiveAudience({ onOpenCheckout }: IntensiveAudienceProps) {
  return (
    <section className="px-5 md:px-10 py-16 md:py-24 bg-[#451220] text-[#FAF6EE] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <p className="font-playfair italic text-2xl sm:text-3xl opacity-80 mb-2">
            Впізнаєш себе?
          </p>
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-bold">
            ЦЕ ПРО ТЕБЕ, <span className="italic font-normal">ЯКЩО:</span>
          </h2>
        </div>

        {/* Grid of 5 Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {audiencePoints.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.07 }}
              className={`rounded-2xl bg-[#2B0813] text-[#FAF6EE] border border-[#FAF6EE]/15 p-6 sm:p-7 shadow-md flex flex-col justify-between ${
                idx === 4 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              <div>
                <div className="font-newsreader italic text-3xl sm:text-4xl text-[#E5B887] font-bold mb-3">
                  {item.num}
                </div>
                <p className="font-manrope text-sm sm:text-base text-[#FAF6EE]/90 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Conclusion Pill Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#FAF6EE] text-[#2B0813] rounded-2xl p-7 sm:p-10 text-center max-w-3xl mx-auto shadow-xl"
        >
          <h3 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold leading-snug mb-4">
            Тобі потрібна система, яка пояснює, що створювати, як це створювати, як привертати увагу аудиторії та як переводити її в клієнтів.
          </h3>

          {onOpenCheckout && (
            <button
              onClick={onOpenCheckout}
              className="mt-2 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm sm:text-base font-bold tracking-wide shadow-lg transition-all duration-300 bg-[#451220] text-[#FAF6EE] hover:bg-[#2B0813] cursor-pointer"
            >
              <span>Хочу побудувати систему за 9€</span>
              <ArrowRight size={18} />
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
