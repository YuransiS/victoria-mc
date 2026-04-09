"use client"

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ThanksPage() {
  const router = useRouter();

  useEffect(() => {
    // Basic protection: check if user reached this page through common flow
    const attempt = sessionStorage.getItem('paymentAttempted');
    if (!attempt) {
      router.push('/');
    }
    // Optional: Clear after some time or on unmount
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
         {/* Subtle background glow */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12 flex justify-center">
            <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 13l4 4L19 7" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
          </div>

          <h1 className="font-manrope text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic">
            ДЯКУЄМО!
          </h1>
          
          <p className="font-inter text-lg text-white/60 mb-12 leading-relaxed">
            Ваша бронь успішно зафіксована. Найближчим часом ми зв{`'`}яжемося з вами через Telegram для уточнення деталей та надання доступу до бонусів.
          </p>

          <div className="space-y-4">
            <Link 
              href="https://t.me/victoria_mesheriakova" 
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              НАПИСАТИ В TELEGRAM
            </Link>
            
            <Link 
              href="/" 
              className="block w-full border border-white/20 py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              НА ГОЛОВНУ
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
