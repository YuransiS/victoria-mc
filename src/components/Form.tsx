"use client";

import React, { useState } from "react";
import styles from "./Form.module.css";
import { Input } from "./Input";
import { Button } from "./Button";

export const Form: React.FC = () => {
  const [formData, setFormData] = useState({ name: "", phone: "", telegram: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      setStatus("error");
      setMessage("Будь ласка, заповніть ім'я та номер телефону.");
      return;
    }

    setStatus("loading");
    setMessage("");

    const scriptUrl = process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;

    if (!scriptUrl) {
      setStatus("error");
      setMessage("Помилка конфігурації. Спробуйте пізніше.");
      return;
    }

    try {
      await fetch(scriptUrl, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      setStatus("success");
      setMessage("Дякуємо! Ваша заявка прийнята.");
      setFormData({ name: "", phone: "", telegram: "" });
    } catch (error) {
      setStatus("error");
      setMessage("Не вдалося відправити. Перевірте з'єднання.");
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <Input 
          label="Ім'я та прізвище" 
          name="name" 
          type="text" 
          placeholder="Введіть ваше ім'я" 
          value={formData.name}
          onChange={handleChange}
          required
        />
        <Input 
          label="Номер телефону" 
          name="phone" 
          type="tel" 
          placeholder="+380 99 452 34 44" 
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <Input 
          label="Telegram (за бажанням)" 
          name="telegram" 
          type="text" 
          placeholder="@username" 
          value={formData.telegram}
          onChange={handleChange}
        />
        <Button 
          type="submit" 
          variant="primary" 
          className={styles.submitBtn}
          disabled={status === "loading"}
          style={{ width: "100%" }}
        >
          {status === "loading" ? "ВІДПРАВКА..." : "ЗАРЕЄСТРУВАТИСЯ ЗАРАЗ"}
        </Button>
      </form>
      {message && (
        <p className={`${styles.message} ${status === "success" ? styles.success : styles.error}`}>
          {message}
        </p>
      )}
    </div>
  );
};
