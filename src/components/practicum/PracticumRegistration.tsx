"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumRegistration.module.css";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/pricing/BookingModal";

export function PracticumRegistration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(37);

  useEffect(() => {
    // Dynamic imitation of spots decreasing
    const interval = setInterval(() => {
      setSpotsLeft(prev => {
        if (prev <= 7) return prev;
        const decrease = Math.random() > 0.8 ? 1 : 0;
        return prev - decrease;
      });
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.section} id="register">
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={styles.ctaBox}
        >
          <div className={styles.glow} />
          
          <div className={styles.content}>
            <div className={styles.spots}>ЗАЛИШИЛОСЬ {spotsLeft} МІСЦЬ З 100</div>
            <h2 className={styles.title}>ГОТОВА ПОЧАТИ РОБИТИ СТОРІЗ, ЯКІ ПРОДАЮТЬ?</h2>
            <p className={styles.desc}>
              Забронюй своє місце на 7-денний практикум вже зараз. Почни створювати контент, який відображає тебе та приносить результат.
            </p>
            
            <div className={styles.priceBlock}>
              <div className={styles.oldPrice}>1500 ГРН</div>
              <div className={styles.newPrice}>490 ГРН</div>
            </div>

            <button 
              className={styles.registerBtn}
              onClick={() => setIsModalOpen(true)}
            >
              ЗАРЕЄСТРУВАТИСЯ НА ПРАКТИКУМ
            </button>
            
            <p className={styles.guarantee}>Безпечна оплата через WayForPay</p>
          </div>
        </motion.div>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tariffName="Практикум СТОРІЗ ЯКІ ПРОДАЮТЬ" 
        amount={490} 
      />
    </section>
  );
}
