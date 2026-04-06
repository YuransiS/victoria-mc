"use client";

import React from "react";
import styles from "./SharedBlocks.module.css";
import { Button } from "@/components/Button";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function Block2Learning() {
  return (
    <section className={`${styles.section} ${styles.sectionAlt}`}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>На майстер-класі:</h2>
      </motion.div>
      <motion.div 
        className={styles.listGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>1</span>
          <p className={styles.listItemText}>Дізнаєшся про свої ключові помилки, через які твій блог прямо зараз не приносить замовлень та заявок. Та отримаєш готові рішення, як їх виправити і що для цього потрібно.</p>
        </motion.div>
        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>2</span>
          <p className={styles.listItemText}>Складеш план на 9 фото зі змістом саме під свою нішу, щоб закрити питання контенту на 2 тижні наперед.</p>
        </motion.div>
        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>3</span>
          <p className={styles.listItemText}>Отримаєш покроковий план, як об’єднати мету твого блогу, теми постів та візуал у єдину робочу систему.</p>
        </motion.div>
        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>4</span>
          <p className={styles.listItemText}>Навчишся вкладати сенси у шрифти та деталі кадру, щоб продавати свою експертність, не пишучи полотна тексту.</p>
        </motion.div>
        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>5</span>
          <p className={styles.listItemText}>Дізнаєшся алгоритм «30 хвилин», за яким зможеш знімати якісний контент вдома біля вікна без допомоги студій та фотографів.</p>
        </motion.div>
      </motion.div>
      <motion.div 
        style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <a href="#register">
          <Button variant="primary">ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ</Button>
        </a>
      </motion.div>
    </section>
  );
}
