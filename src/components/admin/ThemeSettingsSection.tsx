'use client';

import React from 'react';
import { useAdminTheme } from './AdminThemeProvider';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeSettingsSection() {
  const { theme, setTheme, defaultTheme, setDefaultThemeSetting } = useAdminTheme();

  return (
    <div className="bg-admin-surface border border-admin-border p-8 rounded-3xl space-y-6 shadow-xl transition-colors duration-300">
      <div className="flex items-center gap-3">
        <Sun className="text-[#C4A47C] w-5 h-5 animate-pulse" />
        <h2 className="text-sm font-bold uppercase tracking-widest text-admin-text-muted font-headline">Оформлення інтерфейсу</h2>
      </div>

      <div className="space-y-6 pt-2">
        {/* Current Theme Switcher Card */}
        <div className="p-5 bg-admin-surface-muted border border-admin-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
          <div>
            <h3 className="text-xs font-bold text-admin-text mb-1">Поточна тема</h3>
            <p className="text-[10px] text-admin-text-dim leading-relaxed">
              Змінити тему оформлення панелі для поточної сесії.
            </p>
          </div>
          
          <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border w-fit gap-1 shrink-0 transition-colors duration-300">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                theme === 'light'
                  ? 'bg-[#C4A47C] text-black shadow-md shadow-[#C4A47C]/10'
                  : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-card-hover'
              }`}
            >
              <Sun size={12} />
              Світла
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[#C4A47C] text-black shadow-md shadow-[#C4A47C]/10'
                  : 'text-admin-text-muted hover:text-admin-text hover:bg-admin-card-hover'
              }`}
            >
              <Moon size={12} />
              Темна
            </button>
          </div>
        </div>

        {/* Default Theme Card */}
        <div className="p-5 bg-admin-surface-muted border border-admin-border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors duration-300">
          <div>
            <h3 className="text-xs font-bold text-admin-text mb-1">Тема за замовчуванням</h3>
            <p className="text-[10px] text-admin-text-dim leading-relaxed">
              Тема, яка буде автоматично застосовуватися при кожному вході в кабінет.
            </p>
          </div>
          
          <div className="flex bg-admin-bg p-1 rounded-xl border border-admin-border w-fit gap-1 shrink-0 transition-colors duration-300">
            <button
              onClick={() => setDefaultThemeSetting('light')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                defaultTheme === 'light'
                  ? 'bg-[#C4A47C]/20 border border-[#C4A47C]/30 text-[#C4A47C]'
                  : 'border border-transparent text-admin-text-muted hover:text-admin-text hover:bg-admin-card-hover'
              }`}
            >
              Світла
            </button>
            <button
              onClick={() => setDefaultThemeSetting('dark')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                defaultTheme === 'dark'
                  ? 'bg-[#C4A47C]/20 border border-[#C4A47C]/30 text-[#C4A47C]'
                  : 'border border-transparent text-admin-text-muted hover:text-admin-text hover:bg-admin-card-hover'
              }`}
            >
              Темна
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
