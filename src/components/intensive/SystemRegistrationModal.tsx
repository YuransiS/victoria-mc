"use client";

import React, { useEffect, useState } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { X, ShieldCheck } from "lucide-react";
import { getClientMarketingAttribution, normalizePhone, normalizeTelegram, normalizeInstagram, normalizeAmount } from "@/lib/enrichment";

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

    const normalizedPhoneVal = contactMethod === "phone" ? normalizePhone(formData.phone) : null;
    const cleanTg = contactMethod === "telegram" ? normalizeTelegram(formData.telegram) : null;
    const resolvedTelegram = cleanTg ? `@${cleanTg}` : "";
    const cleanInstagram = normalizeInstagram(formData.instagram);

    // UTM / Source & Ads tracking via Enrichment Protocol v2.0
    const marketingAttr = getClientMarketingAttribution();
    const floatAmount = normalizeAmount(amount);
    const finalCurrency = "EUR";

    const clientEmail = cleanTg ? `${cleanTg}@telegram.com` : (normalizedPhoneVal ? `client-${normalizedPhoneVal.replace(/\D/g, '')}@telegram.com` : "phone-client@telegram.com");

    const payload = {
      customerName: formData.name.trim(),
      customerEmail: clientEmail,
      customerPhone: normalizedPhoneVal || formData.phone,
      telegram: resolvedTelegram,
      instagram: cleanInstagram || formData.instagram,
      amount: floatAmount,
      tariffName: tariffName,
      currency: finalCurrency,
      product_type: "tripwire" as const,
      targetSheet: "Інтенсив",
      successUrl: "/price/thanks",
      failUrl: "/price/fail",
      visitor_id: marketingAttr.visitor_uuid || localStorage.getItem("visitor_id") || "",
      ...marketingAttr,
      marketing: marketingAttr
    };

    try {
      const response = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        clearInterval(intervalId);
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

      localStorage.setItem("lead_name", formData.name.trim());
      localStorage.setItem("lead_phone", normalizedPhoneVal || formData.phone);
      localStorage.setItem("lead_social", resolvedTelegram);
      localStorage.setItem("lead_instagram", cleanInstagram || formData.instagram);
      localStorage.setItem("lead_tariff", tariffName);
      localStorage.setItem("lead_amount", floatAmount.toFixed(2));
      localStorage.setItem("lead_currency", finalCurrency);
      localStorage.setItem("lead_utm_source", marketingAttr.utm_source || "direct");
      localStorage.setItem("lead_utm_medium", marketingAttr.utm_medium || "none");

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
        value: floatAmount,
        currency: finalCurrency,
        ...marketingAttr
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
            className="fixed inset-0 bg-[#23080F]/80 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-md bg-[#FDFBF7] text-[#2D0C14] rounded-3xl p-7 sm:p-9 shadow-2xl z-10 my-8 text-left border border-[#380E18]/15"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-[#2D0C14]/50 hover:text-[#2D0C14] p-1.5 transition-colors focus:outline-none"
              aria-label="Закрити"
            >
              <X size={22} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-block bg-[#380E18] text-[#FDFBF7] font-manrope text-[10px] font-extrabold uppercase tracking-[0.18em] px-3.5 py-1 rounded-full mb-3">
                ІНТЕНСИВ · 4 УРОКИ
              </div>
              <h3 className="font-manrope text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#2D0C14] leading-tight">
                ЗАБРОНЮВАТИ МІСЦЕ
              </h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[#2D0C14]/40 line-through text-sm font-semibold">49 євро</span>
                <span className="text-[#380E18] text-2xl font-black">{amount} євро</span>
                <span className="text-[11px] text-[#2D0C14]/70 font-semibold ml-1">
                  (всі 4 бонуси включено)
                </span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-[#2D0C14]/70 mb-1.5">
                  Ваше ім{`'`}я
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Олена"
                  disabled={isSubmitting}
                  className="w-full bg-[#FFFFFF] border border-[#380E18]/15 text-[#2D0C14] rounded-xl px-4 py-3 text-sm focus:border-[#380E18] focus:ring-1 focus:ring-[#380E18]/20 focus:outline-none transition-all placeholder:text-[#2D0C14]/30"
                />
                {errors.name && (
                  <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.name}</p>
                )}
              </div>

              {/* Contact Method Switch */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-[#2D0C14]/70">
                    Спосіб зв{`'`}язку
                  </label>
                  <div className="flex gap-1.5 bg-[#EFE8DC] p-1 rounded-full">
                    <button
                      type="button"
                      onClick={() => setContactMethod("phone")}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
                        contactMethod === "phone"
                          ? "bg-[#380E18] text-[#FDFBF7]"
                          : "text-[#2D0C14]/60 hover:text-[#2D0C14]"
                      }`}
                    >
                      Телефон
                    </button>
                    <button
                      type="button"
                      onClick={() => setContactMethod("telegram")}
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full transition-all ${
                        contactMethod === "telegram"
                          ? "bg-[#380E18] text-[#FDFBF7]"
                          : "text-[#2D0C14]/60 hover:text-[#2D0C14]"
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
                      className="w-full bg-[#FFFFFF] border border-[#380E18]/15 text-[#2D0C14] rounded-xl px-3 py-2.5 react-phone-input-light"
                      numberInputProps={{
                        id: "modal-phone",
                        autoComplete: "tel",
                        inputMode: "tel",
                        className:
                          "w-full bg-transparent border-none text-[#2D0C14] text-sm focus:outline-none placeholder:text-[#2D0C14]/30",
                        placeholder: "+"
                      }}
                    />
                    {errors.phone && (
                      <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.phone}</p>
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
                      className="w-full bg-[#FFFFFF] border border-[#380E18]/15 text-[#2D0C14] rounded-xl px-4 py-3 text-sm focus:border-[#380E18] focus:ring-1 focus:ring-[#380E18]/20 focus:outline-none transition-all placeholder:text-[#2D0C14]/30"
                    />
                    {errors.telegram && (
                      <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.telegram}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div>
                <label className="block font-manrope text-[11px] font-bold uppercase tracking-wider text-[#2D0C14]/70 mb-1.5">
                  Instagram нікнейм
                </label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => handleInputChange("instagram", e.target.value)}
                  placeholder="@nickname"
                  disabled={isSubmitting}
                  className="w-full bg-[#FFFFFF] border border-[#380E18]/15 text-[#2D0C14] rounded-xl px-4 py-3 text-sm focus:border-[#380E18] focus:ring-1 focus:ring-[#380E18]/20 focus:outline-none transition-all placeholder:text-[#2D0C14]/30"
                />
                {errors.instagram && (
                  <p className="text-red-600 text-[11px] mt-1 font-medium">{errors.instagram}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <p className="font-manrope text-xs font-bold text-center text-[#2D0C14]/80 mb-2">
                  Хочу систему за {amount}€ замість 49€
                </p>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#380E18] hover:bg-[#23080F] text-[#FDFBF7] font-manrope font-extrabold py-4 px-6 rounded-full uppercase tracking-[0.12em] text-xs transition-all transform active:scale-[0.99] shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? "ОБРОБКА..." : "ХОЧУ СИСТЕМУ →"}
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-[#2D0C14]/60 text-[11px] uppercase tracking-wider pt-2">
                <ShieldCheck size={14} className="text-[#380E18]" />
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
                className="fixed inset-0 z-[10005] bg-[#23080F]/90 backdrop-blur-xl flex items-center justify-center p-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-[#FDFBF7] text-[#2D0C14] p-8 md:p-10 text-center max-w-md w-full rounded-3xl shadow-2xl border border-[#380E18]/15"
                >
                  <h3 className="font-manrope font-black text-2xl text-[#380E18] mb-2 uppercase">
                    Дякуємо! Заявку створено
                  </h3>
                  <p className="text-[#2D0C14]/70 text-xs mb-6">
                    Формуємо безпечне платіжне посилання WayForPay...
                  </p>

                  <div className="w-full bg-[#EFE8DC] h-2 rounded-full overflow-hidden my-4">
                    <motion.div
                      className="h-full bg-[#380E18] rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: progress === 100 ? 0.35 : 0.1, ease: "easeOut" }}
                    />
                  </div>

                  <p className="font-manrope text-xs font-semibold text-[#2D0C14]/85 min-h-[1.5rem] mt-2">
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
