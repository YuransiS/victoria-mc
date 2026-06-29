'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface AdminThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  defaultTheme: Theme;
  setDefaultThemeSetting: (theme: Theme) => void;
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined);

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [defaultTheme, setDefaultTheme] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read from localStorage
    const savedDefault = localStorage.getItem('admin_default_theme') as Theme || 'dark';
    const savedCurrent = localStorage.getItem('admin_current_theme') as Theme || savedDefault;
    
    // Disable transitions during initial theme hydration to avoid transition flash
    const root = document.documentElement;
    root.classList.add('preload-no-transition');
    root.classList.remove('admin-theme-light', 'admin-theme-dark');
    root.classList.add(`admin-theme-${savedCurrent}`);
    
    setDefaultTheme(savedDefault);
    setThemeState(savedCurrent);
    setMounted(true);
    
    // Force browser reflow to apply classes without transition
    void root.offsetHeight;
    
    const timer = setTimeout(() => {
      root.classList.remove('preload-no-transition');
    }, 150);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    root.classList.remove('admin-theme-light', 'admin-theme-dark');
    root.classList.add(`admin-theme-${theme}`);
    
    return () => {
      root.classList.remove('admin-theme-light', 'admin-theme-dark');
    };
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('admin_current_theme', newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const setDefaultThemeSetting = (newDefault: Theme) => {
    setDefaultTheme(newDefault);
    localStorage.setItem('admin_default_theme', newDefault);
  };

  // Prevent flash or server mismatch by rendering a dark container initially if not mounted
  const currentThemeClass = mounted ? `admin-theme-${theme}` : 'admin-theme-dark';

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme, defaultTheme, setDefaultThemeSetting }}>
      <div className={`flex min-h-screen w-full ${currentThemeClass} bg-admin-bg text-admin-text`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext);
  if (!context) {
    throw new Error('useAdminTheme must be used within an AdminThemeProvider');
  }
  return context;
}
