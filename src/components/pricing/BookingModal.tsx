"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tariffName: string;
  amount: number;
}

interface FormErrors {
  name?: string;
  phone?: string;
  telegram?: string;
}

export const BookingModal = ({ isOpen, onClose, tariffName, amount }: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    telegram: ""
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      // Reset form when opening
      setFormData({ name: "", phone: "", telegram: "" });
      setErrors({});
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
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

    // Phone validation: Basic format
    const phoneRegex = /^\+?3?8?(0\d{9})$/;
    if (!formData.phone) {
      newErrors.phone = "Будь ласка, введіть номер телефону";
    } else if (!phoneRegex.test(formData.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Невірний формат номера (+380...)";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);

    const data = {
      customerName: formData.name,
      customerEmail: `${formData.telegram.replace("@", "")}@telegram.com`, // Fallback for API
      customerPhone: formData.phone,
      telegram: formData.telegram,
      amount: amount,
      tariffName: tariffName
    };

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setIsSubmitting(false);
        return;
      }

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
        } else {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value ? value.toString() : '';
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

  if (!isOpen) return null;

  const shakeAnimation = {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-[#121212]/80 backdrop-blur-xl p-8 sm:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-none border border-white/5"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#9e9e9e] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
        </button>

        <h3 className="font-manrope text-2xl text-white font-bold mb-2 uppercase tracking-wide">
          Оформлення броні
        </h3>
        <p className="font-inter text-[#9e9e9e] text-sm mb-10">
          Зафіксуйте місце за спеціальною ціною. Сума: {amount} грн
        </p>

        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Input: Name */}
          <motion.div 
            animate={errors.name ? shakeAnimation : {}}
            className="relative flex flex-col"
          >
            <label htmlFor="name" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Ім{`'`}я
            </label>
            <input 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              type="text" 
              id="name"
              className={`w-full bg-transparent border-0 border-b ${errors.name ? 'border-red-500' : 'border-[#333333]'} py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0`}
              placeholder="Ваше ім'я"
            />
            <AnimatePresence>
              {errors.name && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-[10px] uppercase mt-1 font-bold tracking-tighter"
                >
                  {errors.name}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Input: Telegram */}
          <motion.div 
            animate={errors.telegram ? shakeAnimation : {}}
            className="relative flex flex-col"
          >
            <label htmlFor="telegram" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Нік у Telegram
            </label>
            <input 
              value={formData.telegram}
              onChange={(e) => setFormData({...formData, telegram: e.target.value})}
              type="text" 
              id="telegram"
              className={`w-full bg-transparent border-0 border-b ${errors.telegram ? 'border-red-500' : 'border-[#333333]'} py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0`}
              placeholder="@username"
            />
            <AnimatePresence>
              {errors.telegram && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-[10px] uppercase mt-1 font-bold tracking-tighter"
                >
                  {errors.telegram}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Input: Phone */}
          <motion.div 
            animate={errors.phone ? shakeAnimation : {}}
            className="relative flex flex-col"
          >
            <label htmlFor="phone" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Телефон
            </label>
            <input 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              type="tel" 
              id="phone"
              className={`w-full bg-transparent border-0 border-b ${errors.phone ? 'border-red-500' : 'border-[#333333]'} py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0`}
              placeholder="+380"
            />
            <AnimatePresence>
              {errors.phone && (
                <motion.span 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-500 text-[10px] uppercase mt-1 font-bold tracking-tighter"
                >
                  {errors.phone}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>

          <button
            disabled={isSubmitting}
            type="submit"
            className="w-full bg-[#c6c6c7] text-black font-inter font-semibold py-4 mt-4 uppercase tracking-wide hover:bg-white transition-colors duration-300 shadow-[0_40px_60px_rgba(198,198,199,0.08)] disabled:opacity-50"
          >
            {isSubmitting ? "Створюємо платіж..." : `Сплатити бронь ${amount} грн`}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
