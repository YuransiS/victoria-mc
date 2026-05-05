"use client";

import React, { useState, useEffect } from "react";
import styles from "./PracticumHeroForm.module.css";
import { Input } from "@/components/Input";
import { motion, AnimatePresence } from "framer-motion";

interface PracticumHeroFormProps {
  buttonText?: string;
  tariffName: string;
  amount: number;
}

export function PracticumHeroForm({ 
  buttonText = "ВЗЯТИ УЧАСТЬ", 
  tariffName, 
  amount 
}: PracticumHeroFormProps) {
  const [formData, setFormData] = useState({ name: "", phone: "", telegram: "" });
  const [errors, setErrors] = useState<{ name?: string; phone?: string; telegram?: string }>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  const [activeUsers, setActiveUsers] = useState(7);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return newValue < 5 ? 5 : newValue > 12 ? 12 : newValue;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    let valid = true;
    const newErrors: any = {};

    if (formData.name.trim().length < 2) {
      newErrors.name = "Введіть ваше ім'я";
      valid = false;
    }

    if (!formData.telegram.trim()) {
      newErrors.telegram = "Введіть ваш Telegram";
      valid = false;
    }

    const phoneRegex = /^\+?\d{7,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Введіть номер телефону";
      valid = false;
    } else if (!phoneRegex.test(formData.phone.replace(/[\s()-]/g, ""))) {
      newErrors.phone = "Некоректний номер";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");

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
      customerEmail: `${formData.telegram.replace("@", "")}@telegram.com`,
      customerPhone: sanitizedPhone,
      telegram: formData.telegram,
      amount: amount,
      tariffName: tariffName
    };

    try {
      // 1. Create Payment
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          successUrl: "/practicum/thanks",
          failUrl: "/practicum/fail"
        })
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        alert("Помилка при створенні платежу. Спробуйте пізніше.");
        setStatus("idle");
        return;
      }

      // 2. Track Lead
      fetch('/api/leads', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: formData.name,
          phone: sanitizedPhone,
          tariff: tariffName,
          amount: amount,
          order_id: paymentData.orderReference,
          target_sheet_id: "1127634999", 
          target_sheet_name: "Практикум",
          ...utmData
        }),
      }).catch(e => console.error("Lead log error:", e));

      sessionStorage.setItem('paymentAttempted', 'true');
      sessionStorage.setItem('lastOrderId', paymentData.orderReference);

      // 3. Prepare Form and Submit
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
      setStatus("idle");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.liveCounter}>
          <span className={styles.liveDot}></span>
          <span>зараз дивляться: {activeUsers} людей</span>
        </div>
        
        <div className={styles.inputGrid}>
          <Input 
            label="ВАШЕ ІМ'Я" 
            name="name" 
            placeholder="Ім'я" 
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            disabled={status !== "idle"}
          />
          <Input 
            label="TELEGRAM" 
            name="telegram" 
            placeholder="@username" 
            value={formData.telegram}
            onChange={handleChange}
            error={errors.telegram}
            disabled={status !== "idle"}
          />
        </div>
        
        <Input 
          label="НОМЕР ТЕЛЕФОНУ" 
          name="phone" 
          type="tel" 
          placeholder="+380..." 
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          disabled={status !== "idle"}
        />

        <button 
          type="submit" 
          className={styles.submitBtn}
          disabled={status !== "idle"}
        >
          {status === "loading" ? "ВІДПРАВКА..." : buttonText}
        </button>

        <p className={styles.secureText}>
          🔐 Безпечна оплата через WayForPay
        </p>
      </form>
    </div>
  );
}
