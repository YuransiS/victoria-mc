"use client";

import React from "react";

export const Footer = () => {
  return (
    <footer className="bg-white py-12 px-8 border-t border-gray-100">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col gap-2">
          <span className="font-headline font-bold uppercase tracking-widest text-sm">ВІКТОРІЯ МЕЩЕРЯКОВА</span>
          <span className="font-label text-xs text-secondary uppercase tracking-tighter">© 2026. ВСІ ПРАВА ЗАХИЩЕНІ.</span>
        </div>

        <div className="flex gap-8">
          <a href="#" className="font-label text-xs uppercase tracking-widest hover:text-primary transition-colors">Instagram</a>
          <a href="#" className="font-label text-xs uppercase tracking-widest hover:text-primary transition-colors">Telegram</a>
        </div>

        <div className="text-right">
          <p className="font-label text-[10px] text-secondary uppercase tracking-widest leading-loose">
            Допомагаємо створювати<br />сенси через візуал
          </p>
        </div>
      </div>
    </footer>
  );
};
