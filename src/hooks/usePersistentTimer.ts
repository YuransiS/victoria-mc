import { useState, useEffect } from 'react';

export const usePersistentTimer = (durationHours: number = 24) => {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check for reset triggers in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const isAdminReset = urlParams.get('admin_reset') === 'victoria';
    const isUserReset = urlParams.has('latedate-newcounter');

    if (isAdminReset) {
      localStorage.removeItem('visitStartTimeV2');
      localStorage.removeItem('timerResetUsed'); // Reset the usage flag too for admin convenience
      window.history.replaceState({}, '', window.location.pathname);
    } else if (isUserReset) {
      const alreadyReset = localStorage.getItem('timerResetUsed');
      if (!alreadyReset) {
        localStorage.removeItem('visitStartTimeV2');
        localStorage.setItem('timerResetUsed', 'true');
      }
      window.history.replaceState({}, '', window.location.pathname);
    }

    const durationMs = durationHours * 60 * 60 * 1000;
    let startTime = localStorage.getItem('visitStartTimeV2');

    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem('visitStartTimeV2', startTime);
    }

    const startTimestamp = parseInt(startTime);

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTimestamp;
      const remaining = Math.max(0, durationMs - elapsed);

      setTimeLeft(remaining);
      setIsExpired(remaining <= 0);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [durationHours]);

  const getTimeParts = () => {
    if (timeLeft === null) return { hours: 0, minutes: 0, seconds: 0 };

    const h = Math.floor(timeLeft / (1000 * 60 * 60));
    const m = Math.floor((timeLeft / (1000 * 60)) % 60);
    const s = Math.floor((timeLeft / 1000) % 60);
    return { hours: h, minutes: m, seconds: s };
  };

  return {
    timeLeft,
    isExpired,
    timeParts: getTimeParts(),
    reset: () => {
      localStorage.removeItem('visitStartTimeV2');
      localStorage.removeItem('timerResetUsed');
      window.location.reload();
    }
  };
};
