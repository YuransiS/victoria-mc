"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumHero.module.css";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/pricing/BookingModal";

export function PracticumHero() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(63);
  const [activeUsers, setActiveUsers] = useState(7);

  useEffect(() => {
    const handleNewRegistration = () => {
      setSpotsLeft(prev => (prev > 5 ? prev - 1 : prev));
    };
    window.addEventListener('new_registration', handleNewRegistration);

    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 5 ? 5 : newValue > 12 ? 12 : newValue;
      });
    }, 4000);

    return () => {
      window.removeEventListener('new_registration', handleNewRegistration);
      clearInterval(interval);
    };
  }, []);

  return (
    <section className={styles.hero}>
      <motion.div
        className={styles.background}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
      >
        <div className={styles.bgImageContainer} />
        <div className={styles.overlay} />
      </motion.div>

      <div className={styles.container}>
        <motion.div
          className={styles.topRow}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className={styles.dot}></span>
          <span>11.05 — 17.05</span>
          <span className={styles.separator}>|</span>
          <span>7-ДЕННИЙ ПРАКТИКУМ</span>
        </motion.div>

        <div className={styles.content}>
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            СТОРІЗ<br /><span>ЯКІ ПРОДАЮТЬ</span>
          </motion.h1>

          <motion.div
            className={styles.subDescription}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <p className={styles.subtitle}>
              Навчись знімати контент, який відображає твою особистість та перетворює підписників на клієнтів — без стресу та щоденної втоми.
            </p>
            <motion.a 
              href="#program"
              className={styles.secondaryBtn}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              ДЕТАЛІ ПРОГРАМИ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.a>
          </motion.div>
        </div>

        <motion.div
          className={styles.ctaCard}
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <div className={styles.liveUsers}>
            <span className={styles.liveDot}></span>
            <span>зараз на сторінці: {activeUsers} людей</span>
          </div>

          <button 
            className={styles.mainActionBtn}
            onClick={() => setIsModalOpen(true)}
          >
            <span>ВЗЯТИ УЧАСТЬ</span>
            <div className={styles.btnPrice}>
              <span className={styles.newPrice}>490 ГРН</span>
              <span className={styles.oldPrice}>1500 ГРН</span>
            </div>
          </button>

          <div className={styles.socialProof}>
            <div className={styles.avatars}>
              <img src="https://i.pravatar.cc/100?img=32" alt="Participant" />
              <img src="https://i.pravatar.cc/100?img=47" alt="Participant" />
              <img src="https://i.pravatar.cc/100?img=12" alt="Participant" />
            </div>
            <div className={styles.proofText}>
              <span>🔥 <b>37</b> вже з нами</span>
              <span>Залишилось <b>{spotsLeft}</b> місць</span>
            </div>
          </div>
        </motion.div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tariffName="Практикум СТОРІЗ ЯКІ ПРОДАЮТЬ" 
        amount={490} 
        targetSheetName="Практикум"
        successUrl="/practicum/thanks"
        failUrl="/practicum/fail"
      />
    </section>
  );
}
