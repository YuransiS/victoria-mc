"use client";

import React from "react";
import Image from "next/image";
import styles from "./PracticumExpert.module.css";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export function PracticumExpert() {
  return (
    <section className={styles.section} id="expert">
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <h2 className={styles.sectionTitle}>Хто проводить Практикум?</h2>
      </motion.div>
      <div className={styles.expertLayout}>
        <motion.div 
          className={styles.imageWrapper}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src="https://i.ibb.co/LMvf7DM/IMG-0901.jpg"
            alt="Вікторія Мещерякова"
            fill
            className={styles.imageCover}
          />
        </motion.div>
        <motion.div 
          className={styles.expertInfo}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <motion.h3 className={styles.expertTitle} variants={itemVariants}>Я - Вікторія Мещерякова</motion.h3>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Працюю з контентом з 2015 року. Бачила Instagram від самого початку і всі його трансформації до сьогодні.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Починала з авторських ляльок які створювала руками - будувала для них контент і продажі ще до ери масового навчання блогінгу.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Розробляла стратегії для міжнародних брендів (Fisher) та працювала з аудиторіями Британії, США та Польщі.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            5 років викладання. Виробила мову пояснення складної стратегії через прості, зрозумілі кожному дії.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Мама двох дітей. Система "контент за 30 хвилин" — це не слоган, а мій щоденний спосіб життя між роботою та сім'єю.
          </motion.div>
          
          <motion.div className={styles.expertSocial} variants={itemVariants}>
            <a 
              href="https://www.instagram.com/victoria_meshcheriakova" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.instagramButton}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Подивитись мій Instagram</span>
            </a>
          </motion.div>

          <motion.div 
            className={styles.ctaWrapper}
            variants={itemVariants}
          >
            <a href="#register" className={styles.ctaButton}>
              <span>ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ</span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
