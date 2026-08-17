"use client";

import { useState, useEffect } from "react";

export function use10MinTimer() {
  const DURATION_SECS = 20 * 60; // 20 minutes countdown for /intensive/5-likes
  const [secondsLeft, setSecondsLeft] = useState(DURATION_SECS);

  useEffect(() => {
    const STORAGE_KEY = "intensive_5likes_timer_end_v20";
    const now = Date.now();
    let endTimeStr = localStorage.getItem(STORAGE_KEY);
    let endTime = endTimeStr ? parseInt(endTimeStr, 10) : 0;

    if (!endTime || isNaN(endTime) || endTime <= now) {
      endTime = now + DURATION_SECS * 1000;
      localStorage.setItem(STORAGE_KEY, endTime.toString());
    }

    const calculateRemaining = () => {
      const currentNow = Date.now();
      let storedEnd = parseInt(localStorage.getItem(STORAGE_KEY) || "0", 10);
      if (!storedEnd || isNaN(storedEnd) || storedEnd <= currentNow) {
        storedEnd = currentNow + DURATION_SECS * 1000;
        localStorage.setItem(STORAGE_KEY, storedEnd.toString());
      }
      const remaining = Math.max(0, Math.floor((storedEnd - currentNow) / 1000));
      setSecondsLeft(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 1000);

    return () => clearInterval(interval);
  }, []);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  return { secondsLeft, formattedTime };
}
