"use client";

import React from "react";
import styles from "./PracticumFAQ.module.css";
import { motion } from "framer-motion";

export function PracticumFAQ() {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div 
          className={styles.content}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className={styles.title}>Є ЯКІСЬ ПИТАННЯ?</h2>
          <p className={styles.desc}>
            Якщо у тебе виникли труднощі з оплатою або залишились питання по програмі — пиши мені особисто в Telegram.
          </p>
          
          <a 
            href="https://telegram.me/vika_cooperation" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.contactBtn}
          >
            <span>ЗВ'ЯЗАТИСЯ ЗІ МНОЮ</span>
            <span className={styles.tag}>(особистий контакт)</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
