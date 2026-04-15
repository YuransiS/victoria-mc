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
        <h2 className={styles.sectionTitle}>Програма МК:</h2>
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
          <div className={styles.listItemText}>
            <strong>Аудит: Чому блог є, а результату немає?</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>Діагностика профілю: чому твій контент не перетворюється на замовлення від клієнтів (на реальних прикладах).</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>2</span>
          <div className={styles.listItemText}>
            <strong>Фундамент: ДНК твого блогу</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>Як знайти глибинну мотивацію ведення контенту - не "хочу клієнтів" а що насправді стоїть за цим</li>
              <li>Як розібратись у своїх сенсах - що ти хочеш транслювати світу і чому це важливо саме тобі</li>
              <li>Як упакувати це в просту формулу: хто ти + кому це потрібно + що людина отримує</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>3</span>
          <div className={styles.listItemText}>
            <strong>УНІКАЛЬНІСТЬ: як знайти себе, а не копіювати інших</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>Що таке автентичність у контенті - і чому вона продає краще за тренди</li>
              <li>Як знайти свою унікальність через те що ти вже маєш: спосіб мислення, деталі побуту, погляд на свою нішу</li>
              <li>Як розвинути надивленість - бачити кадри і сенси там де інші не помічають</li>
              <li>Як перетворити свої ідеї в контент-план який відображає тебе а не чужі тренди</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>4</span>
          <div className={styles.listItemText}>
            <strong>Як показувати себе без душного експертного контенту</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>Як поєднувати особисте і експертне щоб одне підсилювало інше</li>
              <li>Як продавати нативно - через цінності і деталі а не через "купи"</li>
              <li>Як впоратись з перфекціонізмом який заває публікувати</li>
              <li>Як вести блог стабільно коли немає часу і натхнення — конкретний інструмент а не порада "просто почни"</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>5</span>
          <div className={styles.listItemText}>
            <strong>ВІЗУАЛ: стиль стрічка кадр</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>Як знайти свій стиль</li>
              <li>Як планувати фото для загального візуалу</li>
              <li>Практика в прямому ефірі: різноманітна стрічка зі сенсами з одної локації</li>
              <li>Розбір технічних навичок, програм, в яких потрібно розібратися</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>6</span>
          <div className={styles.listItemText}>
            <strong>РОЗБОРИ АКАУНТІВ З РІЗНИХ НІШ</strong>
            <p style={{ fontSize: '0.85rem', marginTop: '0.4rem', fontStyle: 'italic' }}>бухгалтер юрист майстер фотограф дизайнер художниця психолог коуч педагог</p>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>що конкретно не працює і чому яке рішення - показуємо як би виглядало після</li>
            </ul>
          </div>
        </motion.div>

        <motion.div className={styles.listItem} variants={itemVariants}>
          <span className={styles.listItemNum}>7</span>
          <div className={styles.listItemText}>
            <strong>Презентація на навчальний продукт СТВОРЮЙ</strong>
            <ul style={{ paddingLeft: '1.2rem', marginTop: '0.5rem', opacity: 0.8, fontSize: '0.9rem' }}>
              <li>спец умови та бонуси тільки для учасників майстер-класу</li>
            </ul>
          </div>
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
