'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, ChevronRight, ChevronLeft, EyeOff, Check } from 'lucide-react';

interface OnboardingTourProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export default function OnboardingTour({ activeTab, setActiveTab }: OnboardingTourProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const steps = useMemo(() => [
    {
      target: '#admin-sidebar',
      mobileTarget: '#admin-sidebar-mobile',
      title: 'Навігація по панелі',
      text: 'Тут знаходиться навігація. Менеджери бачать тільки Базу лідів, а Операційний продюсер та Розробник — повну аналітику та налаштування.'
    },
    {
      target: '#admin-metrics-grid',
      mobileTarget: '#admin-metrics-grid',
      title: 'Показники проекту',
      text: 'Тут відображаються головні показники проекту в реальному часі. Дохід рахується незалежно в UAH та USD.'
    },
    {
      target: '#admin-view-switcher',
      mobileTarget: '#admin-view-switcher',
      title: 'Перемикач відображення',
      text: 'Змінюйте вигляд відображення лідів. Вид автоматично зберігається в URL-адресі, ви можете копіювати посилання на конкретний екран.'
    }
  ], []);

  // Initialize and check localStorage / URL query param
  useEffect(() => {
    const hasSeen = localStorage.getItem('crm_onboarding_seen');
    const forceRun = new URLSearchParams(window.location.search).get('run_tour') === 'true';

    if (!hasSeen || forceRun) {
      setIsOpen(true);
      setCurrentStep(0);
      
      // Clean query parameter from URL
      if (forceRun) {
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    }
  }, []);

  const currentStepData = steps[currentStep];

  // Auto-switch tab if necessary to show the targets
  useEffect(() => {
    if (isOpen && (currentStep === 1 || currentStep === 2)) {
      if (activeTab === 'analytics' && setActiveTab) {
        setActiveTab('kanban');
      }
    }
  }, [currentStep, isOpen, activeTab, setActiveTab]);

  // Dynamic z-index lifting to keep target elements fully interactive/accessible
  useEffect(() => {
    let prevEl: HTMLElement | null = null;
    let prevZIndex = '';
    let prevPosition = '';
    let prevPointerEvents = '';

    if (isOpen && currentStepData) {
      const isMobile = window.innerWidth < 1024;
      const selector = isMobile ? currentStepData.mobileTarget : currentStepData.target;
      const el = document.querySelector(selector) as HTMLElement;

      if (el) {
        prevEl = el;
        prevZIndex = el.style.zIndex;
        prevPosition = el.style.position;
        prevPointerEvents = el.style.pointerEvents;

        // Lift target element above the background overlay (which is z-[98])
        el.style.zIndex = '99';
        
        const computedStyle = window.getComputedStyle(el);
        if (computedStyle.position === 'static') {
          el.style.position = 'relative';
        }
        el.style.pointerEvents = 'auto';
      }
    }

    return () => {
      if (prevEl) {
        prevEl.style.zIndex = prevZIndex;
        prevEl.style.position = prevPosition;
        prevEl.style.pointerEvents = prevPointerEvents;
      }
    };
  }, [isOpen, currentStep, currentStepData]);

  // Track position of the active target element
  useEffect(() => {
    if (!isOpen || !currentStepData) {
      setRect(null);
      return;
    }

    const updateRect = () => {
      const isMobile = window.innerWidth < 1024;
      const selector = isMobile ? currentStepData.mobileTarget : currentStepData.target;
      const el = document.querySelector(selector);

      if (el) {
        const r = el.getBoundingClientRect();
        setRect({
          x: r.left,
          y: r.top,
          width: r.width,
          height: r.height
        });
      } else {
        setRect(null);
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    // Use capture phase (true) to intercept scrolls inside any scrollable container on the page
    window.addEventListener('scroll', updateRect, true);
    
    // Account for potential layout shifts / renders
    const t1 = setTimeout(updateRect, 100);
    const t2 = setTimeout(updateRect, 500);

    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isOpen, currentStep, currentStepData]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('crm_onboarding_seen', 'true');
    setIsOpen(false);
  };

  const popupStyle = useMemo<React.CSSProperties>(() => {
    if (!rect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 100
      };
    }

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
    if (isMobile) {
      return {
        position: 'fixed',
        bottom: '24px',
        left: '16px',
        right: '16px',
        zIndex: 100
      };
    }

    // Desktop positioning
    const cardWidth = 380;
    const cardHeight = 180;
    
    let top = rect.y + rect.height + 24;
    let left = rect.x + (rect.width - cardWidth) / 2;

    // Sidebar special layout rules
    const isSidebar = currentStepData.target === '#admin-sidebar';
    if (isSidebar) {
      top = rect.y + 160;
      left = rect.x + rect.width + 24;
    } else {
      // Adjust horizontal overflow
      if (left < 20) left = 20;
      if (left + cardWidth > window.innerWidth - 20) {
        left = window.innerWidth - cardWidth - 20;
      }

      // Adjust vertical overflow
      if (top + cardHeight > window.innerHeight - 20) {
        top = rect.y - cardHeight - 24;
      }
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 100
    };
  }, [rect, currentStepData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-overlay {
          animation: fadeIn 0.4s ease forwards;
        }
        .animate-scale-in-card {
          animation: scaleIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      {/* Dynamic 4-Panel Spotlight Backdrop */}
      {rect ? (
        <div className="fixed inset-0 z-[98] pointer-events-auto animate-fade-in-overlay">
          {/* Top Panel */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: `${Math.max(0, rect.y - 8)}px`,
              backgroundColor: 'rgba(5, 5, 7, 0.85)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={handleComplete}
          />
          {/* Bottom Panel */}
          <div 
            style={{
              position: 'fixed',
              top: `${rect.y + rect.height + 8}px`,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(5, 5, 7, 0.85)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={handleComplete}
          />
          {/* Left Panel */}
          <div 
            style={{
              position: 'fixed',
              top: `${Math.max(0, rect.y - 8)}px`,
              left: 0,
              width: `${Math.max(0, rect.x - 8)}px`,
              height: `${rect.height + 16}px`,
              backgroundColor: 'rgba(5, 5, 7, 0.85)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={handleComplete}
          />
          {/* Right Panel */}
          <div 
            style={{
              position: 'fixed',
              top: `${Math.max(0, rect.y - 8)}px`,
              left: `${rect.x + rect.width + 8}px`,
              right: 0,
              height: `${rect.height + 16}px`,
              backgroundColor: 'rgba(5, 5, 7, 0.85)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onClick={handleComplete}
          />
          
          {/* Spotlight Border Glow */}
          <div
            style={{
              position: 'fixed',
              left: `${rect.x - 8}px`,
              top: `${rect.y - 8}px`,
              width: `${rect.width + 16}px`,
              height: `${rect.height + 16}px`,
              borderRadius: '20px',
              border: '2px solid rgba(196, 164, 124, 0.4)',
              boxShadow: '0 0 25px rgba(196, 164, 124, 0.15)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            className="pointer-events-none"
          />
        </div>
      ) : (
        <div 
          className="fixed inset-0 bg-[#050507]/85 pointer-events-auto z-[98] animate-fade-in-overlay"
          onClick={handleComplete}
        />
      )}

      {/* Onboarding Dialog Card */}
      <div
        style={popupStyle}
        className="pointer-events-auto bg-[#0D0D11]/90 backdrop-blur-xl border border-[#C4A47C]/30 rounded-3xl p-6 shadow-[0_20px_50px_rgba(196,164,124,0.06)] animate-scale-in-card flex flex-col justify-between min-h-[170px]"
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-[#C4A47C]">
              <Sparkles size={12} className="animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]">
                Крок {currentStep + 1} з {steps.length}
              </span>
            </div>
            
            {/* Step Indicators */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                    i === currentStep ? 'w-4 bg-[#C4A47C]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Title & Body */}
          <h4 className="text-white text-xs font-black uppercase tracking-wider mb-2">
            {currentStepData.title}
          </h4>
          <p className="text-white/70 text-[10px] leading-relaxed font-medium">
            {currentStepData.text}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
          <button
            onClick={handleComplete}
            className="flex items-center gap-1.5 text-white/40 hover:text-white/80 text-[9px] font-black uppercase tracking-wider transition-colors active:scale-95 duration-200"
          >
            <EyeOff size={10} />
            Пропустити
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="p-2 bg-white/5 border border-[#C4A47C]/20 hover:bg-white/10 text-white/80 rounded-xl transition-all duration-200 active:scale-90"
              >
                <ChevronLeft size={12} />
              </button>
            )}

            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-[#C4A47C] to-[#E5C9A3] hover:from-[#B0936C] hover:to-[#C4A47C] text-black font-black uppercase tracking-widest px-4 py-2 rounded-xl text-[9px] flex items-center gap-1 shadow-lg shadow-[#C4A47C]/10 transition-all duration-300 active:scale-95 hover:scale-[1.02]"
            >
              {currentStep === steps.length - 1 ? (
                <>
                  Завершити
                  <Check size={10} />
                </>
              ) : (
                <>
                  Далі
                  <ChevronRight size={10} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
