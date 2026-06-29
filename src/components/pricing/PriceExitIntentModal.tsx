"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './PriceExitIntentModal.module.css';
import { usePersistentTimer } from "@/hooks/usePersistentTimer";

export function PriceExitIntentModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  
  const { isExpired, timeParts } = usePersistentTimer(24);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !hasShown && !isExpired) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    const handleScroll = () => {
      if (hasShown || isExpired) return;

      const currentScrollY = window.scrollY;
      const scrollSpeed = lastScrollY - currentScrollY;
      
      if (scrollSpeed > 150 && currentScrollY > 500) {
        setIsVisible(true);
        setHasShown(true);
      }
      
      lastScrollY = currentScrollY;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !hasShown && !isExpired) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasShown, isExpired]);


  const scrollToPricing = () => {
    setIsVisible(false);
    const formatsSection = document.getElementById('formats');
    if (formatsSection) {
        formatsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isExpired) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.overlay} 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsVisible(false)}
        >
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
              <p className={styles.mainText}>Забронюйте своє місце зараз за спецціною, поки час не вичерпався!</p>
              
              <div className={styles.timerContainer}>
                <div className={styles.timerText}>ДО ЗНИЖЕННЯ ЦІНИ ЗАЛИШИЛОСЯ:</div>
                <div className={styles.timer}>
                    <span>{String(timeParts.hours).padStart(2, '0')}</span>:
                    <span>{String(timeParts.minutes).padStart(2, '0')}</span>:
                    <span>{String(timeParts.seconds).padStart(2, '0')}</span>
                </div>
              </div>

              <button className={styles.ctaButton} onClick={scrollToPricing}>
                ЗАБРАТИ СВОЄ МІСЦЕ
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
