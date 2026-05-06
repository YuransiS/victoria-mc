"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumRegistration.module.css";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/pricing/BookingModal";

export function PracticumRegistration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(63);
  const [tariff, setTariff] = useState("Практикум СТОРІЗ ЯКІ ПРОДАЮТЬ");
  const [amount, setAmount] = useState(490);

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
        <motion.h2 
          className={styles.sectionTitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          ОБЕРИ СВІЙ ФОРМАТ УЧАСТІ
        </motion.h2>
        <motion.p 
          className={styles.sectionDesc}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          7 днів, які змінять твоє бачення контенту та допоможуть побудувати чергу з клієнтів
        </motion.p>

        <div className={styles.tariffsGrid}>
          {/* LIGHT TARIFF - КОРОЛЕВА КОНТЕНТУ */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.tariffCard}
          >
            <div className={styles.glow} />
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>КОРОЛЕВА КОНТЕНТУ</h3>
              <p className={styles.tariffDesc}>Для тих, кому потрібна підтримка, покрокові інструкції, спільнота та структрра</p>
              
              <ul className={styles.featuresList}>
                <li>участь в практикумі</li>
                <li>зворотній зв'язок в групі</li>
                <li>бонусний ефір по системі створення каруселей в інстаграмі</li>
                <li>доступ до загального чату</li>
              </ul>

              <div className={styles.priceWrapper}>
                <div className={styles.oldPrice}>45$</div>
                <div className={styles.newPrice}>9$</div>
                <button 
                  className={styles.registerBtn}
                  onClick={() => {
                    setTariff("КОРОЛЕВА КОНТЕНТУ");
                    setAmount(9);
                    setIsModalOpen(true);
                  }}
                >
                  ОБРАТИ ТАРИФ
                </button>
              </div>
            </div>
          </motion.div>

          {/* PRO TARIFF - ОСОБИСТА РОБОТА */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${styles.tariffCard} ${styles.pro}`}
          >
            <div className={styles.proBadge}>ПОПУЛЯРНИЙ</div>
            <div className={styles.glow} />
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>ОСОБИСТА РОБОТА</h3>
              <p className={styles.tariffDesc}>Для тих, кому важливий особистий зворотній зв'язок та робота на практикумі</p>
              
              <ul className={styles.featuresList}>
                <li>участь в практикумі</li>
                <li>зворотній зв'язок в групі</li>
                <li>бонусний ефір по системі створення каруселей в інстаграмі</li>
                <li>доступ до загального чату</li>
                <li><strong>+ особиста перевірка виконання завдань</strong></li>
                <li><strong>+ особиста консультація по контенту та візуалу від Віки</strong></li>
              </ul>

              <div className={styles.priceWrapper}>
                <div className={styles.oldPrice}>190$</div>
                <div className={styles.newPrice}>89$</div>
                <button 
                  className={styles.registerBtn}
                  onClick={() => {
                    setTariff("ОСОБИСТА РОБОТА");
                    setAmount(89);
                    setIsModalOpen(true);
                  }}
                >
                  ОБРАТИ ТАРИФ
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <p className={styles.guarantee}>Безпечна оплата через WayForPay</p>
      </div>

      <BookingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        tariffName={tariff} 
        amount={amount} 
        currency="USD"
        currencySymbol="$"
        targetSheetName="Практикум"
        successUrl="/practicum/thanks"
        failUrl="/practicum/fail"
      />
    </section>
  );
}
