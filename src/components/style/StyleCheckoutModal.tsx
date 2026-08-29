"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { X, Lock, Check, Sparkles, Send } from "lucide-react";

interface StyleCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName?: string;
  amount?: number;
}

export function StyleCheckoutModal({
  isOpen,
  onClose,
  tariffName = "3-денне навчання: Твій стиль блогу",
  amount = 9,
}: StyleCheckoutModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    telegram: "",
    instagram: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
    telegram?: string;
    instagram?: string;
  }>({});
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram">("phone");
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch("/api/country")
      .then((res) => res.json())
      .then((data) => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => {});

    const savedName = localStorage.getItem("lead_name");
    const savedPhone = localStorage.getItem("lead_phone");
    const savedSocial = localStorage.getItem("lead_social");
    const savedInstagram = localStorage.getItem("lead_instagram");

    if (savedName || savedPhone || savedSocial || savedInstagram) {
      setFormData((prev) => ({
        ...prev,
        name: savedName || prev.name,
        phone: savedPhone || prev.phone,
        telegram: savedSocial || prev.telegram,
        instagram: savedInstagram || prev.instagram,
      }));
      if (savedSocial && !savedPhone) {
        setContactMethod("telegram");
      }
    }
  }, []);

  const validate = () => {
    const errs: typeof errors = {};

    if (!formData.name.trim()) {
      errs.name = "Введіть ваше ім'я";
    } else if (/\d/.test(formData.name)) {
      errs.name = "Ім'я не може містити цифри";
    }

    if (contactMethod === "phone") {
      if (!formData.phone.trim()) {
        errs.phone = "Введіть номер телефону";
      } else if (!isValidPhoneNumber(formData.phone)) {
        errs.phone = "Введіть коректний номер телефону";
      }
    } else {
      const cleanTg = formData.telegram.trim().replace("@", "");
      if (!cleanTg) {
        errs.telegram = "Введіть нік у Telegram";
      } else if (cleanTg.length < 3) {
        errs.telegram = "Нік має містити щонайменше 3 символи";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 8;
        if (prev < 80) return prev + 3;
        if (prev < 90) return prev + 0.8;
        return prev;
      });
    }, 100);

    const sanitizedPhone = contactMethod === "phone" ? formData.phone.replace(/[\s()-]/g, "") : "";
    const resolvedTelegram =
      contactMethod === "telegram"
        ? formData.telegram.startsWith("@")
          ? formData.telegram
          : `@${formData.telegram}`
        : "";

    const searchParams = new URLSearchParams(window.location.search);
    let utmsFromStorage: Record<string, string> = {};
    try {
      const savedUtms = localStorage.getItem("last_utms");
      if (savedUtms) utmsFromStorage = JSON.parse(savedUtms);
    } catch (_) {}

    const utmData = {
      utm_source: searchParams.get("utm_source") || utmsFromStorage.utm_source || "direct",
      utm_medium: searchParams.get("utm_medium") || utmsFromStorage.utm_medium || "none",
      utm_campaign: searchParams.get("utm_campaign") || utmsFromStorage.utm_campaign || "none",
      utm_content: searchParams.get("utm_content") || utmsFromStorage.utm_content || "none",
      utm_term: searchParams.get("utm_term") || utmsFromStorage.utm_term || "none",
      full_url: window.location.href,
    };

    const payload = {
      customerName: formData.name,
      customerEmail: resolvedTelegram
        ? `${resolvedTelegram.replace("@", "")}@telegram.com`
        : "phone-client@telegram.com",
      customerPhone: sanitizedPhone,
      telegram: resolvedTelegram,
      instagram: formData.instagram,
      amount,
      tariffName,
      currency: "EUR",
      targetSheet: "3-денне навчання Стиль",
      successUrl: "/price/thanks",
      failUrl: "/price/fail",
      visitor_id: localStorage.getItem("visitor_id") || "",
      ...utmData,
    };

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const paymentData = await res.json();

      if (paymentData.error) {
        clearInterval(intervalId);
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("lead_name", formData.name);
      localStorage.setItem("lead_phone", sanitizedPhone);
      localStorage.setItem("lead_social", resolvedTelegram);
      localStorage.setItem("lead_instagram", formData.instagram);
      localStorage.setItem("lead_tariff", tariffName);
      localStorage.setItem("lead_amount", amount.toString());
      localStorage.setItem("lead_currency", "EUR");

      if (paymentData.tgMsgId) {
        localStorage.setItem(
          "tg_msg_id_data",
          JSON.stringify({
            id: paymentData.tgMsgId.toString(),
            timestamp: Date.now(),
          })
        );
      }

      if (paymentData.uuid) {
        localStorage.setItem("lead_uuid", paymentData.uuid);
      }

      trackFBEvent("InitiateCheckout", {
        content_name: tariffName,
        value: amount,
        currency: "EUR",
        ...utmData,
      });

      sessionStorage.setItem("paymentAttempted", "true");
      sessionStorage.setItem("lastOrderId", paymentData.orderReference);

      clearInterval(intervalId);
      setProgress(100);

      // Submit WayForPay Form
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.wayforpay.com/pay";
      form.acceptCharset = "utf-8";

      Object.entries(paymentData).forEach(([key, value]) => {
        if (["error", "tgMsgId", "uuid"].includes(key)) return;
        if (Array.isArray(value)) {
          value.forEach((val) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = `${key}[]`;
            input.value = String(val);
            form.appendChild(input);
          });
        } else if (value !== undefined && value !== null) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      clearInterval(intervalId);
      console.error(err);
      alert("Виникла мережева помилка. Спробуйте ще раз.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#DFEADF] z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="text-center mb-5">
              <span className="inline-flex items-center gap-1.5 bg-[#F0FAF3] text-[#06874F] border border-[#C9F7DB] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                <Sparkles size={12} />
                РЕЄСТРАЦІЯ НА ІНТЕНСИВ
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#142117]">
                Знайди власний стиль блогу
              </h3>
              <p className="font-manrope text-xs text-[#142117]/70 mt-1">
                Заповни контактні дані для відкриття доступу
              </p>
            </div>

            {/* Price Badge */}
            <div className="bg-[#F8FFF9] border border-[#C9F7DB] rounded-2xl p-3 mb-5 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold text-[#06874F] uppercase tracking-wider">
                  Вартість навчання:
                </div>
                <div className="text-lg font-black text-[#142117]">
                  {amount}€{" "}
                  <span className="line-through text-xs font-normal opacity-50 ml-1">
                    49€
                  </span>
                </div>
              </div>
              <span className="bg-[#18B66F] text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full uppercase tracking-wider">
                -80% ЗНИЖКА
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-[#142117] uppercase tracking-wider mb-1 font-manrope">
                  Твоє ім'я
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="Олена"
                  className={`w-full bg-[#F8FFF9] border ${
                    errors.name ? "border-red-500" : "border-[#DFEADF]"
                  } rounded-xl px-4 py-3 text-sm text-[#142117] focus:outline-none focus:border-[#18B66F] font-manrope transition-colors`}
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 font-medium font-manrope">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Contact Method Switcher */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-[#142117] uppercase tracking-wider font-manrope">
                    Спосіб зв'язку
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        contactMethod === "phone"
                          ? "bg-[#142117] text-white"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      Телефон
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("telegram")}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                        contactMethod === "telegram"
                          ? "bg-[#142117] text-white"
                          : "text-gray-500 hover:text-black"
                      }`}
                    >
                      Telegram
                    </button>
                  </div>
                </div>

                {contactMethod === "phone" ? (
                  <div>
                    <div
                      className={`bg-[#F8FFF9] border ${
                        errors.phone ? "border-red-500" : "border-[#DFEADF]"
                      } rounded-xl px-3 py-2 text-sm text-[#142117] focus-within:border-[#18B66F] transition-colors`}
                    >
                      <PhoneInput
                        international
                        defaultCountry={countryCode as any}
                        value={formData.phone}
                        onChange={(value) => {
                          setFormData({ ...formData, phone: value || "" });
                          if (errors.phone) setErrors({ ...errors, phone: undefined });
                        }}
                        placeholder="Номер телефону"
                        className="w-full text-sm font-manrope custom-phone-input"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1 font-medium font-manrope">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => {
                        setFormData({ ...formData, telegram: e.target.value });
                        if (errors.telegram) setErrors({ ...errors, telegram: undefined });
                      }}
                      placeholder="@username"
                      className={`w-full bg-[#F8FFF9] border ${
                        errors.telegram ? "border-red-500" : "border-[#DFEADF]"
                      } rounded-xl px-4 py-3 text-sm text-[#142117] focus:outline-none focus:border-[#18B66F] font-manrope transition-colors`}
                    />
                    {errors.telegram && (
                      <p className="text-red-500 text-xs mt-1 font-medium font-manrope">
                        {errors.telegram}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Instagram Handle */}
              <div>
                <label className="block text-xs font-bold text-[#142117] uppercase tracking-wider mb-1 font-manrope">
                  Instagram нікнейм
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => {
                    setFormData({ ...formData, instagram: e.target.value });
                  }}
                  placeholder="@your.instagram"
                  className="w-full bg-[#F8FFF9] border border-[#DFEADF] rounded-xl px-4 py-3 text-sm text-[#142117] focus:outline-none focus:border-[#18B66F] font-manrope transition-colors"
                />
              </div>

              {/* Submit Pricing Callout Above Button (User Directive) */}
              <div className="text-center font-manrope text-xs font-bold text-[#06874F] pt-2">
                Отримати доступ за {amount}€ замість 49€
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#18B66F] to-[#06874F] hover:from-[#159f61] hover:to-[#057343] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(24,182,111,0.35)] transition-all cursor-pointer disabled:opacity-70"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Перехід до оплати... ({Math.round(progress)}%)</span>
                  </div>
                ) : (
                  <span>Хочу знайти свій стиль →</span>
                )}
              </button>

              {/* Security guarantee */}
              <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[11px] font-manrope pt-1">
                <Lock size={12} />
                <span>Безпечна оплата через WayForPay · Миттєвий доступ</span>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
