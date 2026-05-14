"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { trackFBEvent } from "@/components/FacebookPixel";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName: string;
  amount: number;
  currency?: string;
  currencySymbol?: string;
  targetSheetName?: string;
  successUrl?: string;
  failUrl?: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  telegram?: string;
}

export const BookingModal = ({ 
  isOpen, 
  onClose, 
  tariffName, 
  amount,
  currency = "UAH",
  currencySymbol = "ГРН",
  targetSheetName,
  successUrl,
  failUrl
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    telegram: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isTestMode, setIsTestMode] = useState(false);

  // Restore data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');
    
    if (savedName || savedPhone || savedSocial) {
      setFormData(prev => ({
        ...prev,
        name: savedName || prev.name,
        phone: savedPhone || prev.phone,
        telegram: savedSocial || prev.telegram
      }));
    }

    // Auto-open if coming from a retry
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('retry') === 'payment' && !isOpen) {
      // Logic for retry can be handled by parent
    }
  }, []);

  // Sync data to localStorage
  useEffect(() => {
    if (formData.name) localStorage.setItem('lead_name', formData.name);
    if (formData.phone) localStorage.setItem('lead_phone', formData.phone);
    if (formData.telegram) localStorage.setItem('lead_social', formData.telegram);
    
    // Also save context for retry logic
    if (tariffName) {
      sessionStorage.setItem('lastTariffName', tariffName);
      sessionStorage.setItem('lastAmount', amount.toString());
    }
  }, [formData, tariffName, amount]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.body.setAttribute("data-modal-open", "true");
      setIsTestMode(false);
      trackFBEvent("InitiateCheckout", { 
        content_name: tariffName, 
        value: amount, 
        currency: currency 
      });
    } else {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-modal-open");
    }
    return () => {
      document.body.style.overflow = "unset";
      document.body.removeAttribute("data-modal-open");
    };
  }, [isOpen]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Name validation: No digits
    if (!formData.name) {
      newErrors.name = "Будь ласка, введіть ім'я";
    } else if (/\d/.test(formData.name)) {
      newErrors.name = "Ім'я не може містити цифри";
    }

    // Phone validation: Relaxed for international numbers
    const phoneRegex = /^\+?\d{5,20}$/;
    if (!formData.phone) {
      newErrors.phone = "Будь ласка, введіть номер телефону";
    } else if (!phoneRegex.test(formData.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Введіть коректний номер телефону";
    }

    // Telegram validation: Min 3 chars
    if (!formData.telegram) {
      newErrors.telegram = "Будь ласка, введіть нік у Telegram";
    } else {
      const tgNick = formData.telegram.replace("@", "");
      if (tgNick.length < 3) {
        newErrors.telegram = "Нік у Telegram має бути не менше 3 символів";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const actualAmount = isTestMode ? 1 : amount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const sanitizedPhone = formData.phone.replace(/[\s()-]/g, "");
    
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
      customerEmail: `${formData.telegram.replace("@", "")}@telegram.com`, // Fallback
      customerPhone: sanitizedPhone,
      telegram: formData.telegram,
      amount: actualAmount,
      tariffName: tariffName
    };

    try {
      // 1. Create Payment first to get the Order ID and UUID
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          ...utmData,
          currency: isTestMode ? "UAH" : currency,
          amount: isTestMode ? 1 : actualAmount,
          targetSheet: targetSheetName || "Бронювання",
          successUrl,
          failUrl
        })
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

      // Save user identification for cross-page persistence
      localStorage.setItem('lead_name', formData.name);
      localStorage.setItem('lead_phone', sanitizedPhone);
      localStorage.setItem('lead_social', formData.telegram);
      
      // CRITICAL: Save TG Message ID to local storage for Thanks page
      if (paymentData.tgMsgId) {
        console.log('DEBUG: Storing TG Msg ID from Modal:', paymentData.tgMsgId);
        const tgData = {
          id: paymentData.tgMsgId.toString(),
          timestamp: Date.now()
        };
        localStorage.setItem('tg_msg_id_data', JSON.stringify(tgData));
      }

      if (paymentData.uuid) {
        localStorage.setItem('lead_uuid', paymentData.uuid);
      }
      
      // 2. Track Lead to Facebook
      trackFBEvent("Lead", { 
        content_name: tariffName, 
        value: actualAmount, 
        currency: currency,
        ...utmData
      });

      // Set flags for Thanks page logic
      sessionStorage.setItem('paymentAttempted', 'true');
      sessionStorage.setItem('lastOrderId', paymentData.orderReference);

      // 3. Prepare WayForPay Form
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
      form.submit();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Відбулася помилка. Перевірте з'єднання з інтернетом.");
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => document.body.classList.remove('modal-open');
  }, [isOpen]);

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 pointer-events-none">
        <motion.div 
          key="booking-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="pointer-events-auto relative w-full max-w-md bg-[#181818] p-8 sm:p-14 shadow-[0_60px_100px_rgba(0,0,0,0.9)] border border-white/5"
        >
        {/* Decorative background element */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-8 sm:right-8 text-[#666] hover:text-white transition-colors p-4 z-[110]"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <div className="relative z-10">
          <h3 
            onClick={(e) => {
              if (e.detail === 3) {
                setIsTestMode(true);
              }
            }}
            className="font-manrope text-3xl text-white font-black mb-2 uppercase tracking-tight italic cursor-default select-none"
          >
            ОПЛАТИТИ УЧАСТЬ {isTestMode && <span className="text-red-500 text-xs">(TEST)</span>}
          </h3>
          <div className="flex flex-col gap-1 mb-10">
            <p className="font-inter text-[#888] text-[10px] uppercase tracking-widest font-bold">
              ТАРИФ: <span className="text-white">{tariffName}</span>
            </p>
            <p className="font-inter text-[#888] text-[10px] uppercase tracking-widest font-bold">
              СУМА УЧАСТІ: <span className={isTestMode ? "text-red-500 animate-pulse" : "text-white"}>{actualAmount} {currencySymbol}</span>
            </p>
          </div>

          <form className="space-y-10" onSubmit={handleSubmit}>
            {/* Input: Name */}
            <motion.div 
              animate={errors.name ? shakeAnimation : {}}
              className="relative flex flex-col group"
            >
              <label htmlFor="name" className="font-inter text-[10px] text-[#666] mb-2 uppercase tracking-[0.2em] font-bold group-focus-within:text-white transition-colors">
                Ваше ім{`'`}я
              </label>
              <input 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                type="text" 
                id="name"
                disabled={isSubmitting}
                autoComplete="name"
                className={`w-full bg-transparent border-0 border-b ${errors.name ? 'border-red-500' : 'border-white/10'} py-3 text-white font-inter text-lg focus:ring-0 focus:border-white focus:outline-none transition-all rounded-none px-0 placeholder:text-[#333]`}
                placeholder="Введіть ім'я"
              />
              <AnimatePresence>
                {errors.name && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-[9px] uppercase mt-2 font-bold tracking-widest"
                  >
                    {errors.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Input: Telegram */}
            <motion.div 
              animate={errors.telegram ? shakeAnimation : {}}
              className="relative flex flex-col group"
            >
              <label htmlFor="telegram" className="font-inter text-[10px] text-[#666] mb-2 uppercase tracking-[0.2em] font-bold group-focus-within:text-white transition-colors">
                Telegram @username
              </label>
              <input 
                value={formData.telegram}
                onChange={(e) => setFormData({...formData, telegram: e.target.value})}
                type="text" 
                id="telegram"
                disabled={isSubmitting}
                autoComplete="off"
                autoCapitalize="none"
                className={`w-full bg-transparent border-0 border-b ${errors.telegram ? 'border-red-500' : 'border-white/10'} py-3 text-white font-inter text-lg focus:ring-0 focus:border-white focus:outline-none transition-all rounded-none px-0 placeholder:text-[#333]`}
                placeholder="@username"
              />
              <AnimatePresence>
                {errors.telegram && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-[9px] uppercase mt-2 font-bold tracking-widest"
                  >
                    {errors.telegram}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Input: Phone */}
            <motion.div 
              animate={errors.phone ? shakeAnimation : {}}
              className="relative flex flex-col group"
            >
              <label htmlFor="phone" className="font-inter text-[10px] text-[#666] mb-1 uppercase tracking-[0.2em] font-bold group-focus-within:text-white transition-colors">
                Номер телефону
              </label>
              <p className="text-[9px] text-[#444] uppercase tracking-wider mb-2 leading-relaxed">
                Перепроверьте номер. Якщо він буде невірним, ми не зможемо з вами зв{`'`}язатися
              </p>
              <input 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                type="tel" 
                id="phone"
                disabled={isSubmitting}
                autoComplete="tel"
                inputMode="tel"
                className={`w-full bg-transparent border-0 border-b ${errors.phone ? 'border-red-500' : 'border-white/10'} py-3 text-white font-inter text-lg focus:ring-0 focus:border-white focus:outline-none transition-all rounded-none px-0 placeholder:text-[#333]`}
                placeholder="+"
              />
              <AnimatePresence>
                {errors.phone && (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-red-500 text-[9px] uppercase mt-2 font-bold tracking-widest"
                  >
                    {errors.phone}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="pt-6">
              <button
                disabled={isSubmitting}
                type="submit"
                className="group relative w-full bg-white text-black font-manrope font-black py-6 mt-4 uppercase tracking-[0.15em] hover:bg-white/90 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-center"
              >
                <span className={isSubmitting ? "opacity-0" : "opacity-100"}>
                  Оплатити участь {actualAmount} {currencySymbol.toLowerCase()}
                </span>
                
                {isSubmitting && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  </div>
                )}
              </button>
              
              <p className="text-[10px] text-[#444] text-center mt-6 uppercase tracking-widest leading-relaxed">
                Натискаючи на кнопку, ви погоджуєтесь з<br />
                <a href="#" className="underline hover:text-[#666]">умовами оферти</a> та <a href="#" className="underline hover:text-[#666]">політикою конфіденційності</a>
              </p>
            </div>
          </form>
        </div>

        <AnimatePresence>
          {isSubmitting && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center pointer-events-none"
            >
              {/* Optional: Add a more complex loader or text here */}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );
};
