"use client";
import React, { useEffect, useState } from 'react';
import styles from './StickyMobileCTA.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);
  const [variant, setVariant] = useState(1);

  useEffect(() => {
    // Detect active offer variant
    const currentOffer = localStorage.getItem("current_offer_variant") || "";
    if (currentOffer === "offer2") {
      setVariant(2);
    } else if (currentOffer === "offer3") {
      setVariant(3);
    }

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      if (scrollPosition > windowHeight * 0.8) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent("open-registration-modal"));
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={`${styles.stickyWrapper} ${
            variant === 1 ? styles.var1 : variant === 2 ? styles.var2 : styles.var3
          }`}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <a href="#registration-form" className={styles.stickyButton} onClick={handleClick}>
            ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
