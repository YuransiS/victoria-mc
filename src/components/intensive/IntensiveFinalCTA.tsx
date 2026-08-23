"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { Clock, Lock, ArrowRight } from "lucide-react";
import { use10MinTimer } from "./use10MinTimer";

interface IntensiveFinalCTAProps {
  onOpenCheckout: () => void;
}

export function IntensiveFinalCTA({ onOpenCheckout }: IntensiveFinalCTAProps) {
  const { formattedTime } = use10MinTimer();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    telegram: "",
    instagram: ""
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
        instagram: savedInstagram || prev.instagram
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

    const sanitizedPhone = contactMethod === "phone" ? formData.phone.replace(/[\s()-]/g, "") : "";
    const resolvedTelegram = contactMethod === "telegram"
      ? formData.telegram.startsWith("@") ? formData.telegram : `@${formData.telegram}`
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
      full_url: window.location.href
    };

    const payload = {
      customerName: formData.name,
      customerEmail: resolvedTelegram ? `${resolvedTelegram.replace("@", "")}@telegram.com` : "phone-client@telegram.com",
      customerPhone: sanitizedPhone,
      telegram: resolvedTelegram,
      instagram: formData.instagram,
      amount: 9,
      tariffName: "Інтенсив: 5 лайків",
      currency: "EUR",
      targetSheet: "Інтенсив 5 лайків",
      successUrl: "/price/thanks",
      failUrl: "/price/fail",
      visitor_id: localStorage.getItem("visitor_id") || "",
      ...utmData
    };

    try {
      const res = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const paymentData = await res.json();

      if (paymentData.error) {
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("lead_name", formData.name);
      localStorage.setItem("lead_phone", sanitizedPhone);
      localStorage.setItem("lead_social", resolvedTelegram);
      localStorage.setItem("lead_instagram", formData.instagram);
      localStorage.setItem("lead_tariff", "Інтенсив: 5 лайків");
      localStorage.setItem("lead_amount", "9");
      localStorage.setItem("lead_currency", "EUR");

      if (paymentData.tgMsgId) {
        localStorage.setItem(
          "tg_msg_id_data",
          JSON.stringify({
            id: paymentData.tgMsgId.toString(),
            timestamp: Date.now()
          })
        );
      }

      if (paymentData.uuid) {
        localStorage.setItem("lead_uuid", paymentData.uuid);
      }

      trackFBEvent("Lead", {
        content_name: "Інтенсив: 5 лайків",
        value: 9,
        currency: "EUR",
        ...utmData
      });

      sessionStorage.setItem("paymentAttempted", "true");
      sessionStorage.setItem("lastOrderId", paymentData.orderReference);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.wayforpay.com/pay";
      form.acceptCharset = "utf-8";

      Object.entries(paymentData).forEach(([key, value]) => {
        if (key === 'uuid' || key === 'visitor_uuid' || key === 'tgMsgId') return;
        if (Array.isArray(value)) {
          (value as any[]).forEach((val) => {
            const input = document.createElement("input");
            input.type = "hidden";
            input.name = `${key}[]`;
            input.value = val.toString();
            form.appendChild(input);
          });
        } else if (value !== undefined && value !== null) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value.toString();
          form.appendChild(input);
        }
      });

      document.body.appendChild(form);

      setTimeout(() => {
        form.submit();
      }, 350);
    } catch (err) {
      console.error("Final form error:", err);
      alert("Виникла помилка. Перевірте з'єднання з інтернетом.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="px-5 md:px-10 py-16 md:py-24 bg-[#451220] text-[#FAF6EE] relative overflow-hidden">
      <div className="max-w-4xl mx-auto">
        {/* Contrast Choice */}
        <div className="text-center mb-12">
          <h2 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            ЩЕ СУМНІВАЄШСЯ?
          </h2>

          <div className="max-w-2xl mx-auto space-y-4 font-manrope text-base sm:text-lg opacity-95">
            <p>
              Ціна <strong>9 євро замість 49</strong>. Ця інвестиція може повернутись у перші <strong>$1000+</strong> вже за кілька тижнів.
            </p>
            <p className="italic opacity-80">
              Або не купуй. І через рік знову дивись, як інші роблять систему з того самого, що є в тебе, а ти все ще шукаєш ідею для наступного посту.
            </p>
          </div>
        </div>

        {/* Embedded Registration Form Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#FAF6EE] text-[#2B0813] rounded-3xl p-6 sm:p-10 shadow-2xl max-w-lg mx-auto"
        >
          <div className="text-center mb-6">
            <h3 className="font-playfair text-2xl sm:text-3xl font-bold leading-snug">
              Реєстрація на інтенсив
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-[#2B0813]/70 mt-1">
              4 уроки + 4 бонуси на 125€ + чат та куратор
            </p>

            {/* Price & Timer */}
            <div className="flex items-center justify-center gap-3 mt-4 bg-white/70 py-2.5 px-4 rounded-full border border-[#2B0813]/10 font-manrope">
              <span className="line-through opacity-50 text-xs">49€</span>
              <span className="font-bold text-xl text-[#451220]">9€</span>
              <span className="opacity-30">·</span>
              <div className="flex items-center gap-1 text-xs font-semibold text-[#451220]">
                <Clock size={12} />
                <span>Знижка ще: <strong>{formattedTime}</strong></span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block font-manrope text-xs font-bold uppercase tracking-wider text-[#2B0813]/70 mb-1">
                Ім{`'`}я та прізвище *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setErrors((prev) => ({ ...prev, name: undefined }));
                  localStorage.setItem("lead_name", e.target.value);
                }}
                disabled={isSubmitting}
                placeholder="Олена Ковальчук"
                className={`w-full bg-white border ${
                  errors.name ? "border-red-500" : "border-[#2B0813]/15"
                } rounded-xl px-4 py-3 text-[#2B0813] font-manrope text-sm focus:outline-none focus:border-[#451220] transition-colors`}
              />
              {errors.name && (
                <p className="font-manrope text-[11px] text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Contact Switch */}
            <div>
              <label className="block font-manrope text-xs font-bold uppercase tracking-wider text-[#2B0813]/70 mb-1">
                Спосіб зв{`'`}язку для отримання доступу *
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContactMethod("phone")}
                  className={`py-2 px-3 rounded-full font-manrope text-xs font-bold transition-all border ${
                    contactMethod === "phone"
                      ? "bg-[#451220] text-[#FAF6EE] border-[#451220]"
                      : "bg-white text-[#2B0813]/70 border-[#2B0813]/15 hover:border-[#451220]"
                  }`}
                >
                  📞 Телефон
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("telegram")}
                  className={`py-2 px-3 rounded-full font-manrope text-xs font-bold transition-all border ${
                    contactMethod === "telegram"
                      ? "bg-[#451220] text-[#FAF6EE] border-[#451220]"
                      : "bg-white text-[#2B0813]/70 border-[#2B0813]/15 hover:border-[#451220]"
                  }`}
                >
                  ✈️ Telegram
                </button>
              </div>

              {contactMethod === "phone" ? (
                <div>
                  <PhoneInput
                    international
                    defaultCountry={countryCode as any}
                    value={formData.phone}
                    onChange={(val) => {
                      setFormData((prev) => ({ ...prev, phone: val || "" }));
                      setErrors((prev) => ({ ...prev, phone: undefined }));
                      localStorage.setItem("lead_phone", val || "");
                    }}
                    disabled={isSubmitting}
                    className="w-full flex items-center gap-2 rounded-xl px-4 py-2.5 bg-white border border-[#2B0813]/15 text-[#2B0813] font-manrope text-sm focus-within:border-[#451220] transition-all"
                    numberInputProps={{
                      id: "final-phone-cta",
                      autoComplete: "tel",
                      inputMode: "tel",
                      className:
                        "w-full bg-transparent border-0 p-0 text-[#2B0813] font-manrope text-sm focus:ring-0 focus:outline-none placeholder:text-[#2B0813]/30",
                      placeholder: "+380 ..."
                    }}
                  />
                  {errors.phone && (
                    <p className="font-manrope text-[11px] text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={formData.telegram}
                    onChange={(e) => {
                      setFormData({ ...formData, telegram: e.target.value });
                      setErrors((prev) => ({ ...prev, telegram: undefined }));
                      localStorage.setItem("lead_social", e.target.value);
                    }}
                    disabled={isSubmitting}
                    placeholder="@username"
                    className={`w-full bg-white border ${
                      errors.telegram ? "border-red-500" : "border-[#2B0813]/15"
                    } rounded-xl px-4 py-3 text-[#2B0813] font-manrope text-sm focus:outline-none focus:border-[#451220] transition-colors`}
                  />
                  {errors.telegram && (
                    <p className="font-manrope text-[11px] text-red-500 mt-1">{errors.telegram}</p>
                  )}
                </div>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="block font-manrope text-xs font-bold uppercase tracking-wider text-[#2B0813]/70 mb-1">
                Instagram нікнейм
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) => {
                  setFormData({ ...formData, instagram: e.target.value });
                  localStorage.setItem("lead_instagram", e.target.value);
                }}
                disabled={isSubmitting}
                placeholder="@your_nickname"
                className="w-full bg-white border border-[#2B0813]/15 rounded-xl px-4 py-3 text-[#2B0813] font-manrope text-sm focus:outline-none focus:border-[#451220] transition-colors"
              />
            </div>

            {/* Submit */}
            <div className="pt-2">
              <p className="font-manrope text-xs sm:text-sm font-bold text-center text-[#2B0813]/80 mb-2">
                Хочу систему за 9€ замість 49€
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-full bg-[#451220] text-[#FAF6EE] font-manrope font-bold text-sm sm:text-base tracking-wide shadow-xl hover:bg-[#2B0813] transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Перенаправляємо на оплату...</span>
                ) : (
                  <span>Хочу систему →</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[#2B0813]/50 font-manrope text-[11px] text-center pt-2">
              <Lock size={12} />
              <span>Захищена оплата через WayForPay · 100% Гарантія повернення</span>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
