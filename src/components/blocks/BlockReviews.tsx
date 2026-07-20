"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./SharedBlocks.module.css";
import { ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

const reviewImages = [
  'r5.jpg', 'r1.jpg', 'r4.jpg', 'r2.jpg', 'r3.jpg', 
  'r6.jpg', 'r7.jpg', 'r8.jpg', 'r9.jpg', 'r10.jpg'
];

export function BlockReviews() {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section className={styles.section} style={{ paddingTop: "2rem" }}>
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
          Фідбек
        </p>
        <h2 className={styles.sectionTitle} style={{ textAlign: "center", marginBottom: "2rem" }}>
          Що кажуть дівчата
        </h2>
        <div style={{ width: "60px", height: "1.5px", background: "var(--accent-color)", margin: "0 auto 3rem" }}></div>
      </motion.div>

      {/* Review Cards horizontal layout / wrap grid */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "1.5rem",
        width: "100%"
      }}>
        {reviewImages.map((img, idx) => (
          <motion.div
            key={idx}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: "280px",
              aspectRatio: "1",
              background: "rgba(26, 26, 28, 0.6)",
              border: "1.5px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              overflow: "hidden"
            }}
            whileHover={{ scale: 1.02, borderColor: "rgba(255, 255, 0, 0.4)" }}
            transition={{ duration: 0.3 }}
            onClick={() => setActiveImage(`/rozbir/${img}`)}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
          >
            <img 
              src={`/rozbir/${img}`} 
              alt="Відгук" 
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                padding: "0.5rem"
              }} 
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0, 0, 0, 0.4)",
              opacity: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "opacity 0.3s ease"
            }} className="hover-overlay">
              <ZoomIn style={{ color: "#ffffff", width: "24px", height: "24px" }} />
            </div>
            <style jsx>{`
              div:hover .hover-overlay {
                opacity: 1 !important;
              }
            `}</style>
          </motion.div>
        ))}
      </div>

      {/* Image Modal Lightbox */}
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

            <motion.div
              style={{
                position: "relative",
                maxWidth: "100%",
                maxHeight: "85vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={activeImage} 
                alt="Відгук великий" 
                style={{
                  maxWidth: "100%",
                  maxHeight: "85vh",
                  objectFit: "contain"
                }} 
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
