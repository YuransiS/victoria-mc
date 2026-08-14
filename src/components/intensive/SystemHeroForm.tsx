"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { ShieldCheck } from "lucide-react";

interface SystemHeroFormProps {
  buttonText?: string;
  tariffName?: string;
  amount?: number;
  currency?: string;
  className?: string;
}

export const SystemHeroForm: React.FC<SystemHeroFormProps> = ({
  buttonText = "ЗАБРАТИ УРОКИ ЗА 9 ЄВРО →",
  tariffName = "Інтенсив СИСТЕМА (4 уроки)",
  amount = 9,
  currency = "EUR",
  className = ""
}) => {
  const [formData, setFormData] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [errors, setErrors] = useState({ name: "", phone: "", social: "", instagram: "" });
  const [contactMethod, setContactMethod] = useState<"phone" | "telegram">("phone");
  const [countryCode, setCountryCode] = useState<string>("UA");
  const [status, setStatus] = useState<"idle" | "loading" | "redirecting">("idle");
  const [activeUsers, setActiveUsers] = useState(5);
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

    if (savedName) setFormData((prev) => ({ ...prev, name: savedName }));
    if (savedInstagram) setFormData((prev) => ({ ...prev, instagram: savedInstagram }));
    if (savedPhone) {
      setFormData((prev) => ({ ...prev, phone: savedPhone }));
      setContactMethod("phone");
    } else if (savedSocial) {
      setFormData((prev) => ({ ...prev, social: savedSocial }));
      setContactMethod("telegram");
    }

    const interval = setInterval(() => {
      setActiveUsers((prev) => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 3 ? 3 : newValue > 8 ? 8 : newValue;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    localStorage.setItem(`lead_${field}`, value);
  };

  const validate = () => {
    let valid = true;
    const newErrors = { name: "", phone: "", social: "", instagram: "" };

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = "Введіть ваше ім'я";
      valid = false;
    }

    if (contactMethod === "phone") {
      if (!formData.phone.trim() || !isValidPhoneNumber(formData.phone)) {
        newErrors.phone = "Введіть коректний телефон";
        valid = false;
      }
    } else {
      const tg = formData.social.trim().replace("@", "");
      if (tg.length < 3) {
        newErrors.social = "Введіть Telegram нікнейм";
        valid = false;
      }
    }

    if (formData.instagram.trim().length < 3) {
      newErrors.instagram = "Введіть ваш Instagram нік";
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

    const searchParams = new URLSearchParams(window.location.search);
    const utmData = {
      utm_source: searchParams.get("utm_source") || "direct",
      utm_medium: searchParams.get("utm_medium") || "none",
      utm_campaign: searchParams.get("utm_campaign") || "none",
      utm_content: searchParams.get("utm_content") || "none",
      utm_term: searchParams.get("utm_term") || "none",
      full_url: window.location.href
    };

    const sanitizedPhone = contactMethod === "phone" ? formData.phone.replace(/[\s()-]/g, "") : "";
    const sanitizedSocial =
      contactMethod === "telegram"
        ? formData.social.startsWith("@")
          ? formData.social
          : `@${formData.social}`
        : "";

    const payload = {
      customerName: formData.name,
      customerEmail: sanitizedSocial
        ? `${sanitizedSocial.replace("@", "")}@telegram.com`
        : "phone-client@telegram.com",
      customerPhone: sanitizedPhone,
      telegram: sanitizedSocial,
      instagram: formData.instagram,
      amount: amount,
      tariffName: tariffName
    };

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
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
        setStatus("idle");
        return;
      }

      localStorage.setItem("lead_name", formData.name);
      localStorage.setItem("lead_phone", sanitizedPhone);
      localStorage.setItem("lead_social", sanitizedSocial);
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
      setStatus("idle");
    }
  };

  return (
    <div
      className={`w-full bg-[#18181a]/95 backdrop-blur-md border border-white/15 p-5 sm:p-6 shadow-2xl ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#fff500] animate-pulse"></span>
          <span className="text-[11px] font-manrope font-bold text-white/80 uppercase tracking-wider">
            Зараз заповнюють: <strong className="text-[#fff500]">{activeUsers}</strong>
          </span>
        </div>
        <div className="text-right">
          <span className="text-white/40 line-through text-xs font-semibold mr-1.5">49€</span>
          <span className="text-[#fff500] font-manrope font-extrabold text-base">{amount}€</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-manrope font-bold uppercase tracking-wider text-white/70 mb-1">
            Ім{`'`}я та прізвище
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Ваше ім'я"
            disabled={status !== "idle"}
            className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/20 px-3.5 py-2.5 text-xs font-manrope focus:border-[#fff500] focus:outline-none transition-colors"
          />
          {errors.name && <p className="text-red-400 text-[10px] mt-1">{errors.name}</p>}
        </div>

        {/* Contact Method */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-[10px] font-manrope font-bold uppercase tracking-wider text-white/70">
              Спосіб зв{`'`}язку
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContactMethod("phone")}
                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 transition-all ${
                  contactMethod === "phone" ? "bg-[#fff500] text-black" : "text-white/50 hover:text-white"
                }`}
              >
                Телефон
              </button>
              <button
                type="button"
                onClick={() => setContactMethod("telegram")}
                className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 transition-all ${
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
                onChange={(val) => handleChange("phone", val || "")}
                disabled={status !== "idle"}
                className="w-full react-phone-input-dark bg-black/40 border border-white/15 px-2.5 py-1.5 text-white text-xs"
                numberInputProps={{
                  id: "hero-phone",
                  autoComplete: "tel",
                  inputMode: "tel",
                  className:
                    "w-full bg-transparent border-none text-white text-xs focus:outline-none placeholder:text-white/20 font-manrope",
                  placeholder: "+"
                }}
              />
              {errors.phone && <p className="text-red-400 text-[10px] mt-1">{errors.phone}</p>}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={formData.social}
                onChange={(e) => handleChange("social", e.target.value)}
                placeholder="@username"
                disabled={status !== "idle"}
                className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/20 px-3.5 py-2.5 text-xs font-manrope focus:border-[#fff500] focus:outline-none transition-colors"
              />
              {errors.social && <p className="text-red-400 text-[10px] mt-1">{errors.social}</p>}
            </div>
          )}
        </div>

        {/* Instagram */}
        <div>
          <label className="block text-[10px] font-manrope font-bold uppercase tracking-wider text-white/70 mb-1">
            Instagram @нікнейм
          </label>
          <input
            type="text"
            value={formData.instagram}
            onChange={(e) => handleChange("instagram", e.target.value)}
            placeholder="@nickname"
            disabled={status !== "idle"}
            className="w-full bg-black/40 border border-white/15 text-white placeholder:text-white/20 px-3.5 py-2.5 text-xs font-manrope focus:border-[#fff500] focus:outline-none transition-colors"
          />
          {errors.instagram && <p className="text-red-400 text-[10px] mt-1">{errors.instagram}</p>}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={status !== "idle"}
          className="w-full bg-[#fff500] hover:bg-[#fff733] text-black font-manrope font-black py-3.5 px-4 uppercase tracking-[0.15em] text-xs transition-all active:scale-[0.98] shadow-lg cursor-pointer flex items-center justify-center gap-2 mt-2"
        >
          {status === "redirecting" ? "ПЕРЕНАПРАВЛЕННЯ..." : buttonText}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-white/50 text-[10px] uppercase tracking-wider pt-1">
          <ShieldCheck size={13} className="text-[#fff500]" />
          <span>Гарантія повернення 9€</span>
        </div>
      </form>

      {/* Redirect Overlay */}
      <AnimatePresence>
        {status === "redirecting" && (
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
              <p className="text-white/70 text-xs mb-6">Формуємо безпечне посилання для оплати...</p>

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
  );
};
