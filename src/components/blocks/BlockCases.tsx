"use client";

import React from "react";
import { motion } from "framer-motion";
import styles from "./SharedBlocks.module.css";

const casesData = [
  { name: 'Мар’яна', niche: 'Вчителька танців', id: '01', before: '/rozbir/do1.jpg', after: '/rozbir/bo1.jpg' },
  { name: 'Бізнес', niche: 'Будівництво басейнів', id: '02', before: '/rozbir/do2.jpg', after: '/rozbir/bo2.jpg' },
  { name: 'Аня', niche: 'Дизайнер одягу', id: '03', before: '/rozbir/do3.jpg', after: '/rozbir/bo3.jpg' },
  { name: 'Аня', niche: 'Вчителька української', id: '04', before: '/rozbir/do1.jpg', after: '/rozbir/bo4.jpg' },
  { name: 'Катя', niche: 'Лайфстайл блог', id: '05', before: '/rozbir/do2.jpg', after: '/rozbir/bo1.jpg' },
  { name: 'Аліса', niche: 'Стилістка', id: '06', before: '/rozbir/do3.jpg', after: '/rozbir/bo2.jpg' },
];

export function BlockCases() {
  return (
    <section className={styles.section} style={{ paddingBottom: "2rem" }}>
      <motion.div 
        className={styles.sectionHeader}
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
      >
        <p style={{
          fontFamily: "var(--font-manrope)",
          fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
          fontWeight: 800,
          color: "rgba(255, 255, 255, 0.4)",
          textTransform: "uppercase",
          letterSpacing: "0.25em",
          marginBottom: "0.5rem",
          textAlign: "center"
        }}>
          Приклади трансформації
        </p>
        <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "2rem" }}>
          Ось як змінюється твій візуал і контент після розбору
        </h2>
        <div style={{ width: "60px", height: "1.5px", background: "var(--accent-color)", margin: "0 auto 3rem" }}></div>
      </motion.div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "3rem",
        width: "100%"
      }}>
        {/* Responsive Grid wrapper */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2.5rem"
        }}>
          {casesData.map((client, idx) => (
            <motion.div 
              key={idx}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                background: "rgba(26, 26, 28, 0.6)",
                border: "1.5px solid rgba(255, 255, 255, 0.1)",
                padding: "1.5rem",
                boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.3)"
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.05 }}
            >
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                paddingBottom: "0.75rem",
                width: "100%"
              }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontFamily: "var(--font-inter)",
                    fontWeight: 900,
                    fontSize: "1.3rem",
                    color: "#ffffff",
                    margin: 0
                  }}>{client.name}</h3>
                  <p style={{
                    fontFamily: "var(--font-manrope)",
                    fontSize: "0.7rem",
                    color: "rgba(255, 255, 255, 0.4)",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontWeight: 700,
                    margin: "0.2rem 0 0 0"
                  }}>{client.niche}</p>
                </div>
                <span style={{
                  fontFamily: "var(--font-newsreader)",
                  fontStyle: "italic",
                  fontSize: "1.8rem",
                  color: "var(--accent-color)",
                  opacity: 0.8,
                  lineHeight: 1
                }}>{client.id}</span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem"
              }}>
                {/* Before Image */}
                <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
                  <img 
                    src={client.before} 
                    alt={`До - ${client.name}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "grayscale(20%)"
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "0.5rem",
                    left: "0.5rem",
                    background: "rgba(255, 255, 255, 0.95)",
                    padding: "0.2rem 0.5rem",
                    border: "1px solid #000"
                  }}>
                    <p style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "#000000",
                      letterSpacing: "0.1em",
                      margin: 0
                    }}>До</p>
                  </div>
                </div>

                {/* After Image */}
                <div style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4" }}>
                  <img 
                    src={client.after} 
                    alt={`Після - ${client.name}`}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                  <div style={{
                    position: "absolute",
                    top: "0.5rem",
                    left: "0.5rem",
                    background: "var(--accent-color)",
                    padding: "0.2rem 0.5rem",
                    border: "1px solid #000"
                  }}>
                    <p style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.55rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      color: "#000000",
                      letterSpacing: "0.1em",
                      margin: 0
                    }}>Після</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
