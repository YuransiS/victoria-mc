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
          initialCountry: "auto",
          geoIpLookup: (callback: (countryCode: string) => void) => {
            fetch("https://ipapi.co/json")
              .then((res) => res.json())
              .then((data) => {
                console.log("GeoIP Data Found:", data);
                callback(data.country_code);
              })
              .catch(() => callback("UA"));
          },
          // Use localized or absolute URL for utils to avoid some blocks
          utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
          separateDialCode: true,
          preferredCountries: ["ua", "pl", "gb", "us"],
          autoPlaceholder: "aggressive",
        } as any);
        console.log("ITI Initialized");
      } catch (err) {
        console.error("ITI Init Error:", err);
      }
    }

    return () => {
      if (itiRef.current) {
        itiRef.current.destroy();
      }
    };
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
      const isPhoneValid = itiRef.current.isValidNumber();
      const number = itiRef.current.getNumber();
      const countryData = itiRef.current.getSelectedCountryData();
      const error = itiRef.current.getValidationError();

      console.log("Validation Call:", {
        val: isPhoneValid,
        num: number,
        code: error,
        country: countryData.iso2
      });

      // FALLBACK: If iti results are blocked or unreliable, 
      // do a basic digit check (min 9 digits)
      const digitsOnly = formData.phone.replace(/\D/g, "");
      const looksLikePhone = digitsOnly.length >= 9;

      if (!isPhoneValid && !looksLikePhone) {
        newErrors.phone = "Некоректний номер телефону";
        valid = false;
      }
    } else {
      // IF ITI FAILED TO INITIALIZE AT ALL
      const digitsOnly = formData.phone.replace(/\D/g, "");
      if (digitsOnly.length < 9) {
        newErrors.phone = "Введіть номер телефону";
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
    const fullPhone = itiRef.current?.getNumber() || formData.phone;

    // UTM / Source tracking
    const searchParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: searchParams.get("utm_source") || "",
      utm_medium: searchParams.get("utm_medium") || "",
      utm_campaign: searchParams.get("utm_campaign") || "",
      utm_content: searchParams.get("utm_content") || "",
      utm_term: searchParams.get("utm_term") || "",
      full_url: window.location.href
    };

    // Track Lead before sending
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

    // Always redirect anyway as per instructions
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
