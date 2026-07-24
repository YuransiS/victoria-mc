"use client";

export interface DynamicPriceState {
  price: number;
  nextPrice: number | null;
  phase: number;
  timeLeft: number;
}

export function getDynamicPriceState(): DynamicPriceState {
  if (typeof window === "undefined") {
    return { price: 149, nextPrice: 249, phase: 1, timeLeft: 600 };
  }

  // Force price to 249 on duplicated /249 route
  if (window.location.pathname.startsWith("/249") || window.location.pathname.includes("249")) {
    return { price: 249, nextPrice: null, phase: 1, timeLeft: 0 };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const pParam = searchParams.get("p");
  
  // Base price (before any timer-based increases)
  let basePrice = 149;
  if (pParam === "49") basePrice = 49;
  else if (pParam === "89") basePrice = 89;
  else if (pParam === "149") basePrice = 149;

  // p=89 is static as requested
  if (basePrice !== 49 && basePrice !== 149) {
    return { price: basePrice, nextPrice: null, phase: 1, timeLeft: 0 };
  }

  const now = Date.now();
  let timerStart = localStorage.getItem("pricing_timer_start");
  
  if (!timerStart) {
    timerStart = now.toString();
    localStorage.setItem("pricing_timer_start", timerStart);
  }

  let startTime = parseInt(timerStart, 10);
  let secondsElapsed = Math.floor((now - startTime) / 1000);

  if (basePrice === 49) {
    // 49 UAH flow (2 phases of 10 min each, then loops):
    // Phase 1 (0 to 10 min): 49 UAH -> next 149 UAH
    // Phase 2 (10 to 20 min): 149 UAH -> next 249 UAH
    if (secondsElapsed >= 1200) {
      // Loop/reset timer so returning users always see fresh offer
      localStorage.setItem("pricing_timer_start", now.toString());
      return {
        price: 49,
        nextPrice: 149,
        phase: 1,
        timeLeft: 600
      };
    } else if (secondsElapsed < 600) {
      return {
        price: 49,
        nextPrice: 149,
        phase: 1,
        timeLeft: 600 - secondsElapsed
      };
    } else {
      return {
        price: 149,
        nextPrice: 249,
        phase: 2,
        timeLeft: 1200 - secondsElapsed
      };
    }
  } else {
    // 149 UAH flow (1 phase of 10 min, then loops):
    // Phase 1 (0 to 10 min): 149 UAH -> next 249 UAH
    if (secondsElapsed >= 600) {
      // Loop/reset timer once 10 min pass
      localStorage.setItem("pricing_timer_start", now.toString());
      return {
        price: 149,
        nextPrice: 249,
        phase: 1,
        timeLeft: 600
      };
    } else {
      return {
        price: 149,
        nextPrice: 249,
        phase: 1,
        timeLeft: 600 - secondsElapsed
      };
    }
  }
}
