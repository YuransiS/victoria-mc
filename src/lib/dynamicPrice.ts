"use client";

export interface DynamicPriceState {
  price: number;
  nextPrice: number | null;
  phase: number;
  timeLeft: number;
}

export function getDynamicPriceState(): DynamicPriceState {
  if (typeof window === "undefined") {
    return { price: 149, nextPrice: null, phase: 1, timeLeft: 600 };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const pParam = searchParams.get("p");
  
  // Base price (before any timer-based increases)
  let basePrice = 149;
  if (pParam === "49") basePrice = 49;
  else if (pParam === "89") basePrice = 89;
  else if (pParam === "149") basePrice = 149;

  // p=89 is static as requested (no dynamic escalation specified)
  if (basePrice !== 49 && basePrice !== 149) {
    return { price: basePrice, nextPrice: null, phase: 1, timeLeft: 0 };
  }

  const now = Date.now();
  let timerStart = localStorage.getItem("pricing_timer_start");
  
  if (!timerStart) {
    timerStart = now.toString();
    localStorage.setItem("pricing_timer_start", timerStart);
  }

  const startTime = parseInt(timerStart, 10);
  const secondsElapsed = Math.floor((now - startTime) / 1000);

  if (basePrice === 49) {
    // 49 UAH flow:
    // Phase 1 (0 to 10 min): 49 UAH -> next is 149 UAH
    // Phase 2 (10 to 20 min): 149 UAH -> next is 249 UAH
    // Phase 3 (20+ min): 249 UAH -> static
    if (secondsElapsed < 600) {
      return {
        price: 49,
        nextPrice: 149,
        phase: 1,
        timeLeft: 600 - secondsElapsed
      };
    } else if (secondsElapsed < 1200) {
      return {
        price: 149,
        nextPrice: 249,
        phase: 2,
        timeLeft: 1200 - secondsElapsed
      };
    } else {
      return {
        price: 249,
        nextPrice: null,
        phase: 3,
        timeLeft: 0
      };
    }
  } else {
    // 149 UAH flow:
    // Phase 1 (0 to 10 min): 149 UAH -> next is 249 UAH
    // Phase 2 (10+ min): 249 UAH -> static
    if (secondsElapsed < 600) {
      return {
        price: 149,
        nextPrice: 249,
        phase: 1,
        timeLeft: 600 - secondsElapsed
      };
    } else {
      return {
        price: 249,
        nextPrice: null,
        phase: 2,
        timeLeft: 0
      };
    }
  }
}
