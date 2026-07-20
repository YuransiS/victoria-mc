"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./SharedBlocks.module.css";
import { Gift, Clock } from "lucide-react";
import { getDynamicPriceState } from "@/lib/dynamicPrice";

export function BlockBonusTimer() {
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const updateTimer = () => {
      const state = getDynamicPriceState();
      // Ensure the bonus timer shows the active phase countdown time
      setTimeLeft(state.timeLeft);
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <section className={styles.section} style={{ paddingBottom: "2rem" }}>
      {/* 7-DAY RECORDING HIGHLIGHT BANNER */}
      <motion.div
        style={{
          width: "100%",
          maxWidth: "600px",
          margin: "0 auto 2.5rem",
          background: "rgba(255, 245, 0, 0.08)",
          border: "1.5px solid var(--accent-color)",
          padding: "1rem 1.5rem",
          textAlign: "center",
          boxShadow: "0 4px 20px rgba(255, 245, 0, 0.05)"
        }}
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span style={{
          fontFamily: "var(--font-manrope)",
          fontSize: "0.85rem",
          fontWeight: 800,
          color: "#ffffff",
          letterSpacing: "0.05em"
        }}>
          🔥 УСІ УЧАСНИКИ ОТРИМАЮТЬ ЗАПИС МАЙСТЕР-КЛАСУ НА 7 ДНІВ
        </span>
      </motion.div>

      <motion.div 
        className={styles.sectionHeader}
        style={{ width: "100%", maxWidth: "800px", margin: "0 auto", textAlign: "center" }}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p style={{
          fontFamily: "var(--font-manrope)",
          fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
          fontWeight: 800,
          color: "var(--accent-color)",
          textTransform: "uppercase",
          letterSpacing: "0.25em",
          marginBottom: "0.5rem"
        }}>
          Унікальна пропозиція
        </p>
        <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          Твій бонус, якщо зареєструєшся сьогодні 🎁
        </h2>
        
        {/* TIMER ROW */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.75rem",
          background: "rgba(255, 245, 0, 0.08)",
          border: "1.5px solid var(--accent-color)",
          padding: "0.8rem 1.5rem",
          margin: "0.5rem auto 3rem",
          width: "fit-content"
        }}>
          <Clock size={18} style={{ color: "var(--accent-color)" }} />
          <span style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "0.85rem",
            fontWeight: 800,
            letterSpacing: "0.05em",
            color: "#ffffff"
          }}>
            БОНУСИ ЗНИКНУТЬ ЧЕРЕЗ: <span style={{ color: "var(--accent-color)" }}>{formatTime(timeLeft)}</span>
          </span>
        </div>
      </motion.div>

      {/* BONUSES LAYOUT */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "2.5rem",
        width: "100%"
      }}>
        {/* Row 1 - Bonus 1 */}
        <motion.div
          style={{
            background: "rgba(26, 26, 28, 0.6)",
            border: "1.5px solid rgba(255, 255, 255, 0.15)",
            padding: "2.5rem 2rem",
            boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.3)",
            position: "relative"
          }}
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            position: "absolute",
            top: "-1.2rem",
            left: "2rem",
            background: "var(--accent-color)",
            color: "var(--accent-text-color)",
            fontFamily: "var(--font-manrope)",
            fontSize: "0.65rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "0.5rem 1rem",
            border: "1.5px solid #000"
          }}>
            БОНУС №1
          </div>

          <h3 style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 900,
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            color: "#ffffff",
            marginTop: "0.5rem",
            marginBottom: "1rem",
            textTransform: "uppercase",
            lineHeight: 1.2
          }}>
            Урок: «Система контенту, яка економить мені десятки годин щомісяця»
          </h3>

          <p style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "0.95rem",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.6,
            marginBottom: "1.5rem"
          }}>
            Я покажу весь процес, завдяки якому регулярно веду блог навіть під час відпустки.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <p style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--accent-color)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.75rem"
            }}>
              Ви побачите:
            </p>
            <ul style={{
              listStyleType: "none",
              paddingLeft: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              {[
                "як я планую контент",
                "звідки беру теми",
                "як оформлюю каруселі",
                "як записую Reels",
                "як один матеріал використовую одразу в кількох соцмережах",
                "як не витрачати на блог увесь свій вільний час"
              ].map((bullet, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontFamily: "var(--font-manrope)",
                  fontSize: "0.9rem",
                  color: "rgba(255, 255, 255, 0.9)"
                }}>
                  <span style={{ color: "var(--accent-color)" }}>—</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <p style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "0.9rem",
            fontStyle: "italic",
            color: "rgba(255, 255, 255, 0.6)",
            lineHeight: 1.5,
            borderLeft: "2px solid rgba(255, 255, 255, 0.2)",
            paddingLeft: "1rem",
            marginBottom: "2rem"
          }}>
            Це не урок про монтаж чи Canva. Це система, яка дозволяє створювати контент швидше, без хаосу і постійного питання: «Що сьогодні викласти?»
          </p>

          <div style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "1.5rem"
          }}>
            <span style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "0.85rem",
              textDecoration: "line-through",
              color: "rgba(255, 255, 255, 0.4)"
            }}>
              Звичайна ціна: 49 євро
            </span>
            <span style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--accent-color)",
              textTransform: "uppercase"
            }}>
              Ціна зараз: 0 євро
            </span>
          </div>
        </motion.div>

        {/* Row 2 - Bonus 2 */}
        <motion.div
          style={{
            background: "rgba(26, 26, 28, 0.6)",
            border: "1.5px solid rgba(255, 255, 255, 0.15)",
            padding: "2.5rem 2rem",
            boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.3)",
            position: "relative"
          }}
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div style={{
            position: "absolute",
            top: "-1.2rem",
            left: "2rem",
            background: "var(--accent-color)",
            color: "var(--accent-text-color)",
            fontFamily: "var(--font-manrope)",
            fontSize: "0.65rem",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            padding: "0.5rem 1rem",
            border: "1.5px solid #000"
          }}>
            БОНУС №2
          </div>

          <h3 style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 900,
            fontSize: "clamp(1.2rem, 3vw, 1.6rem)",
            color: "#ffffff",
            marginTop: "0.5rem",
            marginBottom: "1rem",
            textTransform: "uppercase",
            lineHeight: 1.2
          }}>
            Запис живих розборів блогів
          </h3>

          <p style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "0.95rem",
            color: "rgba(255, 255, 255, 0.8)",
            lineHeight: 1.6,
            marginBottom: "1.5rem"
          }}>
            Це можливість побачити реальний розбір експертного блогу - від позиціонування до контенту, візуалу та упаковки. А також як я думаю, коли аналізую блог, знаходжу точки росту та показую, що саме заважає отримувати більше клієнтів.
          </p>

          <div style={{ marginBottom: "2rem" }}>
            <p style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "var(--accent-color)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "0.75rem"
            }}>
              Розібрали:
            </p>
            <ul style={{
              listStyleType: "none",
              paddingLeft: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem"
            }}>
              {[
                "позиціонування",
                "упаковку профілю",
                "контент, який продає",
                "візуал",
                "систему, завдяки якій блог починає працювати на вас"
              ].map((bullet, i) => (
                <li key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                  fontFamily: "var(--font-manrope)",
                  fontSize: "0.9rem",
                  color: "rgba(255, 255, 255, 0.9)"
                }}>
                  <span style={{ color: "var(--accent-color)" }}>—</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: "1.5rem"
          }}>
            <span style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "0.85rem",
              textDecoration: "line-through",
              color: "rgba(255, 255, 255, 0.4)"
            }}>
              Звичайна ціна: 39 євро
            </span>
            <span style={{
              fontFamily: "var(--font-manrope)",
              fontSize: "1rem",
              fontWeight: 800,
              color: "var(--accent-color)",
              textTransform: "uppercase"
            }}>
              Ціна зараз: 0 євро
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
