'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { trackFBEvent } from '@/components/FacebookPixel';

interface QuestionnaireFormData {
  name: string;
  telegram: string;
  phone: string;
  instagram: string;
  purpose: string;
  difficulties: string;
  readiness: string;
  consent: boolean;
}

export default function PreRegistrationAnketaPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countryCode, setCountryCode] = useState<string>('UA');

  const { register, handleSubmit, control, formState: { errors } } = useForm<QuestionnaireFormData>({
    defaultValues: {
      name: '',
      telegram: '',
      phone: '',
      instagram: '',
      purpose: '',
      difficulties: '',
      readiness: '',
      consent: false,
    }
  });

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
      .catch(() => {});
  }, []);

  const onSubmit = async (data: QuestionnaireFormData) => {
    setLoading(true);

    const params = new URLSearchParams(window.location.search);
    const utms = {
      utm_source: params.get('utm_source') || 'direct',
      utm_medium: params.get('utm_medium') || '-',
      utm_campaign: params.get('utm_campaign') || '-',
      utm_term: params.get('utm_term') || '-',
      utm_content: params.get('utm_content') || '-'
    };

    const payload = {
      name: data.name,
      phone: data.phone,
      social: data.telegram,
      instagram: data.instagram,
      purpose: data.purpose,
      difficulties: data.difficulties,
      readiness: data.readiness,
      target_sheet: 'Анкета передзапису',
      visitor_id: localStorage.getItem('visitor_id') || '',
      page_path: '/anketa',
      full_url: window.location.href,
      ...utms
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
          content_category: 'Pre-registration'
        });

        // Save local metadata
        localStorage.setItem('lead_name', data.name);
        localStorage.setItem('lead_phone', data.phone);
        localStorage.setItem('lead_social', data.telegram);
        localStorage.setItem('lead_instagram', data.instagram);

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

  return (
    <div className="antialiased text-[#0F0F0F] bg-[#F9F9F9] min-h-screen font-sans pb-24">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        
        .font-sans { font-family: 'Manrope', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }

        .react-phone-input-custom .PhoneInputInput {
          width: 100%;
          background: transparent;
          border-bottom: 1px solid #E2E2E2;
          padding: 1rem 0;
          font-size: 1rem;
          color: #0F0F0F;
          outline: none;
          transition: border-color 0.2s;
        }

        .react-phone-input-custom .PhoneInputInput:focus {
          border-bottom-color: #000000;
        }

        .react-phone-input-custom .PhoneInputCountry {
          margin-right: 0.75rem;
        }
      `}</style>

      {/* HEADER */}
      <header className="py-6 px-6 md:px-12 flex justify-between items-center border-b border-black/5 bg-[#F9F9F9]/80 backdrop-blur-md sticky top-0 z-50">
        <span className="font-serif text-lg md:text-xl font-bold uppercase tracking-[0.2em] text-[#0F0F0F]">Створюй</span>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-12 md:mt-16 animate-fade-in">
        {/* HERO */}
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mb-3">Анкета передзапису</h1>
          <p className="text-sm md:text-base text-gray-500 font-light">Заповнюй форму і ти отримаєш:</p>
        </div>

        {/* BONUSES */}
        <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl shadow-sm space-y-4 mb-10">
          <p className="font-sans text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Гарантовані бонуси:</p>
          <ul className="space-y-4 font-sans text-sm text-gray-800">
            <li className="flex items-center gap-3">
              <span className="text-xl">🎁</span>
              <span>Чек-лист <strong>&ldquo;50 тем для контенту&rdquo;</strong></span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-xl">🔥</span>
              <span>Найвигідніші умови та ціни на навчання</span>
            </li>
          </ul>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
          {!success ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              {/* Name */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('name', { required: 'Введіть ваше ім’я', minLength: { value: 2, message: 'Мінімум 2 літери' } })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors text-black`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твоє ім'я</label>
                {errors.name && <span className="text-red-500 text-xs mt-1 block">{errors.name.message}</span>}
              </div>

              {/* Telegram */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('telegram', { required: 'Введіть Telegram нікнейм', minLength: { value: 3, message: 'Мінімум 3 символи' } })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.telegram ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors text-black`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твій нік у telegram (@нікнейм)</label>
                {errors.telegram && <span className="text-red-500 text-xs mt-1 block">{errors.telegram.message}</span>}
              </div>

              {/* Phone */}
              <div className="relative group react-phone-input-custom">
                <label className="text-gray-400 text-xs mb-1 block">Номер телефону (WhatsApp / Viber)</label>
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
                      className="w-full"
                    />
                  )}
                />
                {errors.phone && <span className="text-red-500 text-xs mt-1 block">{errors.phone.message}</span>}
              </div>

              {/* Instagram */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('instagram', { required: 'Введіть Instagram нікнейм або лінк' })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.instagram ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors text-black`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твій інстаграм (посилання чи нікнейм)</label>
                {errors.instagram && <span className="text-red-500 text-xs mt-1 block">{errors.instagram.message}</span>}
              </div>

              {/* Purpose */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-800 block">З якою метою цікавишся візуалом та контентом?</label>
                <div className="space-y-2">
                  {[
                    { id: 'personal', label: 'для свого особистого-експертного блогу' },
                    { id: 'business', label: 'для свого бізнесу' },
                    { id: 'client', label: 'створюю (хочу створювати) візуал та контент для інших' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-gray-100 hover:border-black transition-colors">
                      <input 
                        type="radio" 
                        value={option.label}
                        {...register('purpose', { required: 'Оберіть один варіант' })}
                        className="accent-black w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-gray-700 select-none group-hover:text-black transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.purpose && <span className="text-red-500 text-xs block">{errors.purpose.message}</span>}
              </div>

              {/* Difficulties */}
              <div className="relative group">
                <textarea 
                  {...register('difficulties', { required: 'Будь ласка, опишіть ваші складнощі' })}
                  placeholder=" " 
                  rows={3}
                  className={`peer w-full bg-transparent border-b ${errors.difficulties ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors text-black resize-none`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Які зараз складнощі з блогом?</label>
                {errors.difficulties && <span className="text-red-500 text-xs mt-1 block">{errors.difficulties.message}</span>}
              </div>

              {/* Readiness */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-800 block">Наскільки ти готова до роботи над контентом та візуалом</label>
                <div className="space-y-2">
                  {[
                    { id: 'not_ready', label: 'не дуже готова, просто цікаво дізнатись деталі' },
                    { id: 'no_time', label: 'готова, але постійно не можу знайти час' },
                    { id: 'fully_ready', label: 'готова на всі 100%' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center gap-3 cursor-pointer group p-3 rounded-lg border border-gray-100 hover:border-black transition-colors">
                      <input 
                        type="radio" 
                        value={option.label}
                        {...register('readiness', { required: 'Оберіть один варіант' })}
                        className="accent-black w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs md:text-sm text-gray-700 select-none group-hover:text-black transition-colors">{option.label}</span>
                    </label>
                  ))}
                </div>
                {errors.readiness && <span className="text-red-500 text-xs block">{errors.readiness.message}</span>}
              </div>

              {/* Consent */}
              <div className="space-y-2">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    {...register('consent', { required: 'Для відправки необхідно дати згоду на обробку даних' })}
                    className="accent-black mt-1 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500 select-none group-hover:text-gray-700 transition-colors leading-relaxed">
                    Ознайомлений(а) з політикою конфіденційності і даю згоду на обробку персональних даних
                  </span>
                </label>
                {errors.consent && <span className="text-red-500 text-xs block">{errors.consent.message}</span>}
              </div>

              {/* Submit */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-5 text-xs md:text-sm font-bold uppercase tracking-[0.25em] hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 flex justify-center items-center gap-3 disabled:bg-gray-400"
              >
                <span>{loading ? 'Відправка...' : 'Відправити'}</span>
                {loading && (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
              </button>

            </form>
          ) : (
            // SUCCESS STATE
            <div className="text-center py-8 space-y-6 animate-fade-in">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50">
                <svg className="h-10 w-10 text-black" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-gray-900">Дякуємо!</h3>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed max-w-sm mx-auto">
                Після заповнення анкету я або моя команда напишемо тобі та підберемо час для коротенької зустрічі, щоб розказати тобі про всі деталі та як я зможу допомогти💛
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
