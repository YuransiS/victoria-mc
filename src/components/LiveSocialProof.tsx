"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LiveSocialProof.module.css';

const names = [
  "Олена", "Юлія", "Вікторія", "Марія", "Анастасія", "Дарія", "Оксана", "Катерина", "Ірина", "Тетяна", "Наталія",
  "Олександр", "Максим", "Дмитро", "Денис", "Андрій", "Артем", "Владислав", "Євген"
];
const registrationActions = [
  "щойно зареєструвався(-лась) 🔥",
  "записався(-лась) на практикум ✅",
  "приєднався(-лась) до нас ✨",
  "успішно зареєстровано ⚡"
];

const bookingActions = [
  "щойно зареєструвався(-лась) 🔥",
  "записався(-лась) на практикум ✅",
  "приєднався(-лась) до нас ✨",
  "успішно зареєстровано ⚡"
];

export function LiveSocialProof({ variant = "registration" }: { variant?: "registration" | "booking" }) {
  const [notification, setNotification] = useState<{name: string, action: string, id: number} | null>(null);
  const [bookingCount, setBookingCount] = useState(1);
  const [isAnyModalOpen, setIsAnyModalOpen] = useState(false);

  useEffect(() => {
    const checkModal = () => {
      setIsAnyModalOpen(document.body.classList.contains('modal-open'));
    };
    
    checkModal();
    const observer = new MutationObserver(checkModal);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isAnyModalOpen) {
      setNotification(null);
      return;
    }

    let timeoutId: NodeJS.Timeout;

    const scheduleNextNotification = () => {
      // Random delay before showing next notification (between 25s and 55s)
      const nextDelay = Math.floor(Math.random() * 30000) + 25000;
      
      timeoutId = setTimeout(() => {
        const actions = variant === "booking" ? bookingActions : registrationActions;
        const name = names[Math.floor(Math.random() * names.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        setNotification({ name, action, id: Date.now() });
        if (variant === "booking") {
          setBookingCount(prev => Math.max(1, prev - 1));
        }
        
        // Update the global count on the hero screen
        window.dispatchEvent(new Event('new_registration'));

        // Hide after 4-5 seconds
        setTimeout(() => {
          setNotification(null);
          scheduleNextNotification(); // Schedule next one only after this one hides
        }, Math.floor(Math.random() * 1000) + 4000);
        
      }, nextDelay);
    };

    // Initial delay before first notification (between 5s and 12s)
    const initialDelay = Math.floor(Math.random() * 7000) + 5000;
    timeoutId = setTimeout(() => {
      const actions = variant === "booking" ? bookingActions : registrationActions;
      const name = names[Math.floor(Math.random() * names.length)];
      const action = actions[Math.floor(Math.random() * actions.length)];
      setNotification({ name, action, id: Date.now() });
      if (variant === "booking") {
        setBookingCount(prev => Math.max(1, prev - 1));
      }
      
      // Update global count
      window.dispatchEvent(new Event('new_registration'));

      setTimeout(() => {
        setNotification(null);
        scheduleNextNotification();
      }, 4500);
    }, initialDelay);


    return () => {
      clearTimeout(timeoutId);
    };
  }, [variant, isAnyModalOpen]);

  useEffect(() => {
    if (variant !== 'booking') return;

    const intervalId = setInterval(() => {
      // Randomly increase the count to simulate people starting to book
      setBookingCount(prev => (prev < 2 ? prev + 1 : prev));
    }, Math.floor(Math.random() * 15000) + 15000); // Every 15-30s

    return () => clearInterval(intervalId);
  }, [variant]);

  return (
    <AnimatePresence>
      {notification && !isAnyModalOpen && (
        <motion.div 
          key={notification.id}
          className={styles.toast}
          drag="x"
          dragConstraints={{ left: 0, right: 200 }}
          dragElastic={0.1}
          onDragEnd={(_, info) => {
            if (info.offset.x > 80) {
              setNotification(null);
            }
          }}
          initial={{ opacity: 0, x: -50, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, x: 100 }}
          transition={{ duration: 0.3 }}
          style={{ cursor: 'grab' }}
          whileDrag={{ cursor: 'grabbing', scale: 1.02 }}
        >
          <div className={styles.avatar}>
            {notification.name.charAt(0)}
          </div>
          <div className={styles.textContainer}>
            <p className={styles.title}>{notification.name}</p>
            <p className={styles.subtitle}>{notification.action}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
