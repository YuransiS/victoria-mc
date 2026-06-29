"use client";

import React from "react";
import Image from "next/image";
import styles from "./Block5Expert.module.css";
import { Button } from "@/components/Button";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(5px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: "easeOut" }
  }
};

export function Block5Expert() {
  return (
    <section className={styles.section}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <h2 className={styles.sectionTitle}>Хто проводить Майстер-клас?</h2>
      </motion.div>
      <div className={styles.expertLayout}>
        <motion.div 
          className={styles.imageWrapper}
          variants={imageVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Image
            src="https://i.ibb.co/BHbR3f2Q/IMG-5598.jpg"
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
          viewport={{ once: true, margin: "-100px" }}
        >
          <motion.h3 className={styles.expertTitle} variants={itemVariants}>Я - Вікторія Мещерякова</motion.h3>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Працюю з контентом з 2015 року. Бачила Instagram від самого початку і всі його трансформації до сьогодні.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Починала з авторських ляльок які створювала руками - вручну будувала для них контент і продажі ще до того як це почали робити нейромережі.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Розробляла стратегії для міжнародних брендів, зокрема Fisher. Працювала з аудиторіями трьох країн: Британія, США, Польща.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            5 років викладання. За цей час виробила мову пояснення яка працює для будь-якого рівня і будь-якої ніші.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Мама двох дітей. Система "контент за 30 хвилин" - це не маркетинговий слоган. Це єдиний спосіб яким я сама веду блог між дитиною, роботою і реальним життям.
          </motion.div>
          <motion.div className={styles.expertPoint} variants={itemVariants}>
            Я сама пройшла шлях від хаосу та емоційного постингу до чіткої системи. Саме тому знаю де саме ти зараз застрягла - і що з цим робити.
          </motion.div>
          <motion.div className={styles.expertSocial} variants={itemVariants}>
            <a 
              href="https://www.instagram.com/victoria_meshcheriakova?igsh=dW55YTltMTZ0Mmw1" 
              target="_blank" 
              rel="noopener noreferrer"
              className={styles.instagramButton}
            >
              <svg 
                viewBox="0 0 24 24" 
                width="20" 
                height="20" 
                fill="currentColor"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Подивитись мій Instagram</span>
            </a>
          </motion.div>
          <motion.div 
            className="hidden-mobile"
            style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-start", width: "100%" }}
            variants={itemVariants}
          >
            <a href="#register" style={{ width: "100%" }}>
              <Button variant="primary" className={styles.mainPageButton} style={{ width: "100%" }}>ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ</Button>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
