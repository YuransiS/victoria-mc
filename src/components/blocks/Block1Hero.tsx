"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";
import { motion, AnimatePresence } from "framer-motion";
import { getDynamicPriceState } from "@/lib/dynamicPrice";

const OFFERS = {
  1: {
    badge1: "ІНТЕНСИВ • 4 УРОКИ",
    badge2: "СИСТЕМА КОНТЕНТУ 2026",
    title: "Абсолютно випадковий контент може набрати мільйони.",
    subtitle: "А той, у який ти вклала душу — 5 лайків",
    description: "І поки ти не розумієш чому — кожна наступна одиниця контенту це не система, а випадковість.",
    cardText: "За 4 уроки ти перестанеш сподіватися на удачу і побудуєш систему, яка приводить аудиторію та клієнтів",
    buttonText: "Хочу систему →"
  },
  2: {
    badge1: "ІНТЕНСИВ • 4 УРОКИ",
    badge2: "СИСТЕМА КОНТЕНТУ 2026",
    title: "Як зробити так, щоб блог приносив заявки та продажі вже цим літом",
    subtitle: "Зсередини покажу свою систему, як робити продаючий контент за 30хв на день",
    description: "Перестань витрачати години на контент без конверсії та побудуй прогнозовану систему.",
    cardText: "За 4 уроки ти побудуєш систему контенту, яка генерує клієнтів щодня",
    buttonText: "Хочу систему →"
  },
  3: {
    badge1: "ІНТЕНСИВ • 4 УРОКИ",
    badge2: "СИСТЕМА КОНТЕНТУ 2026",
    title: "Як перестати вести блог навмання та перетворити контент на джерело клієнтів",
    subtitle: "Розповім, як знайти власний стиль і побудувати систему, яка працює на заявки",
    description: "Система, яка працює на заявки та продажі навіть коли ти відпочиваєш.",
    cardText: "За 4 уроки ти знайдеш власний стиль і створиш систему регулярних продажів",
    buttonText: "Хочу систему →"
  }
};

