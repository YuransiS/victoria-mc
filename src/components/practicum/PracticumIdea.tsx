"use client";

import React from "react";
import styles from "./PracticumIdea.module.css";
import { motion } from "framer-motion";

export function PracticumIdea() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        
        {/* ГОЛОВНА ІДЕЯ */}
        <motion.div 
          className={styles.headerBlock}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>ГОЛОВНА ІДЕЯ</h2>
          <motion.div 
            className={styles.ideaCards} 
            variants={containerVariants} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }}
          >
            <motion.div className={styles.ideaCard} variants={itemVariants}>
              <span className={styles.crossIcon}>✕</span>
              <p>Це <b>НЕ КУРС</b>, який дивляться і забувають.</p>
            </motion.div>
            <motion.div className={styles.ideaCard} variants={itemVariants}>
              <span className={styles.crossIcon}>✕</span>
              <p>Це <b>НЕ МАРАФОН</b>, де всі мовчать і слухають.</p>
            </motion.div>
            <motion.div className={`${styles.ideaCard} ${styles.highlightCard}`} variants={itemVariants}>
              <span className={styles.checkIcon}>✓</span>
              <p>Це <b>ЧЕЛЕНДЖ</b>, де ти робиш разом з усіма. Щодня. І бачиш результат.</p>
            </motion.div>
          </motion.div>
          <p className={styles.ideaSummary}>
            Закрита спільнота. 7 днів. Одна ціль — <b>твої сторіз починають працювати на тебе.</b>
          </p>
        </motion.div>

        {/* КОНЦЕПЦІЯ ЧЕЛЕНДЖУ */}
        <motion.div 
          className={styles.conceptBlock}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <h2 className={styles.title}>КОНЦЕПЦІЯ ЧЕЛЕНДЖУ</h2>
          <p className={styles.conceptText}>
            Моя методологія — це завжди про дію і практику. Не суха теорія, яку треба "потім впровадити". А результат, який ти бачиш вже під час навчання.
          </p>
          <p className={styles.conceptTextHighlight}>
            Саме так побудований цей <b>ПРАКТИКУМ</b>.
          </p>

          <div className={styles.formula}>
            <span>ОТРИМАЙ ЗАВДАННЯ</span>
            <span className={styles.arrow}>→</span>
            <span>ЗРОБИ</span>
            <span className={styles.arrow}>→</span>
            <span className={styles.highlightText}>ПОБАЧ РЕЗУЛЬТАТ</span>
          </div>

          <div className={styles.dailyList}>
            <motion.div className={styles.dailyItem} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className={styles.dailyDot} />
              <p><b>Щодня</b> — одне завдання.</p>
            </motion.div>
            <motion.div className={styles.dailyItem} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className={styles.dailyDot} />
              <p><b>Щодня</b> — один результат.</p>
            </motion.div>
            <motion.div className={styles.dailyItem} variants={itemVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <div className={styles.dailyDot} />
              <p><b>Щодня</b> — живий фідбек у спільноті.</p>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
