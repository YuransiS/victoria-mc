'use client';

import React from 'react';
import Link from 'next/link';

export default function FailPage() {
  return (
    <div className="antialiased min-h-screen flex flex-col justify-center items-center px-4 bg-[#F9F9F9] font-sans">
      <div className="max-w-md w-full bg-white p-8 md:p-12 text-center border border-gray-100 shadow-xl rounded-2xl">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="#ef4444"
            className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-4">Помилка оплати</h1>
        <p className="text-gray-600 mb-8 font-light leading-relaxed">
          На жаль, під час оплати виникла помилка. Гроші не були
          списані. Будь ласка, спробуйте ще раз.
        </p>
        <Link href="/rozbir"
          className="inline-flex w-full bg-black text-white py-4 text-[11px] font-bold uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors justify-center items-center rounded-lg">
          Спробувати ще раз
        </Link>
      </div>
    </div>
  );
}
