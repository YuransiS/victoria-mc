"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ExitIntentModal.module.css';

export function ExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleMouseLeave = (e: MouseEvent) => {
      // Show when mouse leaves towards the top of the browser
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    const handleScroll = () => {
      if (hasShown) return;

      const currentScrollY = window.scrollY;
      const scrollSpeed = lastScrollY - currentScrollY;
      
      // If user scrolls up very fast (e.g. > 70px per frame) it indicates exit intent on mobile
      if (scrollSpeed > 70 && currentScrollY > 100) {
        setIsVisible(true);
        setHasShown(true);
      }
      
      lastScrollY = currentScrollY;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasShown]);


  const scrollToHero = () => {
    setIsVisible(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Slight delay, then focus the form input if we have one
    setTimeout(() => {
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement | null;
      if (nameInput) {
        nameInput.focus();
      }
    }, 500);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className={styles.overlay} onClick={() => setIsVisible(false)}>
          <motion.div 
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            transition={{ duration: 0.4 }}
          >
            <button className={styles.closeBtn} onClick={() => setIsVisible(false)}>×</button>
            <div className={styles.content}>
              <h2 className={styles.title}>ЗАЧЕКАЙТЕ! 🛑</h2>
              <p className={styles.subtitle}>Ви точно хочете пропустити це?</p>
              <p className={styles.mainText}>На майстер-клас залишилося лише <b>3 місця</b> з крутим бонусом: «Готова структура блогу на 6 місяців».</p>
              <button className={styles.ctaButton} onClick={scrollToHero}>
                ЗАБРАТИ СВІЙ БОНУС
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
