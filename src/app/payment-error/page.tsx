"use client"

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function PaymentErrorPage() {
  const router = useRouter();
  const [orderDetails, setOrderDetails] = useState<any>(null);

  useEffect(() => {
    // Check if we have payment attempt info
    const attempt = sessionStorage.getItem('paymentAttempted');
    if (!attempt) {
      router.push('/');
      return;
    }

    // Try to get some context about what failed
    const lastOrderId = sessionStorage.getItem('lastOrderId');
    if (lastOrderId) {
      setOrderDetails({ id: lastOrderId });
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-8 overflow-hidden relative">
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-xl w-full text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-12 flex justify-center">
            <div className="w-24 h-24 border border-red-500/20 rounded-full flex items-center justify-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="square" strokeLinejoin="miter"/>
              </svg>
            </div>
          </div>

          <h1 className="font-manrope text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8 italic text-red-500">
            ПОМИЛКА ОПЛАТИ
          </h1>
          
          <p className="font-inter text-lg text-white/60 mb-12 leading-relaxed">
            На жаль, платіж не було завершено. Це могло статися через недостатню кількість коштів, ліміти банку або технічну відмову. 
            <br /><br />
            Ваші дані збережені, ви можете спробувати ще раз.
          </p>

          <div className="space-y-4">
            <button 
              onClick={() => router.push('/?retry=payment')}
              className="block w-full bg-white text-black py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/90 transition-all"
            >
              СПРОБУВАТИ ЩЕ РАЗ
            </button>
            
            <Link 
              href="https://t.me/vika_cooperation" 
              className="block w-full border border-white/20 py-5 font-manrope font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
            >
              ДОПОМОГА В TELEGRAM
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