export function Block1Hero() {
  const [regCount, setRegCount] = useState(976);
  const [formattedDate, setFormattedDate] = useState("28.07");
  const [variant, setVariant] = useState<1 | 2 | 3>(1);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [price, setPrice] = useState(149);
  const [nextPrice, setNextPrice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const discountPercent = price === 49 ? 89 : price === 89 ? 80 : price === 249 ? 45 : 67;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const handleOpenModal = () => setIsRegModalOpen(true);
    window.addEventListener("open-registration-modal", handleOpenModal);
    return () => window.removeEventListener("open-registration-modal", handleOpenModal);
  }, []);

  useEffect(() => {
    const handleNewRegistration = () => {
      setRegCount(prev => prev + 1);
    };
    window.addEventListener('new_registration', handleNewRegistration);
    return () => window.removeEventListener('new_registration', handleNewRegistration);
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const getOfferVal = () => {
      const offerParam = searchParams.get("offer");
      const vParam = searchParams.get("v");
      const utmContent = searchParams.get("utm_content");

      const check = (val: string | null) => {
        if (!val) return null;
        const clean = val.toLowerCase().trim();
        if (clean.includes("3") || clean === "v3" || clean === "offer3") return 3;
        if (clean.includes("2") || clean === "v2" || clean === "offer2") return 2;
        if (clean.includes("1") || clean === "v1" || clean === "offer1") return 1;
        return null;
      };

      return check(offerParam) || check(vParam) || check(utmContent) || 1;
    };

    const detected = getOfferVal();
    setVariant(detected);
    localStorage.setItem("current_offer_variant", `offer${detected}`);

    const root = document.documentElement;
    root.style.setProperty("--accent-color", "#fff500");
    root.style.setProperty("--accent-text-color", "#000000");
    root.style.setProperty("--accent-color-rgb", "255, 245, 0");

    const updatePricing = () => {
      const state = getDynamicPriceState();
      setPrice(state.price);
      setNextPrice(state.nextPrice);
      setTimeLeft(state.timeLeft);
    };

    updatePricing();
    const interval = setInterval(updatePricing, 1000);
    return () => clearInterval(interval);
  }, []);

  const activeOffer = OFFERS[variant];

  return (
    <section className={`${styles.hero} ${variant === 1 ? styles.var1 : variant === 2 ? styles.var2 : styles.var3}`}>
      {/* BACKGROUND LAYER WITH SUBTLE BLUR */}
      <motion.div
        className={styles.background}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          src="/free-lection/krupn.JPG"
          alt="Вікторія Мещерякова"
          fill
          className={styles.bgImage}
          priority
        />
        <div className={styles.overlay} />
      </motion.div>

      <div className={styles.container}>
        {/* MAIN STACKED CONTENT */}
        <div className={styles.content}>

          {/* BADGES ROW */}
          <motion.div
            className={styles.badgeWrapper}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          >
            <span className={styles.badgePillPrimary}>{activeOffer.badge1}</span>
            <span className={styles.badgePillSecondary}>{activeOffer.badge2}</span>
          </motion.div>

          <div className={styles.textContent}>

            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              {activeOffer.title}
            </motion.h1>

            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              {activeOffer.subtitle}
            </motion.p>

            <motion.p
              className={styles.descriptionText}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              {activeOffer.description}
            </motion.p>

            {/* VALUE CARD */}
            <motion.div
              className={styles.valueCard}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
            >
              <p className={styles.valueCardText}>
                {activeOffer.cardText}
              </p>
            </motion.div>

            {/* Mobile CTA Button (opens modal) */}
            <div className={styles.mobileHeroCta}>
              <div className={styles.priceContainer}>
                <div className={styles.priceLabel}>ВАРТІСТЬ УЧАСТІ:</div>
                <div className={styles.priceRow}>
                  <span className={styles.oldPrice}>449 грн</span>
                  <span className={styles.discountBadge}>-{discountPercent}%</span>
                  <span className={styles.newPrice}>
                    {price} <span className={styles.currency}>грн</span>
                  </span>
                </div>
              </div>
              {nextPrice && timeLeft > 0 && (
                <div className={styles.timerText}>
                  ⏱️ через {formatTime(timeLeft)} ціна буде {nextPrice} грн
                </div>
              )}
              <button
                className={styles.mainPageButton}
                onClick={() => setIsRegModalOpen(true)}
              >
                {activeOffer.buttonText}
              </button>
            </div>
          </div>

          {/* REGISTRATION FORM COMPACT */}
          <motion.div
            id="registration-form"
            className={styles.formWrapper}
            initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          >
            <div className={styles.priceContainer}>
              <div className={styles.priceLabel}>ВАРТІСТЬ УЧАСТІ:</div>
              <div className={styles.priceRow}>
                <span className={styles.oldPrice}>449 грн</span>
                <span className={styles.discountBadge}>-{discountPercent}%</span>
                <span className={styles.newPrice}>
                  {price} <span className={styles.currency}>грн</span>
                </span>
              </div>
            </div>
            {nextPrice && timeLeft > 0 && (
              <div style={{
                fontSize: "0.8rem",
                color: "var(--accent-color)",
                fontWeight: 800,
                marginBottom: "1.2rem",
                fontFamily: "var(--font-manrope)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                textAlign: "center"
              }}>
                ⏱️ через {formatTime(timeLeft)} ціна буде {nextPrice} грн
              </div>
            )}

            <Form buttonText={activeOffer.buttonText} buttonClassName={styles.mainPageButton} />

            <div className={styles.socialProof}>
              <div className={styles.avatars}>
                <img src="https://i.pravatar.cc/100?img=32" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=47" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=12" alt="Participant" />
                <img src="https://i.pravatar.cc/100?img=26" alt="Participant" />
              </div>
            </div>
          </motion.div>


        </div>
      </div>

      {/* Mobile Registration Modal */}
      <AnimatePresence>
        {isRegModalOpen && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsRegModalOpen(false)}
          >
            <motion.div
              className={styles.modalContent}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ duration: 0.3 }}
            >
              <button className={styles.modalCloseBtn} onClick={() => setIsRegModalOpen(false)}>×</button>
              <div className={styles.priceContainer}>
                <div className={styles.priceLabel}>ВАРТІСТЬ УЧАСТІ:</div>
                <div className={styles.priceRow}>
                  <span className={styles.oldPrice}>449 грн</span>
                  <span className={styles.discountBadge}>-{discountPercent}%</span>
                  <span className={styles.newPrice}>
                    {price} <span className={styles.currency}>грн</span>
                  </span>
                </div>
              </div>
              {nextPrice && timeLeft > 0 && (
                <div style={{
                  fontSize: "0.8rem",
                  color: "var(--accent-color)",
                  fontWeight: 800,
                  marginBottom: "1.2rem",
                  fontFamily: "var(--font-manrope)",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  textAlign: "center"
                }}>
                  ⏱️ через {formatTime(timeLeft)} ціна буде {nextPrice} грн
                </div>
              )}
              <Form buttonText={activeOffer.buttonText} buttonClassName={styles.mainPageButton} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
