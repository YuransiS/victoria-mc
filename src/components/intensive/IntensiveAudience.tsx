"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

interface IntensiveAudienceProps {
  onOpenCheckout?: () => void;
}

const audiencePoints = [
  {
    title: "Результат залежить від випадку",
    desc: "Ти регулярно ведеш блог, але не можеш пояснити, чому один контент набирає охоплення, а інший — ні. Відчуваєш, що граєш у рулетку з алгоритмами."
  },
  {
    title: "Нерозуміння, що саме працює",
    desc: "Ти можеш витратити 3 години на контент, який ніхто не побачить, а потім за 15 хвилин зробити пост чи рілс, який раптом «залітає». І ти досі не розумієш, що саме спрацювало."
  },
  {
    title: "Перевантаження суперечливими порадами",
    desc: "Ти вже передивилась купу порад про алгоритми, тренди та «секрети охоплень», але замість ясності отримала ще більше інформації, яку не знаєш, як застосувати."
  },
  {
    title: "Думки, що «проблема в мені»",
    desc: "Ти постійно думаєш, що проблема в тобі. Хоча насправді тобі просто ніхто не показав, як вибудувати контент так, щоб ти розуміла, навіщо створюєш кожну одиницю контенту і на який результат вона має працювати."
  },
  {
    title: "Втома від хаосу та копіювання",
    desc: "Ти більше не хочеш сподіватися на удачу. Не хочеш навмання вигадувати теми, копіювати чужі формати та сподіватися, що цього разу «пощастить»."
  }
];

export function IntensiveAudience({ onOpenCheckout }: IntensiveAudienceProps) {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/15 text-white/80 font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <span>Діагностика ситуації</span>
          </div>

          <h2 className="font-inter text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            ЦЕ ПРО ТЕБЕ, <span className="text-[#fff500]">ЯКЩО:</span>
          </h2>
          <div className="w-16 h-0.5 bg-[#fff500] mx-auto mt-4" />
        </div>

        <div className="space-y-4 mb-12">
          {audiencePoints.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-[#18181a] border-l-4 border-[#fff500] border-y border-r border-white/10 p-5 sm:p-7 shadow-[4px_4px_0px_rgba(0,0,0,0.3)] hover:border-white/25 transition-all"
            >
              <div className="flex items-start gap-4">
                <span className="text-xl sm:text-2xl mt-0.5">🔹</span>
                <div>
                  <h3 className="font-inter text-base sm:text-lg font-bold text-white mb-1.5">
                    {item.title}
                  </h3>
                  <p className="font-manrope text-sm sm:text-base text-white/80 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Conclusion Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-[#1a1a1f] to-[#141416] border-2 border-[#fff500] p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.5)] text-center"
        >
          <p className="font-inter text-lg sm:text-2xl font-black text-white uppercase leading-snug mb-6">
            Тобі потрібна система, яка пояснює,{" "}
            <span className="text-[#fff500]">
              що створювати, як це створювати, як привертати увагу аудиторії та як переводити її в клієнтів.
            </span>
          </p>

          {onOpenCheckout && (
            <button
              onClick={onOpenCheckout}
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#fff500] text-black font-inter font-black text-xs sm:text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer"
            >
              <span>Побудувати свою систему за 9€</span>
              <ArrowRight size={16} />
            </button>
          )}
        </motion.div>
      </div>
    </section>
  );
}
