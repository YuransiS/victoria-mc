"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { Clock, ShieldCheck, Lock, ArrowRight, Zap, Gift } from "lucide-react";
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
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("⏳ Створюємо безпечне з'єднання...");

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
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 7;
        if (prev < 80) return prev + 3;
        if (prev < 90) return prev + 0.8;
        return prev;
      });
    }, 100);

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
        clearInterval(intervalId);
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

      clearInterval(intervalId);
      setProgress(100);

      const form = document.createElement("form");
      form.method = "POST";
      form.action = "https://secure.wayforpay.com/pay";
      form.acceptCharset = "utf-8";

      Object.entries(paymentData).forEach(([key, value]) => {
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
      clearInterval(intervalId);
      console.error("Final form error:", err);
      alert("Виникла помилка. Перевірте з'єднання з інтернетом.");
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-20 px-4 sm:px-6 bg-[#101012] relative">
      <div className="max-w-4xl mx-auto">
        {/* Contrast Choice Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-xs font-black uppercase tracking-[0.2em] mb-4">
            <span>Фінальний вибір</span>
          </div>

          <h2 className="font-inter text-3xl sm:text-5xl font-black text-white uppercase tracking-tight mb-6">
            ЩЕ СУМНІВАЄШСЯ?
          </h2>

          <div className="bg-[#18181a] border-2 border-white/15 p-6 sm:p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.6)] max-w-2xl mx-auto text-left space-y-4">
            <p className="font-manrope text-base sm:text-lg text-white font-bold leading-relaxed">
              Ціна <span className="text-[#fff500] font-black">9 євро замість 49</span>. Ця інвестиція може повернутись у перші <span className="text-[#fff500]">$1000+</span> вже за кілька тижнів.
            </p>
            <div className="w-full h-px bg-white/10 my-4" />
            <p className="font-manrope text-sm sm:text-base text-white/70 leading-relaxed italic">
              Або не купуй. І через рік знову дивись, як інші роблять систему з того самого, що є в тебе, а ти все ще шукаєш ідею для наступного посту.
            </p>
          </div>
        </motion.div>

        {/* Embedded Registration Form Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-[#18181b] border-2 border-[#fff500] p-6 sm:p-10 shadow-[10px_10px_0px_rgba(0,0,0,0.7)]"
        >
          <div className="text-center mb-6">
            <h3 className="font-inter text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-2">
              РЕЄСТРАЦІЯ НА ІНТЕНСИВ
            </h3>
            <p className="font-manrope text-xs sm:text-sm text-white/75">
              4 уроки + 4 бонуси на 125€ + чат та куратор
            </p>

            {/* Price & Timer */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 bg-black/50 py-3 px-4 border border-white/10">
              <div className="flex items-center gap-2">
                <span className="font-manrope text-sm text-white/40 line-through">49€</span>
                <span className="font-inter text-2xl font-black text-[#fff500]">9€</span>
              </div>
              <div className="w-px h-6 bg-white/20 hidden sm:block" />
              <div className="flex items-center gap-1.5 font-manrope text-xs font-bold text-white/80 uppercase">
                <Clock size={14} className="text-[#fff500]" />
                <span>Знижка діє ще: <strong className="text-[#fff500]">{formattedTime}</strong></span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
            {/* Name */}
            <div>
              <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
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
                className={`w-full bg-black/40 border ${
                  errors.name ? "border-red-500" : "border-white/15"
                } px-4 py-3 text-white font-manrope text-sm focus:outline-none focus:border-[#fff500] transition-colors`}
              />
              {errors.name && (
                <p className="font-manrope text-[11px] text-red-400 mt-1">{errors.name}</p>
              )}
            </div>

            {/* Contact Switch */}
            <div>
              <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Спосіб зв{`'`}язку для отримання доступу *
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setContactMethod("phone")}
                  className={`py-2 px-3 font-manrope text-xs font-bold uppercase tracking-wider transition-all border ${
                    contactMethod === "phone"
                      ? "bg-[#fff500] text-black border-[#fff500] font-black"
                      : "bg-black/30 text-white/70 border-white/10 hover:border-white/30"
                  }`}
                >
                  📞 Телефон
                </button>
                <button
                  type="button"
                  onClick={() => setContactMethod("telegram")}
                  className={`py-2 px-3 font-manrope text-xs font-bold uppercase tracking-wider transition-all border ${
                    contactMethod === "telegram"
                      ? "bg-[#fff500] text-black border-[#fff500] font-black"
                      : "bg-black/30 text-white/70 border-white/10 hover:border-white/30"
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
                    className="w-full flex items-center gap-2 react-phone-input-dark px-4 py-2.5 bg-black/40 border border-white/15 text-white font-manrope text-sm focus-within:border-[#fff500] transition-all"
                    numberInputProps={{
                      id: "final-phone",
                      autoComplete: "tel",
                      inputMode: "tel",
                      className:
                        "w-full bg-transparent border-0 p-0 text-white font-manrope text-sm focus:ring-0 focus:outline-none placeholder:text-white/20",
                      placeholder: "+380 ..."
                    }}
                  />
                  {errors.phone && (
                    <p className="font-manrope text-[11px] text-red-400 mt-1">{errors.phone}</p>
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
                    className={`w-full bg-black/40 border ${
                      errors.telegram ? "border-red-500" : "border-white/15"
                    } px-4 py-3 text-white font-manrope text-sm focus:outline-none focus:border-[#fff500] transition-colors`}
                  />
                  {errors.telegram && (
                    <p className="font-manrope text-[11px] text-red-400 mt-1">{errors.telegram}</p>
                  )}
                </div>
              )}
            </div>

            {/* Instagram */}
            <div>
              <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1">
                Instagram нікнейм (для розбору та спільноти)
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
                className="w-full bg-black/40 border border-white/15 px-4 py-3 text-white font-manrope text-sm focus:outline-none focus:border-[#fff500] transition-colors"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 sm:py-5 bg-[#fff500] text-black font-inter font-black text-sm sm:text-base uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Перенаправляємо...
                  </span>
                ) : (
                  <span>Реєструюсь за 9€ замість 49€ — хочу систему →</span>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-white/40 font-manrope text-[10px] uppercase tracking-wider text-center pt-2">
              <Lock size={12} />
              <span>Захищена оплата через WayForPay · 100% Гарантія повернення коштів</span>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
