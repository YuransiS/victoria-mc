"use client";

import { useEffect } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
}

export const BookingModal = ({ isOpen, onClose, amount }: BookingModalProps) => {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Blurred Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Content - Glassmorphism */}
      <div className="relative w-full max-w-md bg-[#121212]/80 backdrop-blur-xl p-8 sm:p-12 shadow-[0_40px_80px_rgba(0,0,0,0.8)] border-none">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-[#9e9e9e] hover:text-white transition-colors"
          aria-label="Close modal"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="square" strokeLinejoin="miter"/>
          </svg>
        </button>

        <h3 className="font-manrope text-2xl text-white font-bold mb-2 uppercase tracking-wide">
          Оформлення броні
        </h3>
        <p className="font-inter text-[#9e9e9e] text-sm mb-10">
          Зафіксуйте місце за спеціальною ціною. Сума: ${amount}
        </p>

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          {/* Input: Name */}
          <div className="relative flex flex-col">
            <label htmlFor="name" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Ім{`'`}я
            </label>
            <input 
              type="text" 
              id="name"
              className="w-full bg-transparent border-0 border-b border-[#333333] py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0"
              placeholder="Ваше ім'я"
              required
            />
          </div>

          {/* Input: Email */}
          <div className="relative flex flex-col">
            <label htmlFor="email" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Email
            </label>
            <input 
              type="email" 
              id="email"
              className="w-full bg-transparent border-0 border-b border-[#333333] py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0"
              placeholder="your@email.com"
              required
            />
          </div>

          {/* Input: Phone */}
          <div className="relative flex flex-col">
            <label htmlFor="phone" className="font-inter text-xs text-[#9e9e9e] mb-2 uppercase tracking-wider">
              Телефон
            </label>
            <input 
              type="tel" 
              id="phone"
              className="w-full bg-transparent border-0 border-b border-[#333333] py-2 text-white font-inter text-base focus:ring-0 focus:border-[#c6c6c7] focus:outline-none transition-colors rounded-none px-0"
              placeholder="+380"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#c6c6c7] text-black font-inter font-semibold py-4 mt-4 uppercase tracking-wide hover:bg-white transition-colors duration-300 shadow-[0_40px_60px_rgba(198,198,199,0.08)]"
          >
            Сплатити бронь ${amount}
          </button>
        </form>
      </div>
    </div>
  );
};
