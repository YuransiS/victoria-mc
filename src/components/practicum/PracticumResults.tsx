"use client";

import React from "react";
import styles from "./PracticumResults.module.css";
import { motion } from "framer-motion";

export function PracticumResults() {
  const results = [
    {
      title: "Контент — це легко",
      desc: "Ти більше не сидиш перед порожнім екраном. У тебе є система — проста, зрозуміла, твоя.",
    },
    {
      title: "Розкрий себе",
      desc: "Почнеш говорити те, що думаєш. Автентичність стане твоєю суперсилою.",
    },
    {
      title: "Продажі через сенси",
      desc: "Люди самі питають «як до тебе записатись», бо ти показуєш правильні тригери.",
    },
    {
      title: "Стиль та естетика",
      desc: "Без годин у Canva. Отримуєш прості принципи, що роблять сторіз візуально дорогими.",
    },
    {
      title: "Регулярність без вигорань",
      desc: "Зручний ритм з розумінням що і коли знімати. Контент дає результат, а не забирає час.",
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <h2 className={styles.title}>ЩО ТИ ОТРИМАЄШ <br /> ПІСЛЯ 7 ДНІВ</h2>
          
          <div className={styles.list}>
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={styles.item}
              >
                <div className={styles.check}>✓</div>
                <div className={styles.text}>
                  <h3>{r.title}</h3>
                  <p>{r.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div 
          className={styles.ctaWrapper}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a href="#register" className={styles.ctaButton}>
            <span>ГОТОВА ОТРИМАТИ ТАКІ РЕЗУЛЬТАТИ</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
