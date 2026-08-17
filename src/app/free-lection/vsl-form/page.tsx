'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import intlTelInput from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';
import './globals.css';
import { trackFBEvent } from '@/components/FacebookPixel';

// Types for form data
interface FormData {
  name: string;
  phone_raw: string;
  social: string;
  instagram: string;
  niche: string;
  target_sheet: string;
}

const REDIRECT_URL = "https://telegram.me/+idsZRC5s1yo0YmUy";

const names = ["Олена", "Марія", "Ірина", "Анастасія", "Тетяна", "Юлія", "Наталія", "Світлана", "Оксана", "Вікторія", "Дарина", "Анна", "Христина"];
const actions = ["заповнила анкету", "забронювала місце", "щойно переглянула відео-урок", "хоче на курс"];

export default function StvoryuiPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [liveCount, setLiveCount] = useState(6);
  const [toast, setToast] = useState<{ name: string; action: string; show: boolean }>({
    name: '',
    action: '',
    show: false
  });
  const [timeLeft, setTimeLeft] = useState('');
  const [showForm, setShowForm] = useState(true);

  const phoneInputRef = useRef<HTMLInputElement>(null);
  const itiRef = useRef<any>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>();

  // Video tracking state
  const watchedSecondsRef = useRef(0);
  const playedRef = useRef(false);
  const fullyWatchedRef = useRef(false);
  const lastSavedSecondsRef = useRef(0);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    // 1. Get visitor ID (or generate it immediately to prevent child-first mount race condition)
    let visitorId = localStorage.getItem('visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      localStorage.setItem('visitor_id', visitorId);
    }

    // Helper to send progress
    const sendProgress = async (forceStatus?: string) => {
      try {
        const status = forceStatus || (watchedSecondsRef.current >= 1200 ? 'полностью посмотрел' : (playedRef.current ? 'Дивився відео' : ''));
        if (status === 'полностью посмотрел') {
          fullyWatchedRef.current = true;
        }
        const spContactId = localStorage.getItem('sp_contact_id');
        await fetch('/api/video-progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitor_id: visitorId,
            sp_contact_id: spContactId || undefined,
            seconds_watched: Math.round(watchedSecondsRef.current),
            current_time: playerRef.current && typeof playerRef.current.getCurrentTime === 'function' ? Math.round(playerRef.current.getCurrentTime()) : 0,
            played: playedRef.current,
            status
          })
        });
        lastSavedSecondsRef.current = watchedSecondsRef.current;
      } catch (err) {
        console.error('Failed to save progress:', err);
      }
    };

    // Load YT API if not present
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let interval: NodeJS.Timeout;

    const initPlayer = () => {
      playerRef.current = new (window as any).YT.Player('vsl-video-player', {
        events: {
          onStateChange: (event: any) => {
            // YT.PlayerState.PLAYING = 1
            if (event.data === 1) {
              if (!playedRef.current) {
                playedRef.current = true;
                sendProgress();
              }
              
              if (!localStorage.getItem('vsl_play_start_time')) {
                localStorage.setItem('vsl_play_start_time', Date.now().toString());
              }
              
              // Start tracking interval
              interval = setInterval(() => {
                watchedSecondsRef.current += 1;
                
                const watchedTime = watchedSecondsRef.current;
                const currentTime = playerRef.current && typeof playerRef.current.getCurrentTime === 'function' 
                  ? playerRef.current.getCurrentTime() 
                  : 0;
                
                if ((watchedTime >= 1200 || currentTime >= 1200) && !fullyWatchedRef.current) {
                  fullyWatchedRef.current = true;
                  sendProgress('полностью посмотрел');
                } else if (watchedTime - lastSavedSecondsRef.current >= 30) {
                  sendProgress();
                }
              }, 1000);
            } else {
              // Paused, ended, etc.
              clearInterval(interval);
              if (watchedSecondsRef.current - lastSavedSecondsRef.current >= 5) {
                sendProgress();
              }
            }
          }
        }
      });
    };

    // Global callback for YT Player API
    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      clearInterval(interval);
      if (playedRef.current && watchedSecondsRef.current - lastSavedSecondsRef.current >= 2) {
        sendProgress();
      }
    };
  }, []);

  // Restore data from localStorage
  useEffect(() => {
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');

    const savedInstagram = localStorage.getItem('lead_instagram');

    if (savedName) setValue('name', savedName);
    if (savedSocial) setValue('social', savedSocial);
    if (savedInstagram) setValue('instagram', savedInstagram);
    
    // Restore phone with delay to ensure iti is initialized
    if (savedPhone) {
      const timer = setTimeout(() => {
        if (itiRef.current) {
          itiRef.current.setNumber(savedPhone);
        } else if (phoneInputRef.current) {
          phoneInputRef.current.value = savedPhone;
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [setValue]);

  // Watch and save to localStorage
  const watchedName = watch('name');
  const watchedSocial = watch('social');
  const watchedPhoneRaw = watch('phone_raw');

  const watchedInstagram = watch('instagram');

  useEffect(() => {
    if (watchedName) localStorage.setItem('lead_name', watchedName);
  }, [watchedName]);

  useEffect(() => {
    if (watchedSocial) localStorage.setItem('lead_social', watchedSocial);
  }, [watchedSocial]);

  useEffect(() => {
    if (watchedInstagram) localStorage.setItem('lead_instagram', watchedInstagram);
  }, [watchedInstagram]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (itiRef.current) {
        const fullNumber = itiRef.current.getNumber();
        if (fullNumber) localStorage.setItem('lead_phone', fullNumber);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [watchedPhoneRaw]);

  useEffect(() => {
    trackFBEvent('ViewContent', {
      content_name: 'Анкета СТВОРЮЙ',
      content_category: 'Landing Page'
    });
  }, []);

  // Evergreen 24h countdown timer
  useEffect(() => {
    const TIMER_KEY = 'vsl_timer_start_time';
    let startTime = localStorage.getItem(TIMER_KEY);
    if (!startTime) {
      startTime = Date.now().toString();
      localStorage.setItem(TIMER_KEY, startTime);
    }

    const startTimestamp = parseInt(startTime, 10);
    const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const diff = endTimestamp - now;
      if (diff <= 0) {
        setTimeLeft('00:00:00');
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, '0');
      setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Form is shown immediately

  // Initialize intl-tel-input
  useEffect(() => {
    if (phoneInputRef.current && !itiRef.current) {
      itiRef.current = intlTelInput(phoneInputRef.current, {
        initialCountry: "auto",
        geoIpLookup: (callback: (countryCode: string) => void) => {
          fetch("/api/country")
            .then((res) => res.json())
            .then((data) => callback(data.country?.toLowerCase() || "ua"))
            .catch(() => callback("ua"));
        },
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/26.9.2/js/utils.js",
        separateDialCode: true,
        strictMode: true,
      } as any);
    }

    return () => {
      if (itiRef.current) {
        itiRef.current.destroy();
        itiRef.current = null;
      }
    };
  }, []);

  // Live Counter Logic
  useEffect(() => {
    const updateCounter = () => {
      setLiveCount(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        let next = prev + change;
        if (next < 4) next = 4;
        if (next > 12) next = 10;
        return next;
      });
      const nextUpdate = Math.floor(Math.random() * (15000 - 5000) + 5000);
      setTimeout(updateCounter, nextUpdate);
    };
    const timer = setTimeout(updateCounter, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Notification Logic
  const nextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      // If showForm is false, filter out form-related actions
      const availableActions = showForm
        ? actions
        : actions.filter(a => a !== "заповнила анкету" && a !== "забронювала місце");

      const randomAction = availableActions[Math.floor(Math.random() * availableActions.length)];
      
      setToast({ name: randomName, action: randomAction, show: true });
      
      toastTimeoutRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 4000);

      const nextTime = Math.floor(Math.random() * (25000 - 10000) + 10000);
      nextTimeoutRef.current = setTimeout(showNotification, nextTime);
    };

    nextTimeoutRef.current = setTimeout(showNotification, 5000);

    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [showForm]);

  const formInteractionTrackedRef = useRef(false);

  const trackFormInteraction = async () => {
    if (formInteractionTrackedRef.current) return;
    formInteractionTrackedRef.current = true;

    try {
      const visitorId = localStorage.getItem('visitor_id');
      if (!visitorId) return;

      const currentTime = playerRef.current && typeof playerRef.current.getCurrentTime === 'function' 
        ? Math.round(playerRef.current.getCurrentTime()) 
        : 0;

      const spContactId = localStorage.getItem('sp_contact_id');

      await fetch('/api/video-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          sp_contact_id: spContactId || undefined,
          seconds_watched: Math.round(watchedSecondsRef.current),
          current_time: currentTime,
          played: playedRef.current,
          wants_to_fill: true
        })
      });
    } catch (err) {
      console.error('Failed to track form interaction:', err);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    
    // Get full phone number (E.164) or fallback to raw input value
    let fullPhone = '';
    if (itiRef.current) {
      if (!itiRef.current.isValidNumber()) {
        alert("Будь ласка, введіть коректний номер телефону");
        setLoading(false);
        return;
      }
      fullPhone = itiRef.current.getNumber();
    }
    if (!fullPhone && phoneInputRef.current) {
      fullPhone = phoneInputRef.current.value.trim();
    }
    
    // Get UTMs from URL or fallback to localStorage
    const params = new URLSearchParams(window.location.search);
    const hasUrlUtms = params.get('utm_source') || params.get('utm_medium') || params.get('utm_campaign');
    
    let utms = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };

    if (!hasUrlUtms) {
      try {
        const savedUtms = JSON.parse(localStorage.getItem('last_utms') || localStorage.getItem('first_utms') || '{}');
        utms = {
          utm_source: savedUtms.utm_source || '',
          utm_medium: savedUtms.utm_medium || '',
          utm_campaign: savedUtms.utm_campaign || '',
          utm_term: savedUtms.utm_term || '',
          utm_content: savedUtms.utm_content || ''
        };
      } catch (e) {
        console.error('Failed to parse saved UTMs:', e);
      }
    }

    try {
      const spContactId = localStorage.getItem('sp_contact_id');
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          phone: fullPhone,
          visitor_id: localStorage.getItem('visitor_id') || '',
          sp_contact_id: spContactId || undefined,
          ...utms
        }),
      });

      const resData = await response.json();

      if (response.ok) {
        // Save to localStorage for cross-page persistence
        localStorage.setItem('lead_name', data.name);
        localStorage.setItem('lead_phone', fullPhone);
        localStorage.setItem('lead_social', data.social || '');
        localStorage.setItem('lead_instagram', data.instagram || '');
        if (resData.uuid) {
          localStorage.setItem('lead_uuid', resData.uuid);
        }
        // Track Facebook Lead event
        trackFBEvent('Lead', {
          content_name: 'Анкета СТВОРЮЙ',
          content_category: 'Pre-order'
        });
        
        setSuccess(true);
        reset();
        document.body.classList.add('modal-open');
        
        // Redirect to Telegram
        setTimeout(() => {
          window.location.href = REDIRECT_URL;
        }, 2000);
      } else {
        alert('Щось пішло не так. Спробуйте ще раз.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Помилка мережі.');
    } finally {
      setLoading(false);
    }
  };

  const closeSuccessModal = () => {
    setSuccess(false);
    document.body.classList.remove('modal-open');
    window.location.href = REDIRECT_URL;
  };

  return (
    <div className="antialiased text-sm md:text-base pb-24 bg-[#F9F9F9] min-h-screen">
      {/* HERO */}
      <section className="pt-12 pb-10 px-6 md:px-24 max-w-5xl mx-auto text-center animate-fade-in">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-gray-400 mb-6">Відео-урок</p>
        <h1 className="font-serif text-3xl md:text-5xl lg:text-6xl leading-[1.1] mb-8 text-black font-medium">
          Як у 2026 році <br /><span className="italic text-gray-500">перейти від хаосу в систему</span> <br />та за допомогою контенту збільшити заявки на свої послуги або продукти?
        </h1>
        
        {/* TIMER */}
        <div className="flex justify-center mt-8">
          <div className="inline-flex items-center gap-3 bg-[#E5E7A6]/30 backdrop-blur-sm border border-[#5d5f2c]/10 text-[#0F0F0F] px-5 py-2.5 rounded-full shadow-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.15em]">Доступ до уроку закриється через:</span>
            <span className="font-mono text-sm md:text-base font-bold text-red-600">{timeLeft || '24:00:00'}</span>
          </div>
        </div>
      </section>

      {/* VIDEO */}
      <section className="px-4 md:px-12 max-w-5xl mx-auto mb-16 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="video-container">
          <iframe 
            id="vsl-video-player"
            src="https://www.youtube.com/embed/Sy1TNtms-_8?autoplay=1&rel=0&modestbranding=1&enablejsapi=1" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* WRAPPER FOR DELAYED SECTIONS */}
      <div className={`transition-all duration-1000 ease-in-out ${showForm ? 'opacity-100 max-h-[25000px] visible' : 'opacity-0 max-h-0 overflow-hidden invisible'}`}>
        {/* OFFER */}
        <section className="px-6 md:px-24 max-w-3xl mx-auto text-center mb-16">
          <div className="text-left md:text-center space-y-8">
            <div className="space-y-6">
              <p className="font-serif text-lg md:text-2xl leading-relaxed text-black font-medium">
                Заповнюй анкету та отримай безкоштовний розбір свого блогу від команди, презентацію програми та найвигідніші умови на навчання
              </p>
              <p className="text-sm md:text-base text-gray-600 leading-relaxed font-light">
                Анкета ні до чого не зобов'язує, але саме через неї ти можеш отримати персональні рекомендації та дізнатися, як зробити свій контент сильнішим, а блог почне приносити заявки та продажі.
              </p>
            </div>

            <div className="flex flex-col items-center gap-8 pt-4">
              <a href="#anketa" onClick={trackFormInteraction} className="inline-block bg-black text-white px-10 py-5 text-xs md:text-sm font-bold uppercase tracking-[0.2em] hover:bg-gray-800 transition-all shadow-xl hover:-translate-y-1">АНКЕТА ПРЕДЗАПИСУ</a>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1" stroke="currentColor" className="w-8 h-8 text-gray-300 animate-bounce">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section id="anketa" className="px-6 pb-24 bg-white border-t border-gray-100 pt-16">
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-serif text-3xl md:text-4xl font-medium mb-4">Анкета курсу СТВОРЮЙ</h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="pulse-dot"></span>
                <p className="text-[11px] text-gray-400 uppercase tracking-[0.2em] font-medium live-counter-anim">Зараз заповнюють: {liveCount} людей</p>
              </div>
              <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] mb-4">Заповнюй форму нижче</p>

              {/* BONUSES */}
              <div className="space-y-4 mb-10 mt-6">
                <div className="flex items-center gap-2 px-1 justify-center">
                  <span className="h-[1px] flex-grow bg-black/10"></span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-black whitespace-nowrap flex items-center gap-1.5">
                    ✨ Твої бонуси за заповнення
                  </span>
                  <span className="h-[1px] flex-grow bg-black/10"></span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {/* BONUS 1 */}
                  <div className="relative overflow-hidden p-5 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm hover:shadow-md transition-all duration-300 group text-left">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl">🎁</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Чек-лист</span>
                        <h4 className="text-xs md:text-sm font-bold text-black leading-snug">«50 тем для контенту»</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 leading-normal font-light">Готові ідеї, які залучать цільову аудиторію та спростять створення сторіз та дописів</p>
                      </div>
                    </div>
                  </div>

                  {/* BONUS 2 */}
                  <div className="relative overflow-hidden p-5 rounded-2xl border border-gray-100 bg-gray-50/50 shadow-sm hover:shadow-md transition-all duration-300 group text-left">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black text-white shrink-0 transform group-hover:scale-105 transition-transform duration-300">
                        <span className="text-xl">🔒</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">Telegram-канал</span>
                        <h4 className="text-xs md:text-sm font-bold text-black leading-snug">Закритий канал передзапису</h4>
                        <p className="text-[10px] md:text-xs text-gray-500 leading-normal font-light">Доступ до закритого телеграм каналу передзапису з інсайдерською інформацією</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouncing attention arrow */}
              <div className="flex flex-col items-center justify-center animate-bounce">
                <span className="text-[10px] uppercase tracking-wider text-black font-extrabold mb-1">Заповни анкету нижче</span>
                <svg className="w-6 h-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                </svg>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} onFocus={trackFormInteraction} className="space-y-10" noValidate>
              <input type="hidden" value="Ленд2" {...register('target_sheet')} />
              
              {/* Name */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('name', { required: true, minLength: 2 })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.name ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твоє ім'я</label>
                {errors.name && <div className="error-msg block">Мінімум 2 літери.</div>}
              </div>

              {/* Phone */}
              <div className="relative group">
                <label className="text-gray-400 text-[10px] uppercase tracking-wider mb-2 block font-bold">Твій номер телефону</label>
                <input 
                  type="tel" 
                  {...register('phone_raw', { required: true })}
                  ref={(e) => {
                    register('phone_raw').ref(e);
                    phoneInputRef.current = e;
                  }}
                  className="w-full"
                />
                {errors.phone_raw && <div className="error-msg block">Введіть номер телефону.</div>}
                {/* Note: phone validation is handled via itiRef in onSubmit */}
              </div>

              {/* Social (Telegram) */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('social', { required: true, minLength: 3 })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.social ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твій Telegram (@нікнейм)</label>
                {errors.social && <div className="error-msg block">Мінімум 3 символи.</div>}
              </div>

              {/* Instagram */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('instagram', { required: true, minLength: 3 })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.instagram ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твій Instagram (@нікнейм)</label>
                {errors.instagram && <div className="error-msg block">Мінімум 3 символи.</div>}
              </div>

              {/* Niche */}
              <div className="relative group">
                <input 
                  type="text" 
                  {...register('niche', { required: true })}
                  placeholder=" " 
                  className={`peer w-full bg-transparent border-b ${errors.niche ? 'border-red-500' : 'border-gray-200'} py-4 text-base focus:border-black focus:outline-none transition-colors`}
                />
                <label className="absolute left-0 top-4 text-gray-400 text-sm transition-all peer-focus:-top-4 peer-focus:text-xs peer-focus:text-black peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:text-black pointer-events-none">Твоя ніша</label>
                {errors.niche && <div className="error-msg block">Обов'язкове поле.</div>}
              </div>
              
              <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest pt-4">Заповнюй, і я зв'яжусь з тобою щодо участі</p>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-black text-white py-5 text-xs md:text-sm font-bold uppercase tracking-[0.25em] hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex justify-center items-center gap-3 disabled:bg-gray-400"
              >
                <span>{loading ? 'Відправка...' : 'Відправити анкету'}</span>
                {loading && <div className="loader block"></div>}
              </button>
            </form>
          </div>
        </section>

        {/* WHY IMPORTANT */}
        <section className="py-24 px-6 md:px-24 bg-gray-50 border-y border-gray-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-3xl md:text-4xl text-center mb-16 leading-tight">Чому важливо заповнити анкету прямо зараз:</h2>
            
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-serif text-xl italic">01</span>
                  <div className="h-[1px] flex-grow bg-black/10"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  На основі твоєї анкети я або моя команда проведемо аудит твого профілю. 
                  <span className="block mt-4 font-bold text-black border-l-2 border-black pl-4">Ти отримаєш конкретний перелік помилок у візуалі та сенсах, які прямо зараз зливають твоїх клієнтів.</span>
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-serif text-xl italic">02</span>
                  <div className="h-[1px] flex-grow bg-black/10"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Ми розповімо, як адаптувати <strong>СИСТЕМУ</strong> під твій графік, щоб знімати контент на тиждень вперед, використовуючи лише смартфон та світло з вікна.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-serif text-xl italic">03</span>
                  <div className="h-[1px] flex-grow bg-black/10"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  На потоці буде підтримка від досвідчених кураторів, які є спеціалістами у веденні та монетизації блогу
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 mb-2">
                  <span className="w-10 h-10 rounded-full border border-black flex items-center justify-center font-serif text-xl italic">04</span>
                  <div className="h-[1px] flex-grow bg-black/10"></div>
                </div>
                <p className="text-gray-700 leading-relaxed text-sm md:text-base">
                  Тільки для учасників анкети відкриються закриті умови покупки, яких не буде у загальному доступі.
                </p>
              </div>
            </div>

            <div className="mt-20 text-center">
              <a href="#anketa" onClick={trackFormInteraction} className="inline-block bg-black text-white px-12 py-6 text-xs md:text-sm font-bold uppercase tracking-[0.25em] hover:bg-gray-800 transition-all shadow-2xl hover:-translate-y-1">АНКЕТА ПРЕДЗАПИСУ</a>
            </div>
          </div>
        </section>

        {/* RESULTS */}
        <section className="py-32 px-6 md:px-24 bg-white overflow-hidden">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24 animate-fade-in">
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] text-gray-400 mb-6">Результати</p>
              <h2 className="font-serif text-4xl md:text-6xl text-black font-medium leading-tight mb-4">
                Трансформація <br /><span className="italic text-gray-400 font-normal">візуальних сенсів</span>
              </h2>
              <div className="w-16 h-[1px] bg-black/10 mx-auto mt-8"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-32">
              {[
                { name: 'Мар’яна', niche: 'Вчителька танців', id: '01', before: '/rozbir/do1.jpg', after: '/rozbir/bo1.jpg' },
                { name: 'Бізнес', niche: 'Будівництво басейнів', id: '02', before: '/rozbir/do2.jpg', after: '/rozbir/bo2.jpg' },
                { name: 'Аня', niche: 'Дизайнер одягу', id: '03', before: '/rozbir/do3.jpg', after: '/rozbir/bo3.jpg' },
                { name: 'Аня', niche: 'Вчителька української', id: '04', before: '/rozbir/do1.jpg', after: '/rozbir/bo4.jpg' },
                { name: 'Катя', niche: 'Лайфстайл блог', id: '05', before: '/rozbir/do2.jpg', after: '/rozbir/bo1.jpg' },
                { name: 'Аліса', niche: 'Стилістка', id: '06', before: '/rozbir/do3.jpg', after: '/rozbir/bo2.jpg' },
              ].map((client, idx) => (
                <div key={idx} className="space-y-8 animate-fade-in" style={{ animationDelay: `${(idx % 2 + 1) * 0.1}s` }}>
                  <div className="flex items-end justify-between border-b border-gray-100 pb-4">
                    <div className="space-y-1">
                      <h3 className="font-serif text-2xl md:text-3xl font-medium text-black">{client.name}</h3>
                      <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.25em] font-bold">{client.niche}</p>
                    </div>
                    <span className="font-serif italic text-gray-300 text-3xl">{client.id}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative overflow-hidden group shadow-sm">
                      <img src={client.before} alt={`До трансформації - ${client.name}`} loading="lazy" className="w-full aspect-[3/4] object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 shadow-sm">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-black">До</p>
                      </div>
                    </div>
                    <div className="relative overflow-hidden group shadow-md shadow-gray-200">
                      <img src={client.after} alt={`Після трансформації - ${client.name}`} loading="lazy" className="w-full aspect-[3/4] object-cover group-hover:scale-105 transition-transform duration-1000" />
                      <div className="absolute top-4 left-4 bg-black px-3 py-1.5 shadow-xl">
                        <p className="text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] text-white">Після</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-32 text-center animate-fade-in">
              <p className="text-xs md:text-sm text-gray-400 italic font-light">Кожен з цих кейсів — це результат поєднання правильних сенсів та естетичного візуалу.</p>
            </div>
          </div>
        </section>
      </div>

      {/* SUCCESS MODAL */}
      {success && (
        <div className="fixed inset-0 z-[60]" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeSuccessModal}></div>
          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
              <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-2xl transition-all sm:my-8 w-full max-w-sm">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 text-center">
                  <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-green-50 mb-5">
                    <svg className="h-8 w-8 text-black" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div className="mt-2">
                    <h3 className="font-serif text-2xl font-semibold leading-6 text-gray-900 mb-2">Анкету надіслано!</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 leading-relaxed">Дякую за твій інтерес до курсу СТВОРЮЙ. <br />Я отримала твою анкету. Зараз тебе буде перенаправлено в наш Telegram-канал, де ти зможеш забирати свій подарунок <strong>«50 тем для контенту»</strong> та додаткові бонуси🤍</p>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-4 sm:flex sm:flex-row-reverse sm:px-6 justify-center">
                  <button type="button" onClick={closeSuccessModal} className="inline-flex w-full justify-center rounded-sm bg-black px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 transition-colors uppercase tracking-wider sm:w-auto">
                    Зрозуміло
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STICKY BUTTONS */}
      {showForm && (
        <>
          <div className="fixed bottom-0 left-0 w-full p-4 z-40 bg-gradient-to-t from-white via-white to-transparent pt-8 md:hidden">
        <a href="#anketa" onClick={trackFormInteraction} className="block w-full bg-black text-white text-center py-4 text-[10px] font-bold uppercase tracking-[0.2em] shadow-2xl">Заповнити анкету</a>
      </div>
      <a href="#anketa" onClick={trackFormInteraction} className="hidden md:flex fixed bottom-8 right-8 z-40 bg-black text-white w-auto px-8 py-4 items-center gap-3 shadow-2xl hover:bg-gray-800 transition-all rounded-sm group">
        <span className="text-xs font-bold uppercase tracking-[0.15em]">Заповнити анкету</span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
        </>
      )}

      {/* TOAST NOTIFICATION */}
      <div id="notification-toast" className={toast.show ? 'show' : ''}>
        <div className="pulse-dot"></div>
        <div className="text-[12px] text-gray-800 font-medium">
          <span className="font-bold">{toast.name}</span> <span>{toast.action}</span>
        </div>
      </div>
    </div>
  );
}
