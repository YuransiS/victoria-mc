"use client";

import React from "react";
import styles from "./PracticumResults.module.css";
import { motion } from "framer-motion";

export function PracticumResults() {
  const results = [
    {
      title: "Активація підписників",
      desc: "Підписники, які давно мовчали — почнуть писати вам у дірект та цікавитись життям.",
    },
    {
      title: "Ясність послуг",
      desc: "Люди, які давно дивляться — нарешті зрозуміють, чим ви займаєтесь і як до вас звернутись.",
    },
    {
      title: "Перші запити",
      desc: "Отримаєте перші запити на послугу або продукт, які ви так довго відкладали запускати.",
    },
    {
      title: "Вихід із чернеток",
      desc: "Ви нарешті опублікуєте той контент, який місяцями лежав у чернетках та чекав свого часу.",
    },
    {
      title: "Легкість створення",
      desc: "Ви перестанете думати, що знімати — і почнете просто впевнено робити результат.",
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
                transition={{ delay: i * 0.05, duration: 0.4 }}
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
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <a href="#register" className={styles.ctaButton}>
            <span>ГОТОВА ОТРИМАТИ ТАКІ РЕЗУЛЬТАТИ</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
