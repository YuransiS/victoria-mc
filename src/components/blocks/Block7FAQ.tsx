"use client";

import React from "react";
import styles from "./Block7FAQ.module.css";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};

export function Block7FAQ() {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>FAQ</h2>
        <p className={styles.sectionSubtitle}>Відповіді на ваші запитання</p>
      </motion.div>
      
      <motion.div 
        className={styles.faqList}
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        <motion.div className={styles.faqItem} variants={itemVariants}>
          <h4 className={styles.faqQ}>1. Чи підійде мені майстер-клас, якщо у мене «нудна» ніша (бухгалтерія, юрист, будівництво)?</h4>
          <div className={styles.faqA}>
            Так. Ми розбираємо не те, як танцювати у Reels, а як через візуал та сенси донести інформацію про вас, вашу експертність, ваш бренд, послугу, інфопродукт та нішу. Будь-яка ніша стає привабливою, коли в ній з’являється жива людина та зрозумілі сенси.
          </div>
        </motion.div>
        
        <motion.div className={styles.faqItem} variants={itemVariants}>
          <h4 className={styles.faqQ}>2. Чи потрібна мені дорога камера та професійне світло?</h4>
          <div className={styles.faqA}>
            Ні. Вся система «СТВОРЮЙ» побудована на роботі зі звичайним смартфоном та денним світлом біля вікна. Я покажу технічні налаштування камери, які створюють «дорогу» картинку без жодних додаткових витрат.
          </div>
        </motion.div>
        
        <motion.div className={styles.faqItem} variants={itemVariants}>
          <h4 className={styles.faqQ}>3. Що робити, якщо я не творча людина і не маю смаку?</h4>
          <div className={styles.faqA}>
            Система - це не про творчість, а про логіку та алгоритм. Ви отримаєте чіткий план дій простою мовою: як створювати візуал та розпаковувати сенси через які ви будете спілкуватися зі своєю аудиторією.
          </div>
        </motion.div>
        
        <motion.div className={styles.faqItem} variants={itemVariants}>
          <h4 className={styles.faqQ}>4. Я вже проходила курси з SMM та маркетингу. Чи буде тут щось нове?</h4>
          <div className={styles.faqA}>
            Більшість курсів вчать технічним навичкам або теорії. Я даю систему «Візуал зі сенсами», де ми вчимося транслювати ваші цінності, підхід професійно через контент. Це глибинна розпаковка, якої немає в стандартних програмах. Також, ви побачите роботу з моїм авторським Digital Workbook.
          </div>
        </motion.div>

        <motion.div className={styles.faqItem} variants={itemVariants}>
          <h4 className={styles.faqQ}>5. Я боюся камери та оцінки знайомих. Чи допоможе мені це?</h4>
          <div className={styles.faqA}>
            Страх виникає через нерозуміння процесу. Коли у вас є твердий Фундамент і ви знаєте, навіщо знімаєте кожен кадр, з’являється впевненість. Ми розберемо кейси учнів, які подолали цей бар’єр завдяки системному підходу.
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
