"use client";

import React, { useState, useEffect } from "react";
import styles from "./Form.module.css";
import { Input } from "./Input";
import { Button } from "./Button";
import { trackFBEvent } from "./FacebookPixel";
import { motion, AnimatePresence } from "framer-motion";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { getDynamicPriceState } from "@/lib/dynamicPrice";
import { getClientMarketingAttribution, normalizePhone, normalizeTelegram, normalizeInstagram, normalizeAmount } from "@/lib/enrichment";

const TELEGRAM_LINK = "https://tg.pulse.is/vsual_bot?start=6a031ffdc13c0f31290b8596";

interface FormProps {
  buttonText?: string;
  buttonClassName?: string;
}

export const Form: React.FC<FormProps> = ({ buttonText = "ОПЛАТИТИ УЧАСТЬ", buttonClassName }) => {
  const [formData, setFormData] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [errors, setErrors] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram" | null>(null);
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "redirecting">("idle");
  const [activeUsers, setActiveUsers] = useState(4);
  const [redirectUrl, setRedirectUrl] = useState("https://t.me/+sWnkQ4VJeYg3MWVi");
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("⏳ Створюємо безпечне з'єднання...");

  useEffect(() => {
    if (progress === 0) {
      setProgressMessage("⏳ Створюємо безпечне з'єднання...");
    } else if (progress < 40) {
      setProgressMessage("⏳ Створюємо безпечне з'єднання...");
    } else if (progress < 90) {
      setProgressMessage("⏱️ Почекайте, ще трішки залишилось, не йдіть...");
    } else {
      setProgressMessage("🚀 Перенаправляємо на сторінку оплати...");
    }
  }, [progress]);

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

    // Set redirect channel link based on price param p
    const searchParams = new URLSearchParams(window.location.search);
    const pParam = searchParams.get("p");
    if (pParam === "49") {
      setRedirectUrl("https://t.me/+EGfXzTnUIaswNjBi");
    } else if (pParam === "89") {
      setRedirectUrl("https://t.me/+uG-vwvLZRnBhZGEy");
    } else if (pParam === "149") {
      setRedirectUrl("https://t.me/+_pgcHXiED7Q0M2Zi");
    } else {
      setRedirectUrl("https://t.me/+sWnkQ4VJeYg3MWVi");
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

    setStatus("redirecting");
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 6;
        if (prev < 80) return prev + 3;
        if (prev < 90) return prev + 0.8;
        return prev;
      });
    }, 100);

    // UTM / Source & Ads tracking via Enrichment Protocol v2.0
    const detectedOffer = typeof window !== "undefined" ? (localStorage.getItem("current_offer_variant") || "") : "";
    const marketingAttr = getClientMarketingAttribution();
    if (detectedOffer) {
      if (!marketingAttr.utm_content) {
        marketingAttr.utm_content = detectedOffer;
      } else if (!marketingAttr.utm_content.includes(detectedOffer)) {
        marketingAttr.utm_content = `${marketingAttr.utm_content}_${detectedOffer}`;
      }
    }

    const normalizedPhoneVal = contactMethod === "phone" ? normalizePhone(formData.phone) : null;
    const cleanTg = contactMethod === "telegram" ? normalizeTelegram(formData.social) : null;
    const sanitizedSocial = cleanTg ? `@${cleanTg}` : "";
    const cleanInstagram = normalizeInstagram(formData.instagram);

    // Parse price dynamically
    const { price } = getDynamicPriceState();
    const floatAmount = normalizeAmount(price);
    const searchParams = new URLSearchParams(window.location.search);
    const pParam = searchParams.get("p");

    // Determine redirect link based on price
    let finalTgLink = "https://t.me/+sWnkQ4VJeYg3MWVi";
    if (price === 49) {
      finalTgLink = "https://t.me/+EGfXzTnUIaswNjBi";
    } else if (price === 89) {
      finalTgLink = "https://t.me/+uG-vwvLZRnBhZGEy";
    } else if (price === 149) {
      if (pParam === "149") {
        finalTgLink = "https://t.me/+_pgcHXiED7Q0M2Zi";
      } else {
        finalTgLink = pParam === "49" ? "https://t.me/+_pgcHXiED7Q0M2Zi" : "https://t.me/+sWnkQ4VJeYg3MWVi";
      }
    } else if (price === 249) {
      finalTgLink = "https://t.me/+sWnkQ4VJeYg3MWVi";
    }

    // Save TG link to local storage for Thanks page redirect
    localStorage.setItem('masterclass_tg_link', finalTgLink);

    const clientEmail = cleanTg ? `${cleanTg}@telegram.com` : (normalizedPhoneVal ? `client-${normalizedPhoneVal.replace(/\D/g, '')}@telegram.com` : "phone-client@telegram.com");

    const payload = {
      customerName: formData.name.trim(),
      customerEmail: clientEmail,
      customerPhone: normalizedPhoneVal || formData.phone,
      telegram: sanitizedSocial,
      instagram: cleanInstagram || formData.instagram,
      amount: floatAmount,
      tariffName: "Майстер-клас 28.07",
      currency: "UAH" as const,
      product_type: "tripwire" as const,
      targetSheet: "Автовеб",
      successUrl: `/price/thanks`,
      failUrl: `/price/fail`,
      visitor_id: marketingAttr.visitor_uuid || localStorage.getItem('visitor_id') || '',
      ...marketingAttr,
      marketing: marketingAttr
    };

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        clearInterval(intervalId);
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setStatus("idle");
        return;
      }

      // Save user identification for cross-page persistence
      localStorage.setItem('lead_name', formData.name.trim());
      localStorage.setItem('lead_phone', normalizedPhoneVal || formData.phone);
      localStorage.setItem('lead_social', sanitizedSocial);
      localStorage.setItem('lead_instagram', cleanInstagram || formData.instagram);

      // Save TG Message ID to local storage for Thanks page
      if (paymentData.tgMsgId) {
        console.log('DEBUG: Storing TG Msg ID from Main Form:', paymentData.tgMsgId);
        const tgData = {
          id: paymentData.tgMsgId.toString(),
          timestamp: Date.now()
        };
        localStorage.setItem('tg_msg_id_data', JSON.stringify(tgData));
      }

      if (paymentData.uuid) {
        localStorage.setItem('lead_uuid', paymentData.uuid);
      }

      // Save UTMs to localStorage for the final TG update
      localStorage.setItem('lead_utm_source', marketingAttr.utm_source || 'direct');
      localStorage.setItem('lead_utm_medium', marketingAttr.utm_medium || 'none');

      // Save Tariff and Amount for the final TG update
      localStorage.setItem('lead_tariff', "Майстер-клас 28.07");
      localStorage.setItem('lead_amount', floatAmount.toFixed(2));
      localStorage.setItem('lead_currency', "UAH");

      // Track Lead / InitiateCheckout to Facebook
      trackFBEvent("Lead", {
        content_name: "Майстер-клас 28.07",
        value: floatAmount,
        currency: "UAH",
        ...marketingAttr
      });

      // Set flags for Thanks page logic
      sessionStorage.setItem('paymentAttempted', 'true');
      sessionStorage.setItem('lastOrderId', paymentData.orderReference);

      // Complete progress bar to 100%
      clearInterval(intervalId);
      setProgress(100);

      // Prepare WayForPay Form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.wayforpay.com/pay';
      form.acceptCharset = 'utf-8';

      Object.entries(paymentData).forEach(([key, value]) => {
        if (key === 'uuid' || key === 'visitor_uuid' || key === 'tgMsgId') return;
        if (Array.isArray(value)) {
          (value as any[]).forEach((val) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = `${key}[]`;
            input.value = val.toString();
            form.appendChild(input);
          });
        } else if (value !== undefined && value !== null) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      
      // Give progress bar 350ms to finish animating to 100%
      setTimeout(() => {
        form.submit();
      }, 350);
    } catch (error) {
      clearInterval(intervalId);
      console.error("Payment error:", error);
      alert("Відбулася помилка. Перевірте з'єднання з інтернетом.");
      setStatus("idle");
    }
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
          label="INSTAGRAM НІКНЕЙМ"
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
          className={`${styles.submitBtn} ${buttonClassName || ""}`}
          disabled={status !== "idle"}
          style={{ width: "100%" }}
        >
          {status === "loading" ? "ВІДПРАВКА..." :
            status === "redirecting" ? "ПЕРЕНАПРАВЛЕННЯ..." :
              buttonText}
        </Button>

        <p className={styles.bonusText}>
          <strong>Бонус:</strong> Відео &quot;як я створюю контент за 30хв на день&quot; (отримаєш відразу після реєстрації)
        </p>
      </form>

      <AnimatePresence>
        {status === "redirecting" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.redirectOverlay}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className={styles.redirectBox}
            >
              <h3>Дякуємо! Заявку створено</h3>
              
              <div className={styles.progressBarContainer}>
                <motion.div
                  className={styles.progressBarFill}
                  initial={{ width: "0%" }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: progress === 100 ? 0.35 : 0.1, ease: "easeOut" }}
                />
              </div>
              
              <motion.p
                key={progressMessage}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: "0.95rem", fontWeight: 600, color: "rgba(255, 255, 255, 0.85)", minHeight: "1.5rem" }}
              >
                {progressMessage}
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
