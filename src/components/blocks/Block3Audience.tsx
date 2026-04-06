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
        <h2 className={styles.sectionTitle}>Цей майстер-клас тобі необхідний, якщо:</h2>
      </motion.div>
      <motion.div 
        className={styles.listGrid}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Витрачаєш 4 години на Instagram, а результат - 0. Втомилася від хаотичних думок «що постити сьогодні» і хочеш мати готовий покроковий протокол дій.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Твій блог виглядає «дешевше», ніж твоя експертність. Хочеш обґрунтовано підняти чек на свої послуги через професійну візуальну упаковку.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Боїшся камери або видаляєш пости через 2 дні. Потребуєш впевненості, яка з’являється лише тоді, коли контент побудований на твердому фундаменті, а не на натхненні.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Ти в обмежених ресурсах (мама, емігрант, найм). Маєш лише 30 хвилин вільного часу і хочеш, щоб контент став простою звичкою, як пити вітаміни.</p>
        </motion.div>
        <motion.div className={styles.listItemAlt} variants={itemVariants}>
          <p className={styles.listItemText}>Ти - SMM-ник, який взуває клієнтів, але «босий» сам. Хочеш нарешті вийти із тіні та побудувати власний сильний бренд, який приносить замовлення на твій чек.</p>
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
