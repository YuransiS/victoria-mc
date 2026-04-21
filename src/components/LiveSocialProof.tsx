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
  "зареєструвався(-лась) на МК ✅",
  "приєднався(-лась) до нас ✨",
  "успішно зареєстровано ⚡"
];

const bookingActions = [
  "щойно вніс(-ла) бронь 🔥",
  "забронював(-ла) місце ✅",
  "вніс(-ла) передоплату ✨",
  "успішно забронював(-ла) ⚡"
];

export function LiveSocialProof({ variant = "registration" }: { variant?: "registration" | "booking" }) {
  const [notification, setNotification] = useState<{name: string, action: string} | null>(null);
  const [bookingCount, setBookingCount] = useState(12);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const scheduleNextNotification = () => {
      // Random delay before showing next notification (between 25s and 55s)
      const nextDelay = Math.floor(Math.random() * 30000) + 25000;
      
      timeoutId = setTimeout(() => {
        const actions = variant === "booking" ? bookingActions : registrationActions;
        const name = names[Math.floor(Math.random() * names.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        setNotification({ name, action });
        if (variant === "booking") {
          setBookingCount(prev => prev + 1);
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
      setNotification({ name, action });
      if (variant === "booking") {
        setBookingCount(prev => prev + 1);
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
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div 
          className={styles.toast}
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.4 }}
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
      
      {variant === 'booking' && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-4 px-4 z-[90] flex justify-center items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 font-headline text-xs md:text-sm uppercase tracking-widest text-black">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Зараз бронюють місця: 
            <motion.span 
              key={bookingCount}
              initial={{ scale: 1.5, color: '#5d5f2c' }}
              animate={{ scale: 1, color: '#000000' }}
              className="font-extrabold text-primary ml-1"
            >
              {bookingCount} осіб
            </motion.span>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
