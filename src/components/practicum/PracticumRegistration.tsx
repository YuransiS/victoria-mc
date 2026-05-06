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
          {/* LIGHT TARIFF */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={styles.tariffCard}
          >
            <div className={styles.glow} />
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>LIGHT</h3>
              <p className={styles.tariffDesc}>Для тих, хто хоче отримати базу та почати діяти самостійно</p>
              
              <ul className={styles.featuresList}>
                <li>7 днів практикуму зі сторіз</li>
                <li>Всі домашні завдання</li>
                <li>Бонус: Структура карусельки</li>
                <li>Доступ до загального чату</li>
              </ul>

              <div className={styles.priceWrapper}>
                <div className={styles.oldPrice}>1500 ГРН</div>
                <div className={styles.newPrice}>490 ГРН</div>
                <button 
                  className={styles.registerBtn}
                  onClick={() => {
                    setTariff("Практикум: LIGHT");
                    setAmount(490);
                    setIsModalOpen(true);
                  }}
                >
                  ОБРАТИ LIGHT
                </button>
              </div>
            </div>
          </motion.div>

          {/* PRO TARIFF */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`${styles.tariffCard} ${styles.pro}`}
          >
            <div className={styles.proBadge}>ПОПУЛЯРНИЙ</div>
            <div className={styles.glow} />
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>PRO</h3>
              <p className={styles.tariffDesc}>Максимальний результат з моїм особистим супроводом</p>
              
              <ul className={styles.featuresList}>
                <li>Участь в челенджі</li>
                <li>Участь в практикумі</li>
                <li><strong>Особистий розбір від Вікторії</strong></li>
                <li>Рекомендації щодо покращення візуалу та контенту</li>
                <li>Бонус: Структура карусельки</li>
              </ul>

              <div className={styles.priceWrapper}>
                <div className={styles.oldPrice}>3890 ГРН</div>
                <div className={styles.newPrice}>1990 ГРН</div>
                <button 
                  className={styles.registerBtn}
                  onClick={() => {
                    setTariff("Практикум: PRO");
                    setAmount(1990);
                    setIsModalOpen(true);
                  }}
                >
                  ОБРАТИ PRO
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
        targetSheetName="Практикум"
        successUrl="/practicum/thanks"
        failUrl="/practicum/fail"
      />
    </section>
  );
}
