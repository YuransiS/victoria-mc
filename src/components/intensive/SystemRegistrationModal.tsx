"use client";

import React, { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { X, ShieldCheck } from "lucide-react";

interface SystemRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName?: string;
  amount?: number;
  currency?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  telegram?: string;
  instagram?: string;
}

export const SystemRegistrationModal: React.FC<SystemRegistrationModalProps> = ({
  isOpen,
  onClose,
  tariffName = "Інтенсив СИСТЕМА (4 уроки)",
  amount = 9,
  currency = "EUR"
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    telegram: "",
    instagram: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram">("phone");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("⏳ Створюємо безпечне з'єднання...");
  const [countryCode, setCountryCode] = useState<string>("UA");

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
    fetch("/api/country")
      .then((res) => res.json())
      .then((data) => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  // Restore data from localStorage on mount
  useEffect(() => {
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
      if (savedPhone) {
        setContactMethod("phone");
      } else if (savedSocial) {
        setContactMethod("telegram");
      }
    }
  }, []);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      trackFBEvent("InitiateCheckout", {
        content_name: tariffName,
        value: amount,
        currency: currency
      });

      // Log telemetric form view event
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
      } catch (err) {}
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, tariffName, amount, currency]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    localStorage.setItem(`lead_${field === "telegram" ? "social" : field}`, value);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Будь ласка, введіть ваше ім'я";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Ім'я має містити щонайменше 2 символи";
    }

    if (contactMethod === "phone") {
      if (!formData.phone.trim()) {
        newErrors.phone = "Будь ласка, введіть номер телефону";
      } else if (!isValidPhoneNumber(formData.phone)) {
        newErrors.phone = "Введіть коректний номер телефону";
      }
    } else {
      const tg = formData.telegram.trim();
      if (!tg) {
        newErrors.telegram = "Будь ласка, введіть Telegram нік";
      } else {
        const cleanTg = tg.replace("@", "");
        if (cleanTg.length < 3) {
          newErrors.telegram = "Нік у Telegram має бути не менше 3 символів";
        }
      }
    }

    const insta = formData.instagram.trim();
    if (insta.length < 3) {
      newErrors.instagram = "Введіть ваш Instagram нікнейм";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setProgress(0);

    const intervalId = setInterval(() => {
      setProgress((prev) => {
        if (prev < 50) return prev + 6;
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

    // UTM tracking
    const searchParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "none",
      utm_campaign: searchParams.get("utm_campaign") || "none",
      utm_content: searchParams.get("utm_content") || "none",
      utm_term: searchParams.get("utm_term") || "none",
      full_url: window.location.href
    };

    const payloadData = {
      customerName: formData.name,
      customerEmail: resolvedTelegram
        ? `${resolvedTelegram.replace("@", "")}@telegram.com`
        : "phone-client@telegram.com",
      customerPhone: sanitizedPhone,
      telegram: resolvedTelegram,
      instagram: formData.instagram,
      amount: amount,
      tariffName: tariffName
    };

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payloadData,
          ...utmData,
          visitor_id: localStorage.getItem("visitor_id") || "",
          currency: currency,
          amount: amount,
          targetSheet: "Інтенсив",
          successUrl: "/price/thanks",
          failUrl: "/price/fail"
        })
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        clearInterval(intervalId);
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

      // Save user data in localStorage
      localStorage.setItem("lead_name", formData.name);
      localStorage.setItem("lead_phone", sanitizedPhone);
      localStorage.setItem("lead_social", resolvedTelegram);
      localStorage.setItem("lead_instagram", formData.instagram);
      localStorage.setItem("lead_tariff", tariffName);
      localStorage.setItem("lead_amount", amount.toString());
      localStorage.setItem("lead_currency", currency);
      localStorage.setItem("lead_utm_source", utmData.utm_source);
      localStorage.setItem("lead_utm_medium", utmData.utm_medium);

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
        currency: currency,
        ...utmData
      });

      sessionStorage.setItem("paymentAttempted", "true");
      sessionStorage.setItem("lastOrderId", paymentData.orderReference);

      clearInterval(intervalId);
      setProgress(100);

      // Submit WayForPay form
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
    } catch (error) {
      clearInterval(intervalId);
      console.error("Payment error:", error);
      alert("Відбулася помилка. Перевірте з'єднання з інтернетом.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md bg-[#161618] border border-white/15 p-6 sm:p-8 shadow-2xl z-10 my-8 text-left"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2 transition-colors focus:outline-none"
              aria-label="Закрити"
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-block bg-[#fff500] text-black font-manrope text-[10px] font-extrabold uppercase tracking-[0.15em] px-2.5 py-1 mb-2">
                ІНТЕНСИВ · 4 УРОКИ
              </div>
              <h3 className="font-manrope text-2xl sm:text-3xl font-black text-white uppercase tracking-tight leading-tight">
                ЗАБРОНЮВАТИ МІСЦЕ
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/40 line-through text-sm font-medium">49 євро</span>
                <span className="text-[#fff500] text-xl font-black">{amount} євро</span>
                <span className="text-[11px] text-white/60 uppercase tracking-wider font-semibold ml-1">
                  (всі 4 бонуси включено)
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Ваше ім{`'`}я
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Олена"
                  disabled={isSubmitting}
                  className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/25 px-4 py-3 text-sm focus:border-[#fff500] focus:outline-none transition-colors"
                />
                {errors.name && (
                  <p className="text-red-400 text-[11px] mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Contact Method Switch */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70">
                    Спосіб зв{`'`}язку
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 transition-all ${
                        contactMethod === "phone"
                          ? "bg-[#fff500] text-black"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Телефон
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("telegram")}
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 transition-all ${
                        contactMethod === "telegram"
                          ? "bg-[#fff500] text-black"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      Telegram
                    </button>
                  </div>
                </div>

                {contactMethod === "phone" ? (
                  <div>
                    <PhoneInput
                      international
                      defaultCountry={countryCode as any}
                      value={formData.phone}
                      onChange={(val) => handleInputChange("phone", val || "")}
                      disabled={isSubmitting}
                      className="w-full react-phone-input-dark bg-black/40 border border-white/15 px-3 py-2 text-white"
                      numberInputProps={{
                        id: "modal-phone",
                        autoComplete: "tel",
                        inputMode: "tel",
                        className:
                          "w-full bg-transparent border-none text-white text-sm focus:outline-none placeholder:text-white/25",
                        placeholder: "+"
                      }}
                    />
                    {errors.phone && (
                      <p className="text-red-400 text-[11px] mt-1 font-medium">{errors.phone}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={formData.telegram}
                      onChange={(e) => handleInputChange("telegram", e.target.value)}
                      placeholder="@username"
                      disabled={isSubmitting}
                      className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/25 px-4 py-3 text-sm focus:border-[#fff500] focus:outline-none transition-colors"
                    />
                    {errors.telegram && (
                      <p className="text-red-400 text-[11px] mt-1 font-medium">{errors.telegram}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-white/70 mb-1.5">
                  Instagram @нікнейм
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="@nickname"
                  disabled={isSubmitting}
                  className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/25 px-4 py-3 text-sm focus:border-[#fff500] focus:outline-none transition-colors"
                />
                {errors.instagram && (
                  <p className="text-red-400 text-[11px] mt-1 font-medium">{errors.instagram}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#fff500] hover:bg-[#fff733] text-black font-manrope font-extrabold py-4 px-6 uppercase tracking-[0.15em] text-xs transition-all transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {isSubmitting ? "ОБРОБКА..." : `ОПЛАТИТИ УЧАСТЬ ЗА ${amount} ЄВРО →`}
              </button>

              <div className="flex items-center justify-center gap-2 text-white/40 text-[10px] uppercase tracking-wider pt-2">
                <ShieldCheck size={14} className="text-[#fff500]" />
                <span>100% ГАРАНТІЯ ПОВЕРНЕННЯ КОШТІВ</span>
              </div>
            </form>
          </motion.div>

          {/* Redirect Overlay */}
          <AnimatePresence>
            {isSubmitting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10005] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#18181a] p-8 md:p-12 text-center max-w-md w-full border border-white/15 shadow-2xl"
                >
                  <h3 className="font-manrope font-extrabold text-2xl text-[#fff500] mb-3 uppercase">
                    Дякуємо! Заявку створено
                  </h3>
                  <p className="text-white/70 text-xs mb-6">
                    Формуємо безпечне платіжне посилання WayForPay...
                  </p>

                  <div className="w-full bg-white/10 h-2 overflow-hidden my-4 border border-white/10">
                    <motion.div
                      className="h-full bg-[#fff500]"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: progress === 100 ? 0.35 : 0.1, ease: "easeOut" }}
                    />
                  </div>

                  <p className="font-manrope text-xs font-semibold text-white/80 min-h-[1.5rem] mt-2">
                    {progressMessage}
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
};
