"use client";

import React from "react";
import styles from "./PracticumProgram.module.css";
import { motion } from "framer-motion";

export function PracticumProgram() {
  const days = [
    {
      day: "1 день",
      title: "Прогрів до особистості",
      desc: "Вчимося викликати інтерес до свого способу життя. Розкриваємо себе через змістовні сторіз, а не просто сухі факти.",
    },
    {
      day: "2 день",
      title: "Зв'язок через звички",
      desc: "Розкриваємо особистість через призму наших звичок, мислення та цінностей — спеціально для учасників практикуму. Будуємо глибший зв'язок з аудиторією.",
      bonus: "БОНУСНИЙ ВОЙС ЧАТ ДЛЯ ЗНАЙОМСТВ",
    },
    {
      day: "3 день",
      title: "Метод та експертність",
      desc: "Показуємо на власному досвіді, як працює твій метод та підхід. Прогріваємо до професійної компетенції.",
    },
    {
      day: "4 день",
      title: "Сила вразливості",
      desc: "Розкриваємось через помилки та факапи. Викликаємо довіру завдяки щирості та відкритості.",
    },
    {
      day: "5 день",
      title: "Цінність продукту",
      desc: "Підбірка на тему блогу: чому ваша ніша це круто і як це працює. Формуємо попит.",
      live: "ЖИВИЙ ЕФІР З РОЗБОРАМИ",
    },
    {
      day: "6 день",
      title: "Нативні продажі",
      desc: "Розповідаємо, як з нами поспівпрацювати. Беремо одну послугу та нативно продаємо ідею роботи з вами.",
    },
    {
      day: "7 день",
      title: "Продаючий сторітелнг",
      desc: "Будуємо цілісну історію, яка веде до запису на послугу чи купівлі продукту.",
      specialBonus: "🔥 БОНУС: АНАТОМІЯ КАРУСЕЛЬКИ (ТІЛЬКИ ДЛЯ ТИХ, ХТО ДІЙШОВ ДО КІНЦЯ)",
    },
  ];

  return (
    <section className={styles.section} id="program">
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>ПРОГРАМА ПРАКТИКУМУ</h2>
        
        <div className={styles.timeline}>
          <motion.div 
            className={styles.progressLine}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
          {days.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              className={`${styles.dayRow} ${i % 2 === 0 ? styles.left : styles.right}`}
            >
              <div className={styles.dayContent}>
                <div className={styles.dayNum}>{d.day}</div>
                <h3>{d.title}</h3>
                <p>{d.desc}</p>
                
                {d.bonus && <div className={styles.bonusTag}>{d.bonus}</div>}
                {d.live && <div className={styles.liveTag}>{d.live}</div>}
                {d.specialBonus && (
                  <div className={styles.specialBonusBox}>
                    <h4>{d.specialBonus}</h4>
                    <ul>
                      <li>Структура карусельки яку зберігають</li>
                      <li>Помилки та мінімалістичний дизайн</li>
                      <li>Практика: твоя перша карусель</li>
                    </ul>
                  </div>
                )}
              </div>
              <div className={styles.dot} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
