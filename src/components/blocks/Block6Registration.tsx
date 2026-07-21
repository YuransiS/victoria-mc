"use client";

import React, { useState, useEffect } from "react";
import styles from "./SharedBlocks.module.css";
import heroStyles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";
import { motion } from "framer-motion";
import { getDynamicPriceState } from "@/lib/dynamicPrice";

export function Block6Registration() {
  const [price, setPrice] = useState(149);
  const [nextPrice, setNextPrice] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const discountPercent = price === 49 ? 89 : price === 89 ? 80 : 67;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
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

  return (
    <section id="register" className={`${styles.section}`}>
      <motion.div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "1.5rem", 
          width: "100%", 
          maxWidth: "600px", 
          margin: "0 auto",
          background: "#1a1a1c",
          borderRadius: "0px",
          padding: "2.5rem 1.5rem",
          border: "1.5px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.4)"
        }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div>
          <h2 className={styles.sectionTitle} style={{ fontFamily: "var(--font-inter)", fontWeight: 900, fontSize: "clamp(1.5rem, 3vw, 2.2rem)", textAlign: "center", color: "var(--accent-color)", margin: "0 0 1rem 0" }}>
            ОПЛАТИ УЧАСТЬ У МАЙСТЕР-КЛАСІ ТА ВИЙДИ ІЗ ХАОСУ
          </h2>
        </div>

        <div className={heroStyles.priceContainer} style={{ background: "transparent", border: "none", boxShadow: "none", padding: 0, margin: "0 auto" }}>
          <div className={heroStyles.priceLabel}>ВАРТІСТЬ УЧАСТІ:</div>
          <div className={heroStyles.priceRow}>
            <span className={heroStyles.oldPrice}>449 грн</span>
            <span className={heroStyles.discountBadge}>-{discountPercent}%</span>
            <span className={heroStyles.newPrice}>
              {price} <span className={heroStyles.currency}>грн</span>
            </span>
          </div>
          {nextPrice && timeLeft > 0 && (
            <div style={{
              fontSize: "clamp(0.6rem, 1.8vw, 0.75rem)",
              color: "var(--accent-color)",
              fontWeight: 800,
              marginTop: "0.35rem",
              fontFamily: "var(--font-manrope)",
              textTransform: "uppercase",
              letterSpacing: "0.03em",
              textAlign: "center",
              whiteSpace: "nowrap"
            }}>
              ⏱️ через {formatTime(timeLeft)} ціна буде {nextPrice} грн
            </div>
          )}
        </div>

        <Form buttonText="ОПЛАТИТИ УЧАСТЬ" buttonClassName={styles.mainPageButton} />
      </motion.div>
    </section>
  );
}
