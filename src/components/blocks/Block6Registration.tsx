"use client";

import React from "react";
import styles from "./SharedBlocks.module.css";
import { Form } from "@/components/Form";
import { motion } from "framer-motion";

export function Block6Registration() {
  return (
    <section id="register" className={`${styles.section}`}>
      <motion.div 
        style={{ 
          display: "flex", 
          flexDirection: "column", 
          gap: "2rem", 
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
            РЕЄСТРУЙСЯ НА МАЙСТЕР-КЛАС ТА ВИХОДЬ ІЗ ХАОСУ
          </h2>

        </div>
        <Form buttonClassName={styles.mainPageButton} />
      </motion.div>
    </section>
  );
}
