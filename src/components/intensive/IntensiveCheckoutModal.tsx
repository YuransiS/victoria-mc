"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { X, Lock, ShieldCheck, CheckCircle2 } from "lucide-react";

interface IntensiveCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName?: string;
  amount?: number;
}

export function IntensiveCheckoutModal({
  isOpen,
  onClose,
  tariffName = "Інтенсив: 5 лайків",
  amount = 9
}: IntensiveCheckoutModalProps) {
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

    // Restore from localStorage
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

  useEffect(() => {
    if (progress === 0) {
      setProgressMessage("⏳ Створюємо безпечне з'єднання...");
    } else if (progress < 40) {
      setProgressMessage("🔒 Формуємо захищений платіж...");
    } else if (progress < 85) {
      setProgressMessage("⏱️ Ще кілька секунд, не закривайте вікно...");
    } else {
      setProgressMessage("🚀 Перенаправляємо на сторінку оплати...");
    }
  }, [progress]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      trackFBEvent("InitiateCheckout", {
        content_name: tariffName,
        value: amount,
        currency: "EUR"
      });

      try {
        const visitorId = localStorage.getItem("visitor_id");
        if (visitorId) {
          fetch("/api/analytics/log", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              visitorId,
              status: "КликФормы",
              path: window.location.pathname,
              name: localStorage.getItem("lead_name"),
              phone: localStorage.getItem("lead_phone"),
              social: localStorage.getItem("lead_social"),
              tariff: tariffName,
              amount: amount
            })
          }).catch(() => {});
        }
      } catch (_) {}
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, tariffName, amount]);

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

    // UTM / Source tracking
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
      amount: amount,
      tariffName: tariffName,
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
        alert("Помилка при створенні платежу. Спробуйте пізніше або зверніться до підтримки.");
        setIsSubmitting(false);
        return;
      }

      // Persist user identification
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
            timestamp: Date.now()
          })
        );
      }

      if (paymentData.uuid) {
        localStorage.setItem("lead_uuid", paymentData.uuid);
      }

      trackFBEvent("Lead", {
        content_name: tariffName,
        value: amount,
        currency: "EUR",
        ...utmData
      });

      sessionStorage.setItem("paymentAttempted", "true");
      sessionStorage.setItem("lastOrderId", paymentData.orderReference);

      clearInterval(intervalId);
      setProgress(100);

      // Build and submit WayForPay form
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
      console.error("Payment submission error:", err);
      alert("Виникла помилка. Перевірте з'єднання з інтернетом.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="pointer-events-auto relative w-full max-w-lg bg-[#18181a] border-2 border-white/15 p-6 sm:p-10 shadow-[10px_10px_0px_rgba(0,0,0,0.8)] text-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/50 hover:text-white p-2 transition-colors cursor-pointer"
                aria-label="Закрити"
              >
                <X size={24} />
              </button>

              {/* Header */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 bg-[#fff500]/10 border border-[#fff500] text-[#fff500] font-manrope text-[11px] font-extrabold uppercase tracking-widest mb-3">
                  Інтенсив · 4 уроки
                </div>
                <h3 className="font-inter text-2xl sm:text-3xl font-black uppercase text-white tracking-tight leading-tight">
                  Отримати доступ до інтенсиву
                </h3>
                <p className="font-manrope text-xs sm:text-sm text-white/70 mt-1">
                  Заповніть форму нижче для переходу до захищеної оплати
                </p>
              </div>

              {/* Price Banner */}
              <div className="flex items-center justify-between p-4 bg-black/60 border border-white/10 mb-6">
                <div>
                  <p className="font-manrope text-[11px] text-white/50 uppercase tracking-widest font-bold">
                    Тариф: <span className="text-white">Повний доступ + 4 бонуси</span>
                  </p>
                  <p className="font-manrope text-xs text-white/80 mt-0.5">
                    Бонуси на 125€ включено безкоштовно
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-manrope text-xs text-white/40 line-through">49€</div>
                  <div className="font-inter text-2xl font-black text-[#fff500] leading-none">
                    9€
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name input */}
                <div>
                  <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Ваше ім{`'`}я та прізвище *
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

                {/* Contact Method Switch */}
                <div>
                  <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Оберіть спосіб зв{`'`}язку для доступу *
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`py-2.5 px-3 font-manrope text-xs font-bold uppercase tracking-wider transition-all border ${
                        contactMethod === "phone"
                          ? "bg-[#fff500] text-black border-[#fff500] font-black"
                          : "bg-black/30 text-white/70 border-white/10 hover:border-white/30"
                      }`}
                    >
                      📞 Телефон / WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("telegram")}
                      className={`py-2.5 px-3 font-manrope text-xs font-bold uppercase tracking-wider transition-all border ${
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
                          id: "phone",
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
                        <p className="font-manrope text-[11px] text-red-400 mt-1">
                          {errors.telegram}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Instagram Handle */}
                <div>
                  <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                    Ваш Instagram (для зв{`'`}язку та розбору)
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => {
                      setFormData({ ...formData, instagram: e.target.value });
                      localStorage.setItem("lead_instagram", e.target.value);
                    }}
                    disabled={isSubmitting}
                    placeholder="@your_instagram"
                    className="w-full bg-black/40 border border-white/15 px-4 py-3 text-white font-manrope text-sm focus:outline-none focus:border-[#fff500] transition-colors"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-[#fff500] text-black font-inter font-black text-sm uppercase tracking-wider border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] hover:bg-white transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        Перенаправляємо...
                      </span>
                    ) : (
                      <span>Забрати доступ за 9€ замість 49€ →</span>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-2 text-white/40 font-manrope text-[10px] uppercase tracking-wider text-center">
                  <Lock size={12} />
                  <span>Безпечна оплата через WayForPay · Дані зашифровано</span>
                </div>
              </form>

              {/* Progress Overlay during redirect */}
              <AnimatePresence>
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-[#18181a]/95 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-8 text-center"
                  >
                    <div className="w-12 h-12 rounded-full border-3 border-[#fff500]/20 border-t-[#fff500] animate-spin mb-4" />
                    <h4 className="font-inter text-lg font-bold text-white mb-2">
                      Замовлення сформовано
                    </h4>
                    <p className="font-manrope text-sm text-white/70 mb-4">{progressMessage}</p>
                    <div className="w-full max-w-xs bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="bg-[#fff500] h-full"
                        initial={{ width: "0%" }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.2 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
