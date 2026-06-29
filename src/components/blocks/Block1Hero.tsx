"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";
import { motion, AnimatePresence } from "framer-motion";

const OFFERS = {
  1: {
    title: "Як знати що постити, виглядати у своєму стилі і отримувати заявки на послуги, інфопродукти",
    subtitle: "Покажу свою систему - як витрачати на контент 2–3 години на тиждень, не думати що постити і отримувати клієнтів з блогу вже цим літом"
  },
  2: {
    title: "Як зробити так, щоб блог приносив заявки та продажі вже цим літом",
    subtitle: "Зсередини покажу свою систему, як робити продаючий контент за 30хв на день"
  },
  3: {
    title: "Як перестати вести блог навмання та перетворити контент на джерело клієнтів",
    subtitle: "Розповім, як знайти власний стиль, більше не думати щодня про контент і побудувати систему, яка працює на заявки та продажі навіть влітку"
  }
};

export function Block1Hero() {
  const [regCount, setRegCount] = useState(976);
  const [formattedDate, setFormattedDate] = useState("");
  const [variant, setVariant] = useState<1 | 2 | 3>(1);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenModal = () => setIsRegModalOpen(true);
    window.addEventListener("open-registration-modal", handleOpenModal);
    return () => window.removeEventListener("open-registration-modal", handleOpenModal);
  }, []);

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
  }, []);

  return (
    <section className={`${styles.hero} ${variant === 1 ? styles.var1 : variant === 2 ? styles.var2 : styles.var3}`}>
      {/* BACKGROUND LAYER */}
      <motion.div
        className={styles.background}
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <Image
          src="/IMG_2824.webp"
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
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span>{formattedDate || "..."} 19:00 ЗА КИЄВОМ</span>
            </motion.div>

            <motion.h1
              className={`${styles.title} ${styles.longTitle} ${
                variant === 1 ? styles.var1 : variant === 2 ? styles.var2 : styles.var3
              }`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <span className={styles.highlightSpan}>
                {OFFERS[variant].title}
              </span>
            </motion.h1>

            <motion.div
              className={styles.subDescription}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            >
              <p className={`${styles.subtitle} ${styles.longSubtitle}`}>
                {OFFERS[variant].subtitle}
              </p>
            </motion.div>

            <motion.div
              className={styles.callout}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 0.9, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            >
              приходь на безкоштовний майстер-клас, щоб дізнатись що зараз дійсно працює
            </motion.div>

            {/* Mobile CTA Button (opens modal) */}
            <div className={styles.mobileHeroCta}>
              <button 
                className={styles.mainPageButton} 
                onClick={() => setIsRegModalOpen(true)}
              >
                ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО
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
            <div className={styles.priceTag}>
              <span>ВАРТІСТЬ УЧАСТІ: <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '0.4rem' }}>1500 грн</span> <b>БЕЗКОШТОВНО</b></span>
            </div>

            <Form buttonText="ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО" buttonClassName={styles.mainPageButton} />

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
              <div className={styles.priceTag} style={{ marginBottom: "1.5rem", width: "100%", textAlign: "center" }}>
                <span>ВАРТІСТЬ УЧАСТІ: <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '0.4rem' }}>1500 грн</span> <b>БЕЗКОШТОВНО</b></span>
              </div>
              <Form buttonText="ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО" buttonClassName={styles.mainPageButton} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
