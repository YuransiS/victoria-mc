"use client";
import React, { useEffect, useState } from 'react';
import styles from './StickyMobileCTA.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export function StickyMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show it only after scrolling down a bit (past the initial hero form)
      // The hero form is at the top, so we don't need the sticky button immediately
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
    const heroForm = document.getElementById('registration-form');
    if (heroForm) {
      heroForm.scrollIntoView({ behavior: 'smooth' });
      // Optionally focus input after scroll
      setTimeout(() => {
        const nameInput = heroForm.querySelector('input[name="name"]') as HTMLInputElement;
        if (nameInput) nameInput.focus();
      }, 500);
    }
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
          <a href="#registration-form" className={styles.stickyButton} onClick={handleClick}>
            ЗАРЕЄСТРУВАТИСЯ БЕЗКОШТОВНО
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
