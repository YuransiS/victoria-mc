'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { trackFBEvent } from '@/components/FacebookPixel';
import { useSearchParams } from 'next/navigation';
import { getClientMarketingAttribution, normalizePhone, normalizeTelegram, normalizeInstagram } from '@/lib/enrichment';

interface QuestionnaireFormData {
  name: string;
  telegram: string;
  phone: string;
  instagram: string;
  purpose: string;
  subscription_duration: string;
  difficulties: string;
  readiness: string;
  consent: boolean;
  team_call: boolean;
}

const SparkleSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 0L14.6 9.4L24 12L14.6 14.6L12 24L9.4 14.6L0 12L9.4 9.4L12 0Z" fill="currentColor" />
  </svg>
);

const DecorativeLines = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
    <svg className="absolute top-[15%] left-[-15%] w-[45%] h-auto text-[#ebd8b8]/10 opacity-30 animate-float" viewBox="0 0 100 100">
      <path d="M0,50 Q25,20 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" />
    </svg>
    <svg className="absolute bottom-[20%] right-[-15%] w-[45%] h-auto text-[#ebd8b8]/10 opacity-30 animate-float-delayed" viewBox="0 0 100 100">
      <path d="M0,50 Q25,80 50,50 T100,50" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1 2" />
    </svg>
  </div>
);

export default function PreRegistrationAnketaPage() {
  return (
    <Suspense fallback={
      <div className="antialiased text-[#1a1c1c] min-h-screen relative font-manrope bg-[#b5a78c] bg-[url('/subtle_paper.png')] bg-repeat flex items-center justify-center">
        <div className="absolute inset-0 z-0 bg-[url('/anketa_bg_dark.png')] bg-cover bg-center opacity-90" />
        <div className="relative z-10 text-center space-y-4">
          <div className="animate-spin h-8 w-8 text-[#ebd8b8] mx-auto border-4 border-t-transparent border-[#ebd8b8] rounded-full"></div>
          <p className="text-[#ebd8b8] text-sm uppercase tracking-widest font-bold">Завантаження...</p>
        </div>
      </div>
    }>
      <AnketaFormContent />
    </Suspense>
  );
}

