"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SharedBlocks.module.css";
import { REAL_CASES } from "@/data/cases";
import { ZoomIn, X, MessageSquare } from "lucide-react";

export function BlockCases() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className={styles.section} style={{ paddingBottom: "3rem" }}>
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
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "2.5rem"
        }}>
          {REAL_CASES.map((client, idx) => (
            <motion.div 
              key={client.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                background: "rgba(26, 26, 28, 0.7)",
                border: "1.5px solid rgba(255, 255, 255, 0.12)",
                padding: "1.75rem",
                boxShadow: "8px 8px 0px rgba(0, 0, 0, 0.3)",
                justifyContent: "space-between"
              }}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
            >
              <div>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingBottom: "0.75rem",
                  width: "100%",
                  marginBottom: "1rem"
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: "var(--font-inter)",
                      fontWeight: 900,
                      fontSize: "1.4rem",
                      color: "#ffffff",
                      margin: 0
                    }}>{client.name}</h3>
                    <p style={{
                      fontFamily: "var(--font-manrope)",
                      fontSize: "0.75rem",
                      color: "var(--accent-color)",
                      textTransform: "uppercase",
                      letterSpacing: "0.15em",
                      fontWeight: 700,
                      margin: "0.25rem 0 0 0"
                    }}>{client.niche}</p>
                  </div>
                  <span style={{
                    fontFamily: "var(--font-newsreader)",
                    fontStyle: "italic",
                    fontSize: "1.8rem",
                    color: "var(--accent-color)",
                    opacity: 0.8,
                    lineHeight: 1
                  }}>#{client.id}</span>
                </div>

                {/* Before / After Images */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem"
                }}>
                  {/* Before Image */}
                  <div 
                    style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", cursor: "pointer" }}
                    onClick={() => setActiveImage(client.beforeImg)}
                  >
                    <img 
                      src={client.beforeImg} 
                      alt={`До - ${client.name}`}
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        filter: "grayscale(15%)"
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
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.3)",
                      opacity: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "opacity 0.2s"
                    }} className="img-hover">
                      <ZoomIn style={{ color: "#fff", width: 20, height: 20 }} />
                    </div>
                  </div>

                  {/* After Image */}
                  <div 
                    style={{ position: "relative", overflow: "hidden", aspectRatio: "3/4", cursor: "pointer" }}
                    onClick={() => setActiveImage(client.afterImg)}
                  >
                    <img 
                      src={client.afterImg} 
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
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0, 0, 0, 0.3)",
                      opacity: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "opacity 0.2s"
                    }} className="img-hover">
                      <ZoomIn style={{ color: "#fff", width: 20, height: 20 }} />
                    </div>
                  </div>
                </div>

                {/* Before / After Description Breakdown */}
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.65rem",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                  fontSize: "0.85rem",
                  lineHeight: 1.5
                }}>
                  <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.65)", fontFamily: "var(--font-manrope)" }}>
                    <strong style={{ color: "#ff6b6b", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>До: </strong>
                    {client.beforeDesc}
                  </p>
                  <p style={{ margin: 0, color: "rgba(255, 255, 255, 0.95)", fontFamily: "var(--font-manrope)" }}>
                    <strong style={{ color: "var(--accent-color)", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.08em" }}>Після: </strong>
                    {client.afterDesc}
                  </p>
                </div>
              </div>

              {/* Review proof buttons */}
              {client.reviewImgs && client.reviewImgs.length > 0 && (
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  alignItems: "center",
                  paddingTop: "0.75rem",
                  borderTop: "1px solid rgba(255, 255, 255, 0.08)"
                }}>
                  {client.reviewImgs.map((rev, revIdx) => (
                    <button
                      key={revIdx}
                      type="button"
                      onClick={() => setActiveImage(rev)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        padding: "0.3rem 0.6rem",
                        backgroundColor: "rgba(255, 255, 255, 0.08)",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        color: "#ffffff",
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "var(--font-manrope)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em"
                      }}
                    >
                      <MessageSquare size={12} />
                      <span>Скріншот {client.reviewImgs!.length > 1 ? `#${revIdx + 1}` : "відгуку"}</span>
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <motion.div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.95)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem"
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveImage(null)}
          >
            <button
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "none",
                border: "none",
                color: "#ffffff",
                cursor: "pointer",
                padding: "0.5rem"
              }}
              onClick={() => setActiveImage(null)}
            >
              <X size={32} />
            </button>
            <div style={{ position: "relative", maxWidth: "90vw", maxHeight: "85vh" }} onClick={(e) => e.stopPropagation()}>
              <img
                src={activeImage}
                alt="Збільшений результат"
                style={{
                  maxWidth: "90vw",
                  maxHeight: "85vh",
                  objectFit: "contain",
                  borderRadius: "4px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.8)"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
