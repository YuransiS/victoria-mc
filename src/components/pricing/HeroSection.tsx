"use client";

import React from "react";
import { motion } from "framer-motion";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 768px)" srcSet="/hero_mobile_muted.png" />
          <img 
            src="/hero_pc_muted.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover grayscale-[0.3]"
          />
        </picture>
        {/* Subtle overlay for text contrast */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="max-w-screen-2xl mx-auto w-full relative z-10 px-8 py-20 flex flex-col items-center text-center">
        {/* Top Info */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12 space-y-2"
        >
          <p className="font-headline text-xl md:text-2xl font-bold uppercase tracking-widest text-[#e2e2e2]">старт: травень</p>
          <p className="font-headline text-lg md:text-xl uppercase tracking-widest opacity-60">7 тижнів</p>
        </motion.div>

        {/* Main Title */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-headline font-black text-[18vw] md:text-[14vw] leading-none tracking-tighter uppercase mb-12 text-white"
        >
          СТВОРЮЙ
        </motion.h1>

        {/* Bottom Blocks */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="max-w-3xl space-y-8"
        >
          <p className="font-headline text-lg md:text-2xl font-bold uppercase tracking-wide text-[#e2e2e2]">
            забудь про хаос в блозі
          </p>
          
          <p className="font-headline text-sm md:text-lg uppercase tracking-wider leading-relaxed opacity-80">
            побудуй для себе зручну систему роботи з контентом та візуалом вже з першого тижня навчання
          </p>

          <p className="font-label text-xs md:text-sm italic tracking-widest opacity-50">
            без фотостудій, складних зйомок і дорогого обладнання
          </p>
        </motion.div>

        {/* Side captions */}
        <div className="absolute left-8 bottom-24 hidden lg:flex flex-col gap-4 text-left">
          <span className="font-headline text-2xl font-bold uppercase tracking-tighter text-white/80">ВІЗУАЛ</span>
          <span className="font-headline text-2xl font-bold uppercase tracking-tighter text-white/80">КОНТЕНТ</span>
        </div>
        <div className="absolute right-8 bottom-24 hidden lg:flex text-right">
          <span className="font-headline text-2xl font-bold uppercase tracking-tighter text-white/80">СЕНСИ</span>
        </div>
      </div>
    </section>
  );
};
