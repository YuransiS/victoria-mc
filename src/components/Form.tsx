"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./Form.module.css";
import { Input } from "./Input";
import { Button } from "./Button";
import { trackFBEvent } from "./FacebookPixel";
import intlTelInput from "intl-tel-input";
import { motion, AnimatePresence } from "framer-motion";

const TELEGRAM_LINK = "https://t.me/+qNxPhx3CUpw1ODZi";

export const Form: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [errors, setErrors] = useState({ name: "", phone: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "redirecting">("idle");
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<any>(null);

  useEffect(() => {
    if (phoneInputRef.current) {
      try {
        itiRef.current = intlTelInput(phoneInputRef.current, {
          initialCountry: "ua",
          utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
          separateDialCode: true,
          preferredCountries: ["ua", "pl", "gb", "us"],
          autoPlaceholder: "aggressive",
        } as any);

        const handlePhoneInput = () => {
          if (itiRef.current) {
            const num = itiRef.current.getNumber();
            setFormData(prev => {
              if (prev.phone === num) return prev;
              return { ...prev, phone: num };
            });
          }
        };

        phoneInputRef.current.addEventListener("input", handlePhoneInput);
        phoneInputRef.current.addEventListener("countrychange", handlePhoneInput);

        return () => {
          if (phoneInputRef.current) {
            phoneInputRef.current.removeEventListener("input", handlePhoneInput);
            phoneInputRef.current.removeEventListener("countrychange", handlePhoneInput);
          }
          if (itiRef.current) {
            itiRef.current.destroy();
          }
        };
      } catch (err) {
        console.error("intl-tel-input init error:", err);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", phone: "" };

    if (formData.name.trim().length < 2) {
      newErrors.name = "Будь ласка, введіть коректне ім'я";
      valid = false;
    }

    if (itiRef.current) {
      const isValid = itiRef.current.isValidNumber();
      const num = itiRef.current.getNumber();
      const digitsOnly = formData.phone.replace(/\D/g, "");
      
      console.log("Validation State:", { isValid, num, digits: digitsOnly.length });

      if (!isValid && digitsOnly.length < 9) {
        newErrors.phone = "Некоректний номер телефону";
        valid = false;
      }
    } else {
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 9) {
        newErrors.phone = "Введіть номер телефону (мін. 9 цифр)";
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
    
    const fullPhone = itiRef.current ? itiRef.current.getNumber() : formData.phone;

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

    trackFBEvent("Lead", { 
      content_name: "Masterclass Registration",
      value: 0,
      currency: "UAH",
      ...utmData
    });

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    try {
      if (scriptUrl) {
        await fetch(scriptUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            ...formData,
            phone: fullPhone,
            ...utmData
          }),
        });
      }
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
          label="Ім'я та прізвище" 
          name="name" 
          type="text" 
          placeholder="Введіть ваше ім'я" 
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={status !== "idle"}
        />
        <Input 
          ref={phoneInputRef}
          label="Номер телефону" 
          name="phone" 
          type="tel" 
          placeholder="+380..."
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
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
