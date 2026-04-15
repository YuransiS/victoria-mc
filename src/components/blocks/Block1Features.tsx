"use client";

import React from "react";
import styles from "./Block1Hero.module.css";
import { motion } from "framer-motion";

export function Block1Features() {
  return (
    <section className={styles.featuresMobileSection}>
      <motion.div 
        className={styles.container}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <p className={styles.featuresIntro}>
          Створи систему нативних продажів через особистий стиль та сенси за 30 хвилин на день - без оренди студій, складних програм та 4-годинних зйомок.
        </p>

        <div className={styles.featuresGrid}>
          <div className={styles.featureItemMobile}>
            <span className={styles.featureLabel}>30 хвилин</span>
            <span className={styles.featureDesc}>час на створення якісного контенту за моїм алгоритмом</span>
          </div>
          <div className={styles.featureItemMobile}>
            <span className={styles.featureLabel}>9 кадрів</span>
            <span className={styles.featureDesc}>готова візуальна система та теми на 2 тижні вперед</span>
          </div>
          <div className={styles.featureItemMobile}>
            <span className={styles.featureLabel}>0 грн</span>
            <span className={styles.featureDesc}>бюджет на студію: вчимося «бачити кадр» у звичайній квартирі</span>
          </div>
          <div className={styles.featureItemMobile}>
            <span className={styles.featureLabel}>Нативні продажі</span>
            <span className={styles.featureDesc}>донесення цінності через сенси, а не через нудні тексти</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
