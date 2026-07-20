"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import styles from "./SharedBlocks.module.css";
import { ShieldCheck, HelpCircle } from "lucide-react";

export function BlockGuarantee() {
  const [price, setPrice] = useState(149);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const pParam = searchParams.get("p");
    if (pParam === "49") setPrice(49);
    else if (pParam === "89") setPrice(89);
    else if (pParam === "149") setPrice(149);
    else setPrice(149);
  }, []);

  return (
    <section className={styles.section} style={{ paddingBottom: "2rem" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "3rem",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* Why low price section */}
        <motion.div 
          style={{
            background: "rgba(26, 26, 28, 0.4)",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
            padding: "2.5rem 2rem",
            boxShadow: "6px 6px 0px rgba(0, 0, 0, 0.2)"
          }}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <HelpCircle size={28} style={{ color: "var(--accent-color)" }} />
            <h3 style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 900,
              fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              margin: 0
            }}>
              Чому така низька ціна? 🤔
            </h3>
          </div>
          
          <div style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <p>
              Цінність цього майстер-класу набагато вища. Тому що мені важливо, щоб якомога більше експертів перестали витрачати години на контент без результату.
            </p>
            <p>
              Якщо після цього майстер-класу ти почнеш створювати контент за моєю системою, то зекономиш десятки годин і зможеш отримати перші заявки набагато швидше.
            </p>
            <p style={{
              fontWeight: 800,
              fontSize: "1.1rem",
              color: "var(--accent-color)",
              marginTop: "0.5rem"
            }}>
              Але зараз ти можеш забрати його всього за {price} грн 💛
            </p>
          </div>
        </motion.div>

        {/* Guarantee section */}
        <motion.div 
          style={{
            background: "rgba(26, 26, 28, 0.6)",
            border: "1.5px solid var(--accent-color)",
            padding: "2.5rem 2rem",
            boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.3)",
            position: "relative"
          }}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginBottom: "1.5rem" }}>
            <ShieldCheck size={30} style={{ color: "var(--accent-color)" }} />
            <h3 style={{
              fontFamily: "var(--font-inter)",
              fontWeight: 900,
              fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
              color: "#ffffff",
              textTransform: "uppercase",
              margin: 0
            }}>
              Даю гарантію
            </h3>
          </div>
          
          <p style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "1.05rem",
            lineHeight: 1.6,
            color: "#ffffff",
            fontWeight: 500,
            margin: 0
          }}>
            Якщо тобі не сподобається майстер-клас і ти не отримаєш з нього нічого корисного, жодного інсайту — то я поверну тобі гроші.
          </p>
        </motion.div>

        {/* Still have doubts section */}
        <motion.div 
          style={{
            background: "rgba(26, 26, 28, 0.4)",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
            padding: "2.5rem 2rem",
            boxShadow: "6px 6px 0px rgba(0, 0, 0, 0.2)"
          }}
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h3 style={{
            fontFamily: "var(--font-inter)",
            fontWeight: 900,
            fontSize: "clamp(1.3rem, 3vw, 1.7rem)",
            color: "#ffffff",
            textTransform: "uppercase",
            marginBottom: "1.5rem"
          }}>
            Все ще є сумніви?
          </h3>
          
          <div style={{
            fontFamily: "var(--font-manrope)",
            fontSize: "1rem",
            lineHeight: 1.6,
            color: "rgba(255, 255, 255, 0.9)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem"
          }}>
            <p>
              Ціна майстер-класу всього <strong style={{ color: "var(--accent-color)" }}>{price} грн</strong>.
            </p>
            <p>
              За цю ціну ти отримуєш інструменти, за допомогою яких зможеш розвинути свій блог та залучати нових клієнтів.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
