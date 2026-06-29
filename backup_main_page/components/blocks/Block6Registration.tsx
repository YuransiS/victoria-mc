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
          background: "rgba(30, 30, 28, 0.9)",
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
          borderRadius: "1.5rem",
          padding: "2.5rem 1.5rem",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 40px 100px rgba(0, 0, 0, 0.6)"
        }}
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div>
          <h2 className={styles.sectionTitle} style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", textAlign: "center", color: "#d1b897", margin: "0 0 1rem 0" }}>
            РЕЄСТРУЙСЯ НА МАЙСТЕР-КЛАС ТА ВИХОДЬ ІЗ ХАОСУ
          </h2>
          <p style={{ textAlign: "center", color: "rgba(255, 255, 255, 0.8)", lineHeight: 1.6, margin: 0 }}>
            Отримуй готову структуру блогу на 6 місяців відразу після реєстрації.<br />
            <strong style={{ color: "#d1b897" }}>Кількість безкоштовних місць обмежена.</strong>
          </p>
        </div>
        <Form />
      </motion.div>
    </section>
  );
}
