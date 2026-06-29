"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";
import { motion } from "framer-motion";

export function Block1Hero() {
  const [regCount, setRegCount] = useState(976);
  const [formattedDate, setFormattedDate] = useState("");

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const d = String(tomorrow.getDate()).padStart(2, '0');
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
    setFormattedDate(`${d}.${m}`);
  }, []);

  useEffect(() => {
    const handleNewRegistration = () => {
      setRegCount(prev => prev + 1);
    };
    window.addEventListener('new_registration', handleNewRegistration);
    return () => window.removeEventListener('new_registration', handleNewRegistration);
  }, []);

  return (
    <section className={styles.hero}>
      {/* BACKGROUND LAYER */}
      <motion.div
        className={styles.background}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          src="https://i.ibb.co/rgvJrKg/IMG-0901.jpg"
          alt="Expert Image"
          fill
          className={styles.bgImage}
          priority
        />
        <div className={styles.overlay} />
      </motion.div>

      <div className={styles.container}>
        {/* MAIN STACKED CONTENT */}
        <div className={styles.content}>

          <div className={styles.textContent}>
            <motion.div
              className={styles.topRow}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span>{formattedDate || "..."}</span>
              <span>19:00 ЗА КИЄВОМ</span>
            </motion.div>

            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              ВІД ХАОСУ<br />ДО СИСТЕМИ
            </motion.h1>

            <motion.div
              className={styles.subDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <p className={styles.subtitle}>Від хаосу до системи: як побудувати блог, який працює на вас - відображає ваші цінності, викликає довіру та приводить клієнтів</p>
            </motion.div>

          </div>

          {/* REGISTRATION FORM COMPACT */}
          <motion.div
            id="registration-form"
            className={styles.formWrapper}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <div className={styles.priceTag}>
              <span>ВАРТІСТЬ УЧАСТІ: <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '0.4rem' }}>1500 грн</span> <b>БЕЗКОШТОВНО</b></span>
            </div>

            <Form buttonText="ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО" />

            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <img src="https://i.pravatar.cc/100?img=32" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=47" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=12" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=26" alt="Participant" />
              </div>
              <div className={styles.proofText}>
                <span>🔥 <b>{regCount}</b> людей вже зареєструвалися</span>
                <span className={styles.limited}>Кількість місць обмежена</span>
              </div>
            </div>
          </motion.div>


        </div>
      </div>
    </section>
  );
}