function AnketaFormContent() {
  const searchParams = useSearchParams();
  const rawV = searchParams.get('v') || '1';
  const version = rawV.trim() === '2' ? '2' : '1';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('UA');

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<QuestionnaireFormData>({
    defaultValues: {
      name: '',
      telegram: '',
      phone: '',
      instagram: '',
      purpose: '',
      subscription_duration: '',
      difficulties: '',
      readiness: '',
      consent: false,
      team_call: false,
    }
  });

  const purposeValue = watch('purpose');
  const subscriptionDurationValue = watch('subscription_duration');
  const readinessValue = watch('readiness');
  const consentValue = watch('consent');
  const teamCallValue = watch('team_call');

  useEffect(() => {
    if (success) {
      const search = window.location.search || '';
      const timer = setTimeout(() => {
        window.location.href = `/anketa/thanks${search}`;
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    trackFBEvent('PageView', {});

    // Resolve user country on mount using Vercel Geo Endpoint
    fetch('/api/country')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => { });
  }, []);

  const onSubmit = async (data: QuestionnaireFormData) => {
    setLoading(true);

    const marketingAttr = getClientMarketingAttribution({ page_path: '/anketa', page_url: window.location.href });
    const normalizedPhoneVal = normalizePhone(data.phone);
    const cleanTg = normalizeTelegram(data.telegram);
    const cleanInstagram = normalizeInstagram(data.instagram);

    const payload = {
      name: data.name.trim(),
      phone: normalizedPhoneVal || data.phone,
      social: cleanTg ? `@${cleanTg}` : (data.telegram || ''),
      instagram: cleanInstagram || data.instagram,
      purpose: data.purpose,
      subscription_duration: data.subscription_duration,
      difficulties: data.difficulties,
      readiness: data.readiness,
      team_call: data.team_call,
      target_sheet: 'Анкета передзапису',
      visitor_id: marketingAttr.visitor_uuid || localStorage.getItem('visitor_id') || '',
      anketa_version: version,
      amount: 0.00,
      currency: 'UAH',
      product_type: 'lead',
      status: 'new',
      ...marketingAttr,
      marketing: marketingAttr
    };

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Track Lead in pixel
        trackFBEvent('Lead', {
          content_name: 'Анкета предзапису',
          content_category: 'Pre-registration',
          value: 0.00,
          currency: 'UAH',
          ...marketingAttr
        });

        // Save local metadata
        localStorage.setItem('lead_name', data.name.trim());
        localStorage.setItem('lead_phone', normalizedPhoneVal || data.phone);
        localStorage.setItem('lead_social', cleanTg ? `@${cleanTg}` : (data.telegram || ''));
        localStorage.setItem('lead_instagram', cleanInstagram || data.instagram);

        setSuccess(true);
      } else {
        alert('Щось пішло не так. Спробуйте ще раз.');
      }
    } catch (err) {
      console.error(err);
      alert('Помилка мережі. Перевірте з’єднання.');
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (validationErrors: any) => {
    const errorKeys = Object.keys(validationErrors);
    if (errorKeys.length > 0) {
      const firstError = errorKeys[0];
      const targetElement = document.getElementById(`form-group-${firstError}`);
      if (targetElement) {
        // Scroll smoothly to the invalid element
        targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Add shake animation
        targetElement.classList.add('animate-shake');
        setTimeout(() => {
          targetElement.classList.remove('animate-shake');
        }, 600);
      }
    }
  };

  return (
    <div className="antialiased text-[#1a1c1c] min-h-screen relative font-manrope pb-24 overflow-y-auto">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        
        .font-manrope { font-family: 'Manrope', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }

        input, textarea, select, button {
          font-family: 'Manrope', sans-serif;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(3deg); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(15px) rotate(-3deg); }
        }

        @keyframes sparkle {
          0%, 100% { transform: scale(0.8) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.1) rotate(90deg); opacity: 1; }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%, 45%, 75% { transform: translateX(-8px); }
          30%, 60%, 90% { transform: translateX(8px); }
        }

        @keyframes draw-check {
          to { stroke-dashoffset: 0; }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }

        .animate-sparkle {
          animation: sparkle 3s ease-in-out infinite;
        }

        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }

        .path-checkmark {
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
          animation: draw-check 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 0.2s;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .react-phone-input-custom .PhoneInputInput {
          width: 100%;
          background: transparent;
          border: none;
          padding: 0.75rem 0;
          font-size: 1rem;
          color: #1a1c1c;
          outline: none;
        }

        .react-phone-input-custom .PhoneInputInput:focus {
          border-bottom-color: transparent;
          box-shadow: none;
        }

        .react-phone-input-custom .PhoneInputCountry {
          margin-right: 0.75rem;
        }
      `}</style>

      {/* BACKGROUND - SCROLLABLE ON MOBILE, FIXED ON DESKTOP */}
      <div className="absolute md:fixed inset-0 z-0 bg-[#b5a78c] bg-[url('/subtle_paper.png')] bg-repeat">
        <div
          className="absolute inset-0 bg-[url('/anketa_bg_dark.png')] bg-cover bg-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/20" />
      </div>

      <DecorativeLines />

      {/* HEADER */}
      <header className="relative py-5 px-6 md:px-12 flex justify-between items-center border-b border-[#faf8f2]/10 bg-[#484338]/90 backdrop-blur-md sticky top-0 z-50 shadow-[0_2px_20px_rgba(0,0,0,0.15)]">
        <span className="font-serif text-lg md:text-xl font-bold uppercase tracking-[0.25em] text-[#faf8f2]">Створюй</span>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-[#ebd8b8] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ebd8b8] animate-pulse"></span>
          <span>Анкета передзапису</span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-xl mx-auto px-5 mt-10 md:mt-16 animate-fade-in-up">
        {/* HERO HEADER */}
        <div className="text-center mb-8 relative">
          <SparkleSVG className="absolute -top-6 left-[15%] w-5 h-5 text-[#ebd8b8] opacity-80 animate-sparkle" />
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight text-[#faf8f2] mb-3">Анкета передзапису</h1>
          <p className="text-xs md:text-sm text-[#ebd8b8] uppercase tracking-widest font-bold">Заповнюй форму і отримай гарантовані бонуси:</p>
        </div>

        {/* BONUSES - REDESIGNED PREMIUM GRID */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-2 px-1">
            <span className="h-[1px] flex-grow bg-[#ebd8b8]/20"></span>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ebd8b8] whitespace-nowrap flex items-center gap-1.5">
              <SparkleSVG className="w-3.5 h-3.5 text-[#ebd8b8] animate-pulse" />
              Твої ексклюзивні бонуси за заповнення
            </span>
            <span className="h-[1px] flex-grow bg-[#ebd8b8]/20"></span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(version === '2' ? [
              {
                type: 'Консультація',
                title: 'Консультація з командою',
                desc: 'Де ми розберемо твій блог та ситуацію і підкажемо рішення',
                icon: '💬'
              },
              {
                type: 'Найкраща ціна',
                title: 'Максимальна знижка',
                desc: 'Гарантоване закріплення найвигідніших спец-умов та ранній доступ до навчання',
                icon: '🔥'
              },
              {
                type: 'Інструкція',
                title: '«Структура прогріву»',
                desc: 'Детальна інструкція, де я зібрала головні фішки прогріву, щоб аудиторія після вашого контенту сама захотіла у вас купити продукт або послугу',
                icon: '📝'
              }
            ] : [
              {
                type: 'Чек-лист',
                title: '«50 тем для контенту»',
                desc: 'Готові ідеї, які залучать цільову аудиторію та спростять створення сторіз та дописів',
                icon: '🎁'
              },
              {
                type: 'Найкраща ціна',
                title: 'Максимальна знижка',
                desc: 'Гарантоване закріплення найвигідніших спец-умов та ранній доступ до навчання',
                icon: '🔥'
              },
              {
                type: 'Спільнота',
                title: 'Закритий канал',
                desc: 'Доступ до закритого телеграм каналу передзапису з інсайдерською інформацією',
                icon: '🔒'
              }
            ]).map((bonus, idx) => (
              <div key={idx} className="relative overflow-hidden p-5 rounded-2xl border border-[#5d5f2c]/25 bg-gradient-to-br from-[#e6e1d4]/95 to-[#d6cfbe]/90 shadow-[0_10px_25px_rgba(93,95,44,0.04)] hover:shadow-[0_12px_30px_rgba(93,95,44,0.06)] hover:border-[#5d5f2c]/50 transition-all duration-300 group">
                <div className="absolute top-[-15px] right-[-15px] w-12 h-12 rounded-full bg-[#5d5f2c]/5 blur-lg group-hover:bg-[#5d5f2c]/10 transition-colors" />
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#5d5f2c] text-[#faf8f2] shadow-[0_8px_20px_rgba(93,95,44,0.25)] shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl">{bonus.icon}</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#5d5f2c]/85">{bonus.type}</span>
                    <h4 className="text-xs md:text-sm font-bold text-[#1a1c1c] leading-snug">{bonus.title}</h4>
                    <p className="text-[10px] text-[#1a1c1c]/70 leading-normal font-light">{bonus.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FORM CONTAINER - RICH MEDIUM-DARK WARM CREAM CARD */}
        <div className="bg-[#e6e1d4]/95 border border-[#5d5f2c]/25 p-6 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(93,95,44,0.08)] backdrop-blur-md relative overflow-hidden">
          {/* Subtle line background detail */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#5d5f2c]/30 to-transparent" />

          {!success ? (
            <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-8">

              {/* Name */}
              <div id="form-group-name" className="space-y-2 transition-all duration-300">
                <label className="text-xs font-bold text-[#5d5f2c] uppercase tracking-wider block font-manrope">Твоє ім'я</label>
                <input
                  type="text"
                  {...register('name', { required: 'Введіть ваше ім’я', minLength: { value: 2, message: 'Мінімум 2 літери' } })}
                  placeholder="Введіть ім'я"
                  className={`w-full bg-white rounded-xl border ${errors.name ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#5d5f2c]/20 focus:border-[#5d5f2c] focus:ring-1 focus:ring-[#5d5f2c]'} px-4 py-3.5 text-base focus:outline-none transition-all text-[#1a1c1c] shadow-sm`}
                />
                {errors.name && <span className="text-red-500/90 text-xs mt-0.5 block font-manrope">{errors.name.message}</span>}
              </div>

              {/* Telegram */}
              <div id="form-group-telegram" className="space-y-2 transition-all duration-300">
                <label className="text-xs font-bold text-[#5d5f2c] uppercase tracking-wider block font-manrope">Твій нік у telegram (@нікнейм)</label>
                <input
                  type="text"
                  {...register('telegram', { required: 'Введіть Telegram нікнейм', minLength: { value: 3, message: 'Мінімум 3 символи' } })}
                  placeholder="@username"
                  className={`w-full bg-white rounded-xl border ${errors.telegram ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#5d5f2c]/20 focus:border-[#5d5f2c] focus:ring-1 focus:ring-[#5d5f2c]'} px-4 py-3.5 text-base focus:outline-none transition-all text-[#1a1c1c] shadow-sm`}
                />
                {errors.telegram && <span className="text-red-500/90 text-xs mt-0.5 block font-manrope">{errors.telegram.message}</span>}
              </div>

              {/* Phone */}
              <div id="form-group-phone" className="space-y-2 react-phone-input-custom transition-all duration-300">
                <label className="text-xs font-bold text-[#5d5f2c] uppercase tracking-wider block font-manrope">Номер телефону (WhatsApp / Viber)</label>
                <div className={`w-full bg-white rounded-xl border ${errors.phone ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500' : 'border-[#5d5f2c]/20 focus-within:border-[#5d5f2c] focus-within:ring-1 focus-within:ring-[#5d5f2c]'} px-4 py-1.5 transition-all shadow-sm`}>
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: 'Введіть номер телефону',
                      validate: (val) => isValidPhoneNumber(val || '') || 'Некоректний номер телефону'
                    }}
                    render={({ field: { onChange, value } }) => (
                      <PhoneInput
                        international
                        defaultCountry={countryCode as any}
                        value={value}
                        onChange={onChange}
                        className="w-full bg-transparent"
                      />
                    )}
                  />
                </div>
                {errors.phone && <span className="text-red-500/90 text-xs mt-0.5 block font-manrope">{errors.phone.message}</span>}
              </div>

              {/* Instagram */}
              <div id="form-group-instagram" className="space-y-2 transition-all duration-300">
                <label className="text-xs font-bold text-[#5d5f2c] uppercase tracking-wider block font-manrope">Твій інстаграм (посилання чи нікнейм)</label>
                <input
                  type="text"
                  {...register('instagram', { required: 'Введіть Instagram нікнейм або лінк' })}
                  placeholder="Введіть нікнейм або лінк"
                  className={`w-full bg-white rounded-xl border ${errors.instagram ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#5d5f2c]/20 focus:border-[#5d5f2c] focus:ring-1 focus:ring-[#5d5f2c]'} px-4 py-3.5 text-base focus:outline-none transition-all text-[#1a1c1c] shadow-sm`}
                />
                {errors.instagram && <span className="text-red-500/90 text-xs mt-0.5 block font-manrope">{errors.instagram.message}</span>}
              </div>

              {/* Purpose */}
              <div id="form-group-purpose" className="space-y-4 transition-all duration-300">
                <label className="text-sm font-bold text-[#1a1c1c] block font-manrope">З якою метою цікавишся візуалом та контентом?</label>
                <div className="space-y-3">
                  {[
                    { id: 'personal', label: 'для свого особистого-експертного блогу' },
                    { id: 'business', label: 'для свого бізнесу' },
                    { id: 'client', label: 'створюю (хочу створювати) візуал та контент для інших' }
                  ].map((option) => {
                    const isSelected = purposeValue === option.label;
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 select-none group ${isSelected
                          ? 'border-[#5d5f2c] bg-[#5d5f2c]/10 shadow-[0_4px_20px_rgba(93,95,44,0.04)]'
                          : 'border-[#5d5f2c]/15 bg-white hover:bg-white/90 hover:border-[#5d5f2c]/40'
                          }`}
                      >
                        <input
                          type="radio"
                          value={option.label}
                          {...register('purpose', { required: 'Оберіть один варіант' })}
                          className="sr-only"
                        />
                        {/* Custom radio button design */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-[#5d5f2c] bg-[#5d5f2c]' : 'border-gray-400'
                          }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-0'
                            }`} />
                        </div>
                        <span className={`text-xs md:text-sm transition-colors ${isSelected ? 'text-[#1a1c1c] font-semibold' : 'text-[#1a1c1c]/70'
                          }`}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.purpose && <span className="text-red-500/90 text-xs block font-manrope">{errors.purpose.message}</span>}
              </div>

              {/* Subscription Duration */}
              <div id="form-group-subscription_duration" className="space-y-4 transition-all duration-300">
                <label className="text-sm font-bold text-[#1a1c1c] block font-manrope">Як давно підписана на мене?</label>
                <div className="space-y-3">
                  {[
                    { id: 'under_month', label: 'до місяця' },
                    { id: 'one_three_months', label: '1-3 місяці' },
                    { id: 'over_six_months', label: 'більше 6 місяців' }
                  ].map((option) => {
                    const isSelected = subscriptionDurationValue === option.label;
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 select-none group ${isSelected
                          ? 'border-[#5d5f2c] bg-[#5d5f2c]/10 shadow-[0_4px_20px_rgba(93,95,44,0.04)]'
                          : 'border-[#5d5f2c]/15 bg-white hover:bg-white/90 hover:border-[#5d5f2c]/40'
                          }`}
                      >
                        <input
                          type="radio"
                          value={option.label}
                          {...register('subscription_duration', { required: 'Оберіть один варіант' })}
                          className="sr-only"
                        />
                        {/* Custom radio button design */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-[#5d5f2c] bg-[#5d5f2c]' : 'border-gray-400'
                          }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-0'
                            }`} />
                        </div>
                        <span className={`text-xs md:text-sm transition-colors ${isSelected ? 'text-[#1a1c1c] font-semibold' : 'text-[#1a1c1c]/70'
                          }`}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.subscription_duration && <span className="text-red-500/90 text-xs block font-manrope">{errors.subscription_duration.message}</span>}
              </div>

              {/* Difficulties - ADAPTIVE EXPANDING SINGLE-LINE TEXTAREA */}
              <div id="form-group-difficulties" className="space-y-2 transition-all duration-300">
                <label className="text-xs font-bold text-[#5d5f2c] uppercase tracking-wider block font-manrope">Які зараз складнощі з блогом?</label>
                <textarea
                  {...register('difficulties', { required: 'Будь ласка, опишіть ваші складнощі' })}
                  placeholder="Опишіть ваші складнощі..."
                  rows={2}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = `${target.scrollHeight}px`;
                  }}
                  className={`w-full bg-white rounded-xl border ${errors.difficulties ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-[#5d5f2c]/20 focus:border-[#5d5f2c] focus:ring-1 focus:ring-[#5d5f2c]'} px-4 py-3 text-base focus:outline-none transition-all text-[#1a1c1c] shadow-sm min-h-[80px] overflow-hidden resize-none font-manrope`}
                />
                {errors.difficulties && <span className="text-red-500/90 text-xs mt-0.5 block font-manrope">{errors.difficulties.message}</span>}
              </div>

              {/* Readiness */}
              <div id="form-group-readiness" className="space-y-4 transition-all duration-300">
                <label className="text-sm font-bold text-[#1a1c1c] block font-manrope">Наскільки ти готова до роботи над контентом та візуалом?</label>
                <div className="space-y-3">
                  {[
                    { id: 'not_ready', label: 'не дуже готова, просто цікаво дізнатись деталі' },
                    { id: 'no_time', label: 'готова, але постійно не можу знайти час' },
                    { id: 'fully_ready', label: 'готова на всі 100%' }
                  ].map((option) => {
                    const isSelected = readinessValue === option.label;
                    return (
                      <label
                        key={option.id}
                        className={`flex items-center gap-4 cursor-pointer p-4 rounded-xl border transition-all duration-300 select-none group ${isSelected
                          ? 'border-[#5d5f2c] bg-[#5d5f2c]/10 shadow-[0_4px_20px_rgba(93,95,44,0.04)]'
                          : 'border-[#5d5f2c]/15 bg-white hover:bg-white/90 hover:border-[#5d5f2c]/40'
                          }`}
                      >
                        <input
                          type="radio"
                          value={option.label}
                          {...register('readiness', { required: 'Оберіть один варіант' })}
                          className="sr-only"
                        />
                        {/* Custom radio button design */}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'border-[#5d5f2c] bg-[#5d5f2c]' : 'border-gray-400'
                          }`}>
                          <div className={`w-2.5 h-2.5 rounded-full bg-white transition-transform duration-300 ${isSelected ? 'scale-100' : 'scale-0'
                            }`} />
                        </div>
                        <span className={`text-xs md:text-sm transition-colors ${isSelected ? 'text-[#1a1c1c] font-semibold' : 'text-[#1a1c1c]/70'
                          }`}>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
                {errors.readiness && <span className="text-red-500/90 text-xs block font-manrope">{errors.readiness.message}</span>}
              </div>

              {/* Consent */}
              <div id="form-group-consent" className="space-y-2 transition-all duration-300">
                <label className="flex items-start gap-4 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    {...register('consent', { required: 'Для відправки необхідно дати згоду на обробку даних' })}
                    className="sr-only"
                  />
                  {/* Custom checkbox design */}
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${consentValue ? 'border-[#5d5f2c] bg-[#5d5f2c]' : 'border-gray-400'
                    }`}>
                    <svg className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${consentValue ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-xs text-gray-500 leading-relaxed font-manrope group-hover:text-[#1a1c1c] transition-colors">
                    Ознайомлений(а) з політикою конфіденційності і даю згоду на обробку персональних даних
                  </span>
                </label>
                {errors.consent && <span className="text-red-500/90 text-xs block font-manrope">{errors.consent.message}</span>}
              </div>

              {/* Team Call Expectation */}
              <div id="form-group-team_call" className="space-y-2 transition-all duration-300">
                <label className="flex items-start gap-4 cursor-pointer group select-none">
                  <input
                    type="checkbox"
                    {...register('team_call', { required: 'Будь ласка, підтвердьте, що ви очікуєте на дзвінок від команди' })}
                    className="sr-only"
                  />
                  {/* Custom checkbox design */}
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-all ${teamCallValue ? 'border-[#5d5f2c] bg-[#5d5f2c]' : 'border-gray-400'
                    }`}>
                    <svg className={`w-3.5 h-3.5 text-white transition-transform duration-300 ${teamCallValue ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <span className="text-xs md:text-sm font-semibold text-[#1a1c1c] leading-relaxed font-manrope group-hover:text-[#5d5f2c] transition-colors">
                    Я очікую на дзвінок від команди
                  </span>
                </label>
                {errors.team_call && <span className="text-red-500/90 text-xs block font-manrope">{errors.team_call.message}</span>}
              </div>

              {/* Submit */}
              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#5d5f2c] text-white py-5 rounded-xl text-xs md:text-sm font-bold uppercase tracking-[0.25em] hover:bg-[#484a22] transition-all shadow-[0_10px_30px_rgba(93,95,44,0.15)] hover:shadow-[0_15px_35px_rgba(93,95,44,0.25)] transform hover:-translate-y-0.5 active:translate-y-0 flex justify-center items-center gap-3 disabled:bg-gray-400 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Відправка...' : 'Відправити'}</span>
                  {loading && (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                </button>

                {/* Footnote under submit button */}
                <p className="text-center text-[10px] md:text-xs text-[#1a1c1c]/65 leading-relaxed font-light italic px-2">
                  Після заповнення анкети я або моя команда напишемо тобі та підберемо час для коротенької зустрічі, щоб розказати тобі про всі деталі та як я зможу допомогти💛
                </p>
              </div>

            </form>
          ) : (
            // SUCCESS STATE
            <div className="text-center py-10 space-y-6 animate-fade-in relative">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#5d5f2c]/10 border border-[#5d5f2c]/20 shadow-[0_10px_30px_rgba(93,95,44,0.05)]">
                <svg className="h-10 w-10 text-[#5d5f2c]" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" className="path-checkmark" />
                </svg>
              </div>
              <h3 className="font-serif text-3xl font-bold text-[#1a1c1c] tracking-tight">Дякуємо!</h3>
              <p className="text-xs md:text-sm text-[#1a1c1c]/70 leading-relaxed max-w-sm mx-auto font-light">
                Твою анкету успішно надіслано! Зараз тебе буде перенаправлено на коротке відео з подарунками та інструкцією🤍
              </p>

              <div className="pt-6">
                <a
                  href="/anketa/thanks"
                  className="inline-block bg-[#5d5f2c] text-white px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-[0.2em] shadow-lg hover:bg-[#484a22] transition-all hover:scale-[1.02] active:scale-[0.98] duration-300"
                >
                  Переглянути відео та бонуси →
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
