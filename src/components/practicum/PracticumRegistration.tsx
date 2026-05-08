"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumRegistration.module.css";
import { motion } from "framer-motion";
import { BookingModal } from "@/components/pricing/BookingModal";

export function PracticumRegistration() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tariff, setTariff] = useState("КОРОЛЕВА КОНТЕНТУ");
  const [amount, setAmount] = useState(9);

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
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          7 днів, які змінять твоє бачення контенту та допоможуть побудувати чергу з клієнтів
        </motion.p>

        <div className={styles.tariffsGrid}>
          {/* LIGHT TARIFF - КОРОЛЕВА КОНТЕНТУ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={styles.tariffCard}
          >
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>КОРОЛЕВА КОНТЕНТУ</h3>
              <p className={styles.tariffDesc}>Для тих, кому потрібна підтримка, покрокові інструкції та структура</p>
              
              <ul className={styles.featuresList}>
                <li>участь в практикумі</li>
                <li>зворотній зв'язок в групі</li>
                <li>бонусний ефір по системі створення каруселей</li>
                <li>доступ до загального чату</li>
                <li className={styles.crossedOut}>особиста перевірка виконання завдань</li>
                <li className={styles.crossedOut}>особиста консультація по контенту та візуалу від Віки</li>
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

          {/* VIP TARIFF - ОСОБИСТА РОБОТА */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className={`${styles.tariffCard} ${styles.pro}`}
          >
            <div className={styles.bestChoiceBadge}>КРАЩИЙ ВИБІР</div>
            <div className={styles.cardContent}>
              <h3 className={styles.tariffTitle}>ОСОБИСТА РОБОТА</h3>
              <p className={styles.tariffDesc}>Індивідуальна робота над вашим результатом та особистий супровід від Вікторії</p>
              
              <ul className={styles.featuresList}>
                <li>участь в практикумі</li>
                <li>зворотній зв'язок в групі</li>
                <li>бонусний ефір по системі створення каруселей</li>
                <li>доступ до загального чату</li>
                <li>особиста перевірка виконання завдань</li>
                <li>особиста консультація по контенту та візуалу від Віки</li>
              </ul>

              <div className={styles.priceWrapper}>
                <div className={styles.oldPrice}>69$</div>
                <div className={styles.newPrice}>39$</div>
                <button 
                  className={styles.registerBtn}
                  onClick={() => {
                    setTariff("ОСОБИСТА РОБОТА");
                    setAmount(39);
                    setIsModalOpen(true);
                  }}
                >
                  ОБРАТИ ТАРИФ
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        <div className={styles.guaranteeBlock}>
          <motion.div 
            className={styles.shieldContainer}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <div className={styles.shieldGlow} />
            <svg className={styles.shieldSvg} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <motion.path 
                d="M12 2L4 5V11C4 16.19 7.41 21.05 12 22C16.59 21.05 20 16.19 20 11V5L12 2Z" 
                stroke="#d1b897" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              <motion.path 
                d="M9 12L11 14L15 10" 
                stroke="#d1b897" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                whileInView={{ pathLength: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 1, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <div className={styles.guaranteeInfo}>
            <h4 className={styles.guaranteeTitle}>Гарантія повернення</h4>
            <p className={styles.guaranteeText}>
              Я впевнена на 100% ефективності завдань, уроків, які я даю під час практикуму.
              <br /><br />
              Якщо ви виконаєте всі завдання протягом 7 днів і не побачите жодних змін — поверну вам повну вартість без зайвих запитань.
              <br /><br />
              <span className={styles.riskFree}>Ви нічим не ризикуєте!</span>
            </p>
          </div>
        </div>

        <p className={styles.paymentSecurity}>Безпечна оплата через WayForPay</p>
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

