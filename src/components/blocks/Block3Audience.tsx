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
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

export function Block3Audience() {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>Цей майстер-клас для тебе, якщо:</h2>
      </motion.div>
      <motion.div 
        className={styles.listGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Ти ведеш блог, але не розумієш, чому він не приносить стабільних заявок та продажів. Хочеш зрозуміти, що саме зараз гальмує твій ріст і що варто змінити.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Тобі набридло постійно шукати нові ідеї. Хочеш вибудувати систему контенту, щоб знати, що публікувати, без хаосу та вигорання.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Ти відчуваєш, що твоя експертність сильніша, ніж те, як вона виглядає у блозі. Хочеш, щоб контент викликав довіру, а не просто набирав перегляди.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Ти в обмежених ресурсах (мама, емігрант, найм). Маєш лише 30 хвилин вільного часу і хочеш, щоб контент став простою звичкою, як пити вітаміни.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Витрачаєш 4 години на Instagram, а результат - 0. Втомилася від хаотичних думок «що постити сьогодні» і хочеш мати готовий покроковий протокол дій.</p>
        </motion.div>
      </motion.div>
      <motion.div 
        className="hidden-mobile"
        style={{ marginTop: "3rem", display: "flex", justifyContent: "center" }}
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <a href="#register">
          <Button variant="primary" className={styles.mainPageButton}>ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ</Button>
        </a>
      </motion.div>
    </section>
  );
}
