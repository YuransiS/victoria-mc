"use client";

import React, { useState, useEffect } from "react";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";
import { X, Lock, Check, Sparkles, Flame, ArrowRight, Copy, Send, CheckCircle2, MessageCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getBwCid, getVisitorUUID } from "@/lib/enrichment";

interface StyleCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName?: string;
  amount?: number;
}

export function StyleCheckoutModal({
  isOpen,
  onClose,
  tariffName = "3-денне навчання: Твій стиль блогу (Безкоштовно)",
  amount = 0,
}: StyleCheckoutModalProps) {
  const router = useRouter();
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
  const [isSuccess, setIsSuccess] = useState(false);

  const handleModalClose = () => {
    onClose();
    setTimeout(() => {
      setIsSuccess(false);
      setIsSubmitting(false);
    }, 300);
  };

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

    const visitorUuid = localStorage.getItem("visitor_id") || localStorage.getItem("visitor_uuid") || getVisitorUUID();
    const bwCid = getBwCid(visitorUuid);
    const orderId = `STYLE_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const phoneVal = sanitizedPhone || (formData.phone ? formData.phone.replace(/[\s()-]/g, "") : "") || resolvedTelegram || "";

    const payload = {
      name: formData.name,
      phone: sanitizedPhone || formData.phone,
      telegram: resolvedTelegram,
      instagram: formData.instagram,
      amount: amount.toString(),
      currency: "UAH",
      order_id: orderId,
      orderReference: orderId,
      targetSheet: "3-денне навчання Стиль (Безкоштовно)",
      visitor_id: visitorUuid,
      visitor_uuid: visitorUuid,
      bw_cid: bwCid,
      ...utmData,
    };

    try {
      // Free Registration Lead Submission
      await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      localStorage.setItem("lead_name", formData.name);
      localStorage.setItem("lead_phone", phoneVal);
      localStorage.setItem("lead_social", resolvedTelegram);
      localStorage.setItem("lead_instagram", formData.instagram);
      localStorage.setItem("lead_tariff", tariffName);
      localStorage.setItem("lead_amount", "0");
      localStorage.setItem("lead_currency", "UAH");
      localStorage.setItem("lead_order_id", orderId);
      localStorage.setItem("lead_bw_cid", bwCid);

      trackFBEvent("Lead", {
        content_name: tariffName,
        value: 0,
        currency: "UAH",
        order_id: orderId,
        ...utmData,
      });

      trackFBEvent("CompleteRegistration", {
        content_name: tariffName,
        value: 0,
        currency: "UAH",
        order_id: orderId,
        ...utmData,
      });

    setIsSubmitting(false);
    // Target Thanks page passing bw_cid, phone, order_id parameters
    const thanksBase = typeof window !== "undefined" && window.location.pathname.startsWith("/style") ? "/style/thanks" : "/intensive/style/thanks";
    const targetThanksUrl = `${thanksBase}?bw_cid=${encodeURIComponent(bwCid)}&phone=${encodeURIComponent(phoneVal)}&order_id=${encodeURIComponent(orderId)}`;
    router.push(targetThanksUrl);
    } catch (err) {
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
            onClick={handleModalClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-[#EADBCE] z-10 overflow-hidden"
          >
            {/* Close Button */}
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 text-gray-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            {!isSuccess ? (
              <>
                {/* Header */}
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-1.5 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2">
                    <Flame size={12} className="text-[#D96B27]" />
                    БЕЗКОШТОВНА РЕЄСТРАЦІЯ
                  </span>
                  <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#231815]">
                    Знайди власний стиль блогу
                  </h3>
                  <p className="font-manrope text-xs text-[#231815]/70 mt-1">
                    Заповни дані для отримання миттєвого доступу
                  </p>
                </div>

                {/* Free Spots Urgency Callout */}
                <div className="bg-[#FEF5EE] border border-[#F5D6C1] rounded-2xl p-3.5 mb-4">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div>
                      <div className="text-[10px] font-extrabold text-[#A33D12] uppercase tracking-wider">
                        Вартість участі:
                      </div>
                      <div className="text-xl font-black text-[#D96B27]">
                        0 грн{" "}
                        <span className="line-through text-xs font-normal text-gray-400 ml-1.5">
                          690 грн
                        </span>
                      </div>
                    </div>
                    <span className="bg-gradient-to-r from-[#D96B27] to-[#A33D12] text-white font-extrabold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                      100% ЗНИЖКА
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-[#A33D12] flex items-center justify-between border-t border-[#F5D6C1]/60 pt-2 font-manrope">
                    <span>Зайнято 79 із 100 місць</span>
                    <span className="text-[#D96B27]">Залишився 21 слот!</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1 font-manrope">
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
                      className={`w-full bg-[#FAF4EC] border ${
                        errors.name ? "border-red-500" : "border-[#EADBCE]"
                      } rounded-xl px-4 py-2.5 text-sm text-[#231815] focus:outline-none focus:border-[#D96B27] font-manrope transition-colors`}
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
                      <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider font-manrope">
                        Спосіб зв'язку
                      </label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setContactMethod("phone")}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition-colors ${
                            contactMethod === "phone"
                              ? "bg-[#1F1410] text-white"
                              : "text-gray-500 hover:text-black"
                          }`}
                        >
                          Телефон
                        </button>
                        <button
                          type="button"
                          onClick={() => setContactMethod("telegram")}
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md transition-colors ${
                            contactMethod === "telegram"
                              ? "bg-[#1F1410] text-white"
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
                          className={`bg-[#FAF4EC] border ${
                            errors.phone ? "border-red-500" : "border-[#EADBCE]"
                          } rounded-xl px-3 py-2 text-sm text-[#231815] focus-within:border-[#D96B27] transition-colors`}
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
                          className={`w-full bg-[#FAF4EC] border ${
                            errors.telegram ? "border-red-500" : "border-[#EADBCE]"
                          } rounded-xl px-4 py-2.5 text-sm text-[#231815] focus:outline-none focus:border-[#D96B27] font-manrope transition-colors`}
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
                    <label className="block text-xs font-bold text-[#231815] uppercase tracking-wider mb-1 font-manrope">
                      Instagram нікнейм
                    </label>
                    <input
                      type="text"
                      value={formData.instagram}
                      onChange={(e) => {
                        setFormData({ ...formData, instagram: e.target.value });
                      }}
                      placeholder="@your.instagram"
                      className="w-full bg-[#FAF4EC] border border-[#EADBCE] rounded-xl px-4 py-2.5 text-sm text-[#231815] focus:outline-none focus:border-[#D96B27] font-manrope transition-colors"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] transition-all cursor-pointer disabled:opacity-70 mt-2"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Фіксуємо бронювання...</span>
                      </div>
                    ) : (
                      <span>Зареєструватися безкоштовно →</span>
                    )}
                  </button>

                  {/* Security guarantee */}
                  <div className="flex items-center justify-center gap-1.5 text-gray-400 text-[11px] font-manrope pt-1">
                    <Lock size={12} />
                    <span>Миттєве відкриття доступу · Без спаму</span>
                  </div>
                </form>
              </>
            ) : (
              /* Success / Action Instruction Step */
              <div className="text-center py-1">
                <div className="w-14 h-14 bg-[#FEF5EE] border-2 border-[#D96B27] rounded-full flex items-center justify-center mx-auto mb-3.5 shadow-sm text-[#D96B27]">
                  <CheckCircle2 size={32} />
                </div>

                <span className="inline-flex items-center gap-1 bg-[#FDF2E9] text-[#A33D12] border border-[#F5D6C1] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 font-manrope">
                  <Sparkles size={12} className="text-[#D96B27]" />
                  МІСЦЕ ЗАБРОНЬОВАНО
                </span>

                <h3 className="font-playfair text-xl sm:text-2xl font-bold text-[#231815] mb-2 leading-tight">
                  Останній крок до отримання доступу!
                </h3>

                <p className="font-manrope text-xs sm:text-sm text-[#231815]/80 mb-6 leading-relaxed">
                  Щоб отримати всі матеріали та посилання на уроки, натисни кнопку нижче та надішли слово{" "}
                  <strong className="text-[#A33D12] font-black bg-[#FEF5EE] px-1.5 py-0.5 rounded border border-[#F5D6C1]">
                    «ДОСТУП»
                  </strong>{" "}
                  у Telegram:
                </p>

                {/* Big Direct Button to Telegram */}
                <a
                  href="https://t.me/vika_cooperation?text=%D0%94%D0%9E%D0%A1%D0%A2%D0%A3%D0%9F"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#D96B27] via-[#C85A17] to-[#9E380E] hover:from-[#C85A17] hover:to-[#882F0B] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider py-4 px-6 rounded-xl shadow-[0_10px_28px_rgba(200,90,23,0.35)] hover:shadow-[0_14px_34px_rgba(200,90,23,0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 cursor-pointer"
                >
                  <Send size={16} />
                  <span>Написати «ДОСТУП» у Telegram</span>
                  <ArrowRight size={16} />
                </a>

                <p className="text-[11px] text-[#231815]/65 font-manrope mt-4 leading-relaxed">
                  * Натисни на кнопку — діалог з <strong className="text-[#231815]">@vika_cooperation</strong> відкриється автоматично з готовим словом «ДОСТУП»
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
