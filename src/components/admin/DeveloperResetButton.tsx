'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export default function DeveloperResetButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = () => {
    setLoading(true);
    // Delete tour status key from localStorage
    localStorage.removeItem('crm_onboarding_seen');
    
    // Aesthetic premium delay
    setTimeout(() => {
      // Redirect to leads page with tour active query param
      window.location.href = '/admin/leads?run_tour=true';
    }, 600);
  };

  return (
    <button
      onClick={handleReset}
      disabled={loading}
      className="bg-gradient-to-r from-[#C4A47C] to-[#E5C9A3] hover:from-[#B0936C] hover:to-[#C4A47C] disabled:from-white/5 disabled:to-white/5 disabled:text-white/20 disabled:border-white/5 disabled:cursor-not-allowed text-black font-black uppercase tracking-widest px-4 py-2.5 rounded-xl text-[9px] active:scale-95 shadow-lg shadow-[#C4A47C]/10 transition-all flex items-center gap-1.5 shrink-0"
    >
      {loading ? (
        <>
          <Loader2 size={11} className="animate-spin" />
          Запуск...
        </>
      ) : (
        <>
          <Sparkles size={11} className="animate-pulse" />
          Тестовий запуск підказок
        </>
      )}
    </button>
  );
}
