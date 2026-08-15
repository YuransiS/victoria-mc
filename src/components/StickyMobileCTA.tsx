"use client";
import React, { useEffect, useState } from 'react';
import styles from './StickyMobileCTA.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Show sticky CTA as soon as user starts scrolling down past top section
      if (scrollPosition > 120) {
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
          className={styles.stickyWrapper}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className={styles.stickyContent}>
            <div className={styles.stickyPriceInfo}>
              <span className={styles.stickyPriceOld}>449 грн</span>
              <span className={styles.stickyPriceNew}>149 грн</span>
            </div>
            <a href="#registration-form" className={styles.stickyButton} onClick={handleClick}>
              Хочу систему →
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
