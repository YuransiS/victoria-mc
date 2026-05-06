"use client";

import React from "react";
import styles from "./PracticumFormat.module.css";
import { motion } from "framer-motion";

export function PracticumFormat() {
  const formats = [
    {
      title: "Відео та аудіо уроки",
      desc: "Покрокові уроки та завдання, які ви будете виконувати разом з Вікою.\n\n(з прикладами)",
      icon: "📱",
    },
    {
      title: "Живий фідбек",
      desc: "Закритий чат, де учасники публікують свої сторіз — Віка дає розбори та поради.",
      icon: "💬",
    },
    {
      title: "Бонусний ефір: система створення каруселей",
      desc: "Ефір з розборами блогів учасників практикуму для глибокого розуміння помилок.",
      icon: "✨",
      isBonus: true,
    },
  ];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className={styles.formatBox}
        >
          <div className={styles.label}>ФОРМАТ ПРАКТИКУМУ</div>
          <h2 className={styles.title}>7 ДНІВ ІНТЕНСИВНОЇ ПРАКТИКИ</h2>
          
          <div className={styles.grid}>
            {formats.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`${styles.card} ${f.isBonus ? styles.bonusCard : ""}`}
              >
                <div className={styles.icon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className={styles.platform}>
            <span>ПЛАТФОРМА: <b>ТЕЛЕГРАМ-ГРУППА + ДОСТУП НАЗАВЖДИ</b></span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
