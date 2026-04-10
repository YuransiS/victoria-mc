"use client";

import React, { useState } from "react";
import styles from "./Form.module.css";
import { Input } from "./Input";
import { Button } from "./Button";
import { trackFBEvent } from "./FacebookPixel";
import { motion, AnimatePresence } from "framer-motion";

const TELEGRAM_LINK = "https://t.me/+qNxPhx3CUpw1ODZi";

export const Form: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "redirecting">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", phone: "" };

    if (formData.name.trim().length < 2) {
      newErrors.name = "Будь ласка, введіть ваше ім'я";
      valid = false;
    }

    // Lenient: allow Telegram nick (@username) or phone number
    const contact = formData.phone.trim();
    if (contact.startsWith("@")) {
      if (contact.length < 4) {
        newErrors.phone = "Введіть коректний Telegram нік";
        valid = false;
      }
    } else {
      const digitsOnly = contact.replace(/\D/g, "");
      if (digitsOnly.length < 7) {
        newErrors.phone = "Введіть Telegram нік або номер телефону";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    // UTM / Source tracking
    const searchParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "none",
      utm_campaign: searchParams.get("utm_campaign") || "none",
      utm_content: searchParams.get("utm_content") || "none",
      utm_term: searchParams.get("utm_term") || "none",
      full_url: window.location.href
    };

    // Track Lead
    trackFBEvent("Lead", { 
      content_name: "Masterclass Registration",
      value: 0,
      currency: "UAH",
      ...utmData
    });
    try {
      await fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ...formData,
          ...utmData
        }),
      });
    } catch (error) {
      console.error("Submission error:", error);
    }

    setStatus("redirecting");
    
    setTimeout(() => {
      window.location.href = TELEGRAM_LINK;
    }, 1500);
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="ІМ'Я ТА ПРІЗВИЩЕ" 
          name="name" 
          type="text" 
          placeholder="Ваше ім'я" 
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={status !== "idle"}
        />
        <Input 
          label="ТЕЛЕГРАМ @НІК АБО НОМЕР ТЕЛЕФОНУ" 
          name="phone" 
          type="text" 
          placeholder="@nickname або номер телефону" 
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          hint="Будь ласка, перевірте правильність номера або ніка, щоб ми могли з вами зв'язатися"
          disabled={status !== "idle"}
        />

        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitBtn}
          disabled={status !== "idle"}
          style={{ width: "100%" }}
        >
          {status === "loading" ? "ВІДПРАВКА..." : 
           status === "redirecting" ? "ПЕРЕНАПРАВЛЕННЯ..." : 
           "ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ"}
        </Button>

        <p className={styles.bonusText}>
          <strong>Бонус:</strong> готова структура блогу під будь яку нішу на 6 місяців вперед (отримай відразу після реєстрації).
        </p>
      </form>

      <AnimatePresence>
        {status === "redirecting" && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={styles.redirectOverlay}
          >
            <div className={styles.redirectBox}>
              <h3>Дякуємо за реєстрацію!</h3>
              <p>Зараз ви будете перенаправлені до Telegram каналу...</p>
              <div className={styles.loader}></div>
              <a href={TELEGRAM_LINK} className={styles.manualLink}>
                Не перенаправило? Натисніть сюди
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
