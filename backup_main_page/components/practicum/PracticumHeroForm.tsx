"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumHeroForm.module.css";
import { Input } from "@/components/Input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";

interface PracticumHeroFormProps {
  buttonText?: string;
  tariffName: string;
  amount: number;
}

export function PracticumHeroForm({
  buttonText = "ВЗЯТИ УЧАСТЬ",
  tariffName,
  amount
}: PracticumHeroFormProps) {
  const [formData, setFormData] = useState({ name: "", phone: "", telegram: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; telegram?: string }>({});
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram">("phone");
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [activeUsers, setActiveUsers] = useState(7);

  useEffect(() => {
    // Fetch country code via Edge API
    fetch('/api/country')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => {});

    // Load saved data
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');
    if (savedName) setFormData(prev => ({ ...prev, name: savedName }));
    if (savedPhone) setFormData(prev => ({ ...prev, phone: savedPhone }));
    if (savedSocial) setFormData(prev => ({ ...prev, telegram: savedSocial }));

    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 5 ? 5 : newValue > 12 ? 12 : newValue;
      });
    }, 4000);

    // Track InitiateCheckout when form is seen
    trackFBEvent("InitiateCheckout", {
      content_name: tariffName,
      value: amount,
      currency: "USD"
    });

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    // Persist on the fly
    localStorage.setItem(`lead_${name === 'telegram' ? 'social' : name}`, value);
  };

  const validate = () => {
    let valid = true;
    const newErrors: any = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Введіть ваше ім'я";
      valid = false;
    }

    if (contactMethod === "phone") {
      if (!formData.phone.trim()) {
        newErrors.phone = "Введіть номер телефону";
        valid = false;
      } else if (!isValidPhoneNumber(formData.phone)) {
        newErrors.phone = "Некоректний номер";
        valid = false;
      }
    } else {
      if (!formData.telegram.trim()) {
        newErrors.telegram = "Введіть ваш Telegram";
        valid = false;
      } else {
        const cleanTg = formData.telegram.replace("@", "");
        if (cleanTg.length < 3) {
          newErrors.telegram = "Нік у Telegram має бути не менше 3 символів";
          valid = false;
        }
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

    const sanitizedPhone = contactMethod === "phone" ? formData.phone.replace(/[\s()-]/g, "") : "";
    const resolvedTelegram = contactMethod === "telegram" ? (formData.telegram.startsWith("@") ? formData.telegram : `@${formData.telegram}`) : "";

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

    const data = {
      customerName: formData.name,
      customerEmail: resolvedTelegram ? `${resolvedTelegram.replace("@", "")}@telegram.com` : "phone-client@telegram.com",
      customerPhone: sanitizedPhone,
      telegram: resolvedTelegram,
      amount: amount,
      tariffName: tariffName,
      targetSheet: "Практикум"
    };

    // Track Lead
    trackFBEvent("Lead", {
      content_name: tariffName,
      value: amount,
      currency: "USD",
      ...utmData
    });

    try {
      // 1. Create Payment
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...utmData,
          visitor_id: localStorage.getItem('visitor_id') || '',
          successUrl: "/practicum/thanks",
          failUrl: "/practicum/fail"
        })
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setStatus("idle");
        return;
      }

      // Save to localStorage for cross-page persistence
      localStorage.setItem('lead_name', formData.name);
      localStorage.setItem('lead_phone', sanitizedPhone);
      localStorage.setItem('lead_social', resolvedTelegram);
      if (paymentData.uuid) {
        localStorage.setItem('lead_uuid', paymentData.uuid);
      }

      // CRITICAL: Save data for the final TG update on Thanks page
      localStorage.setItem('lead_tariff', tariffName);
      localStorage.setItem('lead_amount', amount.toString());
      localStorage.setItem('lead_currency', "USD");
      localStorage.setItem('lead_utm_source', utmData.utm_source || 'direct');
      localStorage.setItem('lead_utm_medium', utmData.utm_medium || 'none');

      if (paymentData.tgMsgId) {
        const tgData = {
          id: paymentData.tgMsgId.toString(),
          timestamp: Date.now()
        };
        localStorage.setItem('tg_msg_id_data', JSON.stringify(tgData));
      }

      sessionStorage.setItem('paymentAttempted', 'true');
      sessionStorage.setItem('lastOrderId', paymentData.orderReference);

      // 3. Prepare Form and Submit
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://secure.wayforpay.com/pay';
      form.acceptCharset = 'utf-8';

      Object.entries(paymentData).forEach(([key, value]) => {
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
      
      // Give Meta Pixel time to fire the Lead event before navigation
      setTimeout(() => {
        form.submit();
      }, 500);
    } catch (error) {
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
          <span>зараз дивляться: {activeUsers} людей</span>
        </div>

        <Input
          label="ВАШЕ ІМ'Я"
          name="name"
          placeholder="Ім'я"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          disabled={status !== "idle"}
        />

        {/* Dynamic Contact Method Choice Switch */}
        <div className="flex flex-col mb-[0.35rem] w-full">
          <label className="font-manrope text-[0.6rem] text-[#7a7a7a] mb-[0.25rem] uppercase tracking-[0.1em] font-bold ml-[0.5rem]">
            Оберіть спосіб зв{`'`}язку
          </label>
          <div className="flex gap-2 p-1 bg-black/30 border border-white/10 rounded-lg w-full mb-2">
            <button
              type="button"
              onClick={() => setContactMethod("phone")}
              className={`flex-1 py-2 text-[10px] font-manrope font-extrabold uppercase tracking-[0.15em] rounded-md transition-all duration-300 ${
                contactMethod === "phone"
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              ТЕЛЕФОН
            </button>
            <button
              type="button"
              onClick={() => setContactMethod("telegram")}
              className={`flex-1 py-2 text-[10px] font-manrope font-extrabold uppercase tracking-[0.15em] rounded-md transition-all duration-300 ${
                contactMethod === "telegram"
                  ? "bg-white text-black shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              TELEGRAM
            </button>
          </div>
        </div>

        {/* Dynamic Input based on selection */}
        <AnimatePresence mode="wait">
          {contactMethod === "phone" ? (
            <motion.div
              key="phone-field"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col mb-[0.35rem] w-full"
            >
              <label className="font-manrope text-[0.6rem] text-[#7a7a7a] mb-[0.15rem] uppercase tracking-[0.1em] font-bold ml-[0.5rem]">
                НОМЕР ТЕЛЕФОНУ
              </label>
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
            </motion.div>
          ) : (
            <motion.div
              key="telegram-field"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.2 }}
              className="w-full"
            >
              <Input
                label="TELEGRAM"
                name="telegram"
                placeholder="@username"
                value={formData.telegram}
                onChange={handleChange}
                error={errors.telegram}
                disabled={status !== "idle"}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={status !== "idle"}
        >
          {status === "loading" ? (
            <div className={styles.btnContent}>
              <div className={styles.spinner} />
              <span>ПЕРЕНАПРАВЛЕННЯ...</span>
            </div>
          ) : buttonText}
        </button>

        <p className={styles.secureText}>
          🔐 Безпечна оплата через WayForPay
        </p>
      </form>
    </div>
  );
}
