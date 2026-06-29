"use client";

import React, { useState, useEffect } from "react";
import styles from "./Form.module.css";
import { Input } from "./Input";
import { Button } from "./Button";
import { trackFBEvent } from "./FacebookPixel";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

const TELEGRAM_LINK = "https://t.me/vsual_bot?start=6a031ffdc13c0f31290b8596";

interface FormProps {
  buttonText?: string;
}

export const Form: React.FC<FormProps> = ({ buttonText = "ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ" }) => {
  const [formData, setFormData] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [errors, setErrors] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram" | null>(null);
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "redirecting">("idle");
  const [activeUsers, setActiveUsers] = useState(4);

  useEffect(() => {
    // Fetch user's country code via Edge API
    fetch('/api/country')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => {});

    // Load saved data from localStorage
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');
    const savedInstagram = localStorage.getItem('lead_instagram');
    if (savedName) setFormData(prev => ({ ...prev, name: savedName }));
    if (savedInstagram) setFormData(prev => ({ ...prev, instagram: savedInstagram }));

    if (savedPhone) {
      setFormData(prev => ({ ...prev, phone: savedPhone }));
      setContactMethod("phone");
    } else if (savedSocial) {
      setFormData(prev => ({ ...prev, social: savedSocial }));
      setContactMethod("telegram");
    }

    // Randomly fluctuate active users count to look "live"
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 3 ? 3 : newValue > 7 ? 7 : newValue;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    // Persist on the fly
    localStorage.setItem(`lead_${name === 'social' ? 'social' : name}`, value);
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", phone: "", social: "", instagram: "" };

    if (formData.name.trim().length < 2) {
      newErrors.name = "Будь ласка, введіть ваше ім'я";
      valid = false;
    }

    if (contactMethod === null) {
      newErrors.phone = "Будь ласка, оберіть спосіб зв'язку";
      valid = false;
    } else if (contactMethod === "phone") {
      if (!formData.phone.trim()) {
        newErrors.phone = "Будь ласка, введіть номер телефону";
        valid = false;
      } else if (!isValidPhoneNumber(formData.phone)) {
        newErrors.phone = "Введіть коректний номер телефону";
        valid = false;
      }
    } else {
      const tg = formData.social.trim();
      if (!tg) {
        newErrors.social = "Будь ласка, введіть Telegram нік";
        valid = false;
      } else {
        const cleanTg = tg.replace("@", "");
        if (cleanTg.length < 3) {
          newErrors.social = "Нік у Telegram має бути не менше 3 символів";
          valid = false;
        }
      }
    }

    // Instagram validation
    const insta = formData.instagram.trim();
    if (insta.length < 3) {
      newErrors.instagram = "Введіть ваш Instagram нікнейм";
      valid = false;
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

    const sanitizedPhone = contactMethod === "phone" ? formData.phone.replace(/[\s()-]/g, "") : "";
    const sanitizedSocial = contactMethod === "telegram" ? (formData.social.startsWith("@") ? formData.social : `@${formData.social}`) : "";

    const payload = {
      name: formData.name,
      phone: sanitizedPhone,
      social: sanitizedSocial,
      instagram: formData.instagram,
      ...utmData,
      visitor_id: localStorage.getItem('visitor_id') || '',
      target_sheet: "Автовеб",
      sheet_id: "726331330"
    };

    try {
      const res = await fetch('/api/lead', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const resData = await res.json();
      if (resData.uuid) {
        localStorage.setItem('lead_uuid', resData.uuid);
      }
      // Also ensure fields are saved
      localStorage.setItem('lead_name', formData.name);
      localStorage.setItem('lead_phone', sanitizedPhone);
      localStorage.setItem('lead_social', sanitizedSocial);
      localStorage.setItem('lead_instagram', formData.instagram);
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
        <div className={styles.liveCounter}>
          <span className={styles.liveDot}></span>
          <span>зараз заповнюють анкету: {activeUsers} людини</span>
        </div>
        
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

        {/* Dynamic Contact Method Choice Switch */}
        {contactMethod === null ? (
          <div className="flex flex-col mb-[0.35rem] w-full">
            <label className="font-manrope text-[0.6rem] text-[#7a7a7a] mb-[0.25rem] uppercase tracking-[0.1em] font-bold ml-[0.5rem]">
              Спосіб зв{`'`}язку для отримання бонусу
            </label>
            <div className="flex gap-2 w-full">
              <button
                type="button"
                onClick={() => setContactMethod("phone")}
                className="flex-1 py-3 px-4 bg-black/35 border border-white/10 hover:border-[#d9b897]/50 hover:bg-white/5 rounded-lg text-white font-manrope text-[10px] font-extrabold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>📞 ТЕЛЕФОН</span>
              </button>
              <button
                type="button"
                onClick={() => setContactMethod("telegram")}
                className="flex-1 py-3 px-4 bg-black/35 border border-white/10 hover:border-[#d9b897]/50 hover:bg-white/5 rounded-lg text-white font-manrope text-[10px] font-extrabold uppercase tracking-[0.1em] transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span>✈️ TELEGRAM</span>
              </button>
            </div>
            <AnimatePresence>
              {errors.phone && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-manrope text-[#ff4d4d] text-[0.65rem] mt-[0.25rem] ml-[0.5rem] block"
                >
                  {errors.phone}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ) : contactMethod === "phone" ? (
          <div className="flex flex-col mb-[0.35rem] w-full">
            <div className="flex justify-between items-center mb-[0.15rem] ml-[0.5rem] mr-[0.5rem]">
              <label className="font-manrope text-[0.6rem] text-[#7a7a7a] uppercase tracking-[0.1em] font-bold">
                НОМЕР ТЕЛЕФОНУ
              </label>
              <button
                type="button"
                onClick={() => {
                  setContactMethod(null);
                  setFormData(prev => ({ ...prev, phone: "" }));
                  localStorage.removeItem('lead_phone');
                }}
                className="text-[#d9b897] hover:underline text-[9px] font-manrope uppercase tracking-wider font-extrabold"
              >
                Змінити
              </button>
            </div>
            <PhoneInput
              international
              defaultCountry={countryCode as any}
              value={formData.phone}
              onChange={(val) => {
                setFormData(prev => ({ ...prev, phone: val || "" }));
                setErrors(prev => ({ ...prev, phone: "" }));
                localStorage.setItem('lead_phone', val || "");
              }}
              disabled={status !== "idle"}
              className="w-full flex items-center gap-2 react-phone-input-dark px-4 py-3 bg-black/30 border border-white/15 rounded-lg text-white font-manrope text-sm focus-within:border-[#d9b897]/50 focus-within:ring-4 focus-within:ring-[#d9b897]/10 transition-all"
              numberInputProps={{
                id: "phone",
                autoComplete: "tel",
                inputMode: "tel",
                className: "w-full bg-transparent border-0 p-0 text-white font-manrope text-sm focus:ring-0 focus:outline-none placeholder:text-white/20",
                placeholder: "+"
              }}
            />
            <AnimatePresence>
              {errors.phone && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-manrope text-[#ff4d4d] text-[0.65rem] mt-[0.15rem] ml-[0.5rem] block"
                >
                  {errors.phone}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col mb-[0.35rem] w-full">
            <div className="flex justify-between items-center mb-[0.15rem] ml-[0.5rem] mr-[0.5rem]">
              <label className="font-manrope text-[0.6rem] text-[#7a7a7a] uppercase tracking-[0.1em] font-bold">
                TELEGRAM @НІК
              </label>
              <button
                type="button"
                onClick={() => {
                  setContactMethod(null);
                  setFormData(prev => ({ ...prev, social: "" }));
                  localStorage.removeItem('lead_social');
                }}
                className="text-[#d9b897] hover:underline text-[9px] font-manrope uppercase tracking-wider font-extrabold"
              >
                Змінити
              </button>
            </div>
            <input
              name="social"
              type="text"
              placeholder="@username"
              value={formData.social}
              onChange={handleChange}
              disabled={status !== "idle"}
              className={`w-full bg-black/30 border border-white/15 rounded-lg text-white font-manrope text-sm px-4 py-3 focus:border-[#d9b897]/50 focus:ring-4 focus:ring-[#d9b897]/10 transition-all focus:outline-none ${errors.social ? 'border-[#ff4d4d]' : ''}`}
            />
            <AnimatePresence>
              {errors.social && (
                <motion.span
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="font-manrope text-[#ff4d4d] text-[0.65rem] mt-[0.15rem] ml-[0.5rem] block"
                >
                  {errors.social}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        )}

        <Input
          label="INSTAGRAM @НІК"
          name="instagram"
          type="text"
          placeholder="@nickname"
          value={formData.instagram}
          onChange={handleChange}
          error={errors.instagram}
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
              buttonText}
        </Button>

        <p className={styles.bonusText}>
          <strong>Бонус:</strong> 50 тем для контенту (отримаєш відразу після реєстрації)
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
