"use client";

import React, { useState, useEffect } from "react";
import styles from "./SharedBlocks.module.css";
import heroStyles from "./Block1Hero.module.css";
import { Form } from "@/components/Form";
import { motion } from "framer-motion";

export function Block6Registration() {
  const [price, setPrice] = useState(149);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pParam = searchParams.get("p");
    if (pParam === "49") setPrice(49);
    else if (pParam === "89") setPrice(89);
    else if (pParam === "149") setPrice(149);
  }, []);

  const discountPercent = price === 49 ? 89 : price === 89 ? 80 : 67;

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
        </div>

        <Form buttonText="ОПЛАТИТИ УЧАСТЬ" buttonClassName={styles.mainPageButton} />
      </motion.div>
    </section>
  );
}
