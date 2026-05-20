'use client';

import React from 'react';
import { useAdminTheme } from './AdminThemeProvider';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <div className="px-2 mb-4">
      <button
        onClick={toggleTheme}
        className="relative flex items-center justify-between w-full p-1 bg-admin-active-bg border border-admin-border rounded-xl cursor-pointer select-none focus:outline-none transition-all duration-300 active:scale-98 group overflow-hidden"
        aria-label="Toggle theme"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#C4A47C]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        
        {/* Sliding active pill indicator */}
        <motion.div
          className="absolute top-1 bottom-1 left-1 rounded-lg bg-gradient-to-br from-[#C4A47C] to-[#E5C9A3] shadow-md shadow-[#C4A47C]/20"
          style={{ width: 'calc(50% - 4px)' }}
          animate={{
            x: theme === 'light' ? 0 : '100%',
          }}
          transition={{ type: 'spring', stiffness: 350, damping: 26 }}
        />

        {/* Light Mode Selector */}
        <div className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-300 z-10 ${
          theme === 'light' ? 'text-black' : 'text-admin-text-muted group-hover:text-admin-text'
        }`}>
          <Sun size={11} className={`transition-transform duration-500 ${theme === 'light' ? 'rotate-45 scale-110' : 'scale-90'}`} />
          <span>Світла</span>
        </div>

        {/* Dark Mode Selector */}
        <div className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[9px] font-black uppercase tracking-wider transition-colors duration-300 z-10 ${
          theme === 'dark' ? 'text-black' : 'text-admin-text-muted group-hover:text-admin-text'
        }`}>
          <Moon size={11} className={`transition-transform duration-500 ${theme === 'dark' ? '-rotate-12 scale-110' : 'scale-90'}`} />
          <span>Темна</span>
        </div>
      </button>
    </div>
  );
}
