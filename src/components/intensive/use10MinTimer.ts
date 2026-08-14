"use client";

import { useState, useEffect } from "react";

export function use10MinTimer() {
  const [secondsLeft, setSecondsLeft] = useState(600);

  useEffect(() => {
    const STORAGE_KEY = "intensive_5likes_timer_end";
    const now = Date.now();
    let endTime = localStorage.getItem(STORAGE_KEY);

    if (!endTime || parseInt(endTime, 10) <= now) {
      // 10 minutes from now
      endTime = (now + 10 * 60 * 1000).toString();
      localStorage.setItem(STORAGE_KEY, endTime);
    }

    const calculateRemaining = () => {
      const remaining = Math.max(0, Math.floor((parseInt(endTime!, 10) - Date.now()) / 1000));
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
