'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import { trackFBEvent } from '@/components/FacebookPixel';
import Image from 'next/image';

interface FormData {
  name: string;
  phone_raw: string;
  social: string;
  instagram: string;
}

const BOT_REDIRECT_URL = 'https://t.me/victoriameshcheriakova_bot?start=6979295699cc89ca5d0f02d5';

export default function FreeLectionPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showStickyFooter, setShowStickyFooter] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('UA');
  const [phoneError, setPhoneError] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();

  useEffect(() => {
    trackFBEvent('PageView', {});
    
    const handleScroll = () => {
      setShowStickyFooter(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxSrc(null);
        setModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetch('/api/country')
      .then(res => res.json())
      .then(data => {
        if (data.country) {
          setCountryCode(data.country.toUpperCase());
        }
      })
      .catch(() => {});
  }, []);

  const openLightbox = (src: string) => {
    setLightboxSrc(src);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxSrc(null);
    document.body.style.overflow = 'auto';
  };

  const toggleModal = () => {
    setModalOpen(!modalOpen);
    document.body.style.overflow = !modalOpen ? 'hidden' : 'auto';
    if (!modalOpen) {
      trackFBEvent('InitiateCheckout', {});
    }
  };

  useEffect(() => {
    // Load saved data
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');
    const savedInstagram = localStorage.getItem('lead_instagram');

    if (savedName) setValue('name', savedName);
    if (savedSocial) setValue('social', savedSocial);
    if (savedInstagram) setValue('instagram', savedInstagram);
    if (savedPhone) setPhone(savedPhone);
  }, []);

  const onSubmit = async (data: FormData) => {
    setPhoneError(false);
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError(true);
      return;
    }

    setLoading(true);
    const fullPhone = phone;

    // Save to localStorage
    localStorage.setItem('lead_name', data.name);
    localStorage.setItem('lead_phone', fullPhone);
    localStorage.setItem('lead_social', data.social || '');
    localStorage.setItem('lead_instagram', data.instagram || '');

    const params = new URLSearchParams(window.location.search);
    const utms = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_term: params.get('utm_term') || '',
      utm_content: params.get('utm_content') || ''
    };

    const formData = {
      name: data.name,
      phone: fullPhone,
      social: data.social,
      instagram: data.instagram,
      target_sheet: 'VSL Воронка (старт)',
      visitor_id: localStorage.getItem('visitor_id') || '',
      ...utms
    };

    // Final save before submission
    localStorage.setItem('lead_name', data.name);
    localStorage.setItem('lead_phone', fullPhone);
    localStorage.setItem('lead_social', data.social || '');
    localStorage.setItem('lead_instagram', data.instagram || '');

    try {
      const response = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const resData = await response.json();
      if (resData.uuid) {
        localStorage.setItem('lead_uuid', resData.uuid);
      }
      window.location.href = BOT_REDIRECT_URL;
    } catch (err) {
      console.error(err);
      alert("Помилка відправки. Спробуйте ще раз.");
      setLoading(false);
    }
  };

  // Helper to save field on the fly
  const handleFieldChange = (field: string, value: string) => {
    localStorage.setItem(`lead_${field}`, value);
  };

  return (
    <div className="antialiased text-sm md:text-base pb-24 md:pb-0 bg-[#F9F9F9] text-[#0F0F0F] overflow-x-hidden font-sans min-h-screen">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&display=swap');
        
        .font-sans { font-family: 'Manrope', sans-serif; }
        .font-serif { font-family: 'Playfair Display', serif; }

        html { scroll-behavior: smooth; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .reveal {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.8s ease-out;
        }

        .magazine-gradient {
            background: linear-gradient(90deg, #F9F9F9 35%, rgba(249, 249, 249, 0.85) 55%, rgba(249, 249, 249, 0) 100%);
        }

        @media (max-width: 768px) {
            .magazine-gradient {
                background: linear-gradient(90deg, #F9F9F9 50%, rgba(249, 249, 249, 0.7) 80%, rgba(249, 249, 249, 0) 100%);
            }
        }
        
        @keyframes slideUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
            animation: slideUp 0.8s ease-out forwards;
        }
      `}</style>

      {/* HERO SECTION */}
      <section className="relative min-h-[100dvh] w-full overflow-hidden flex items-center bg-[#F9F9F9]">
          <div className="absolute top-0 right-0 w-full md:w-[60%] h-full z-0 overflow-hidden">
              <img src="/free-lection/inst.jpg"
                  onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop'; }}
                  alt="Instagram Profile on Phone"
                  className="w-full h-full object-cover object-center opacity-100 blur-[3px] scale-105" />
          </div>
          <div className="absolute inset-0 magazine-gradient z-10 pointer-events-none"></div>
          <div className="relative z-30 px-6 md:px-24 w-full md:w-[60%] h-full flex flex-col justify-center py-20 md:py-0">
              <div className="animate-slide-up">
                  <div className="inline-block border-b border-black pb-1 mb-8">
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-black">БЕЗКОШТОВНА ЛЕКЦІЯ</p>
                  </div>
                  <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 tracking-tight">
                      <span className="block font-semibold text-black">Як у 2026 році</span>
                      <span className="block font-normal text-[#6B6B6B] mt-2 italic">побудувати систему</span>
                      <span className="block font-semibold text-black mt-2">роботи з контентом та візуалом</span>
                  </h1>
                  <div className="max-w-[280px] md:max-w-md border-l-2 border-black pl-5 mb-10 mt-6">
                      <p className="font-sans text-xs md:text-base font-medium text-gray-800 leading-relaxed">без хаосу та стресу і зробити це всього за один день</p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                      <button onClick={toggleModal} className="group relative inline-flex items-center justify-center bg-black text-white px-8 py-4 overflow-hidden font-medium transition duration-300 ease-out shadow-xl hover:bg-gray-800">
                          <span className="relative flex items-center gap-3 tracking-[0.15em] text-[10px] md:text-xs uppercase font-bold">
                              Дивитись лекцію
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                              </svg>
                          </span>
                      </button>
                      <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                              <p className="text-[10px] text-[#FF3B30] uppercase tracking-wider font-extrabold">Залишилось 36/100 місць</p>
                          </div>
                          <p className="text-[9px] text-gray-400 mt-0.5 uppercase tracking-wider font-semibold">отримати доступ до відео</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* PAIN POINTS */}
      <section className="py-24 px-6 bg-white relative z-20">
          <div className="max-w-5xl mx-auto">
              <div className="text-center mb-16 reveal">
                  <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Знайома <span className="italic font-normal text-gray-500">ситуація?</span></h2>
                  <div className="w-16 h-px bg-black mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <div className="reveal flex flex-col p-6 border-l border-gray-200 hover:border-black transition-colors duration-500 group">
                      <span className="text-3xl font-serif mb-3 text-gray-300 group-hover:text-black transition-colors">I</span>
                      <h3 className="font-bold text-lg mb-2">Контент = стрес</h3>
                      <p className="text-xs text-gray-600 leading-loose">Ти постійно думаєш, що публікувати, але боїшся зробити “не так”. І в результаті — або відкладаєш, або не публікуєш взагалі.</p>
                  </div>
                  <div className="reveal flex flex-col p-6 border-l border-gray-200 hover:border-black transition-colors duration-500 group delay-100">
                      <span className="text-3xl font-serif mb-3 text-gray-300 group-hover:text-black transition-colors">II</span>
                      <h3 className="font-bold text-lg mb-2">Візуал без відчуття “це я”</h3>
                      <p className="text-xs text-gray-600 leading-loose">Наче гарно, але не цілісно. Кольори не складаються, сторіз виглядають випадково, і профіль не розповідає про тебе без слів.</p>
                  </div>
                  <div className="reveal flex flex-col p-6 border-l border-gray-200 hover:border-black transition-colors duration-500 group delay-200">
                      <span className="text-3xl font-serif mb-3 text-gray-300 group-hover:text-black transition-colors">III</span>
                      <h3 className="font-bold text-lg mb-2">Сумніви</h3>
                      <p className="text-xs text-gray-600 leading-loose">Ти починаєш пост — і зупиняєшся. Не розумієш, з чого почати, як поєднати текст і візуал, і чи взагалі це виглядає професійно.</p>
                  </div>
                  <div className="reveal flex flex-col p-6 border-l border-gray-200 hover:border-black transition-colors duration-500 group delay-300">
                      <span className="text-3xl font-serif mb-3 text-gray-300 group-hover:text-black transition-colors">IV</span>
                      <h3 className="font-bold text-lg mb-2">Час в нікуди</h3>
                      <p className="text-xs text-gray-600 leading-loose">Ти намагаєшся зробити «ідеальний пост», витрачаючи години на правки, і все одно не задоволена результатом.</p>
                  </div>
              </div>
              <div className="mt-16 text-center reveal">
                  <div className="flex flex-col items-center gap-2">
                      <button onClick={toggleModal} className="inline-block bg-black text-white px-10 py-3 hover:bg-gray-800 transition-all duration-300 uppercase tracking-widest text-[10px] font-bold shadow-lg">Дивитись лекцію</button>
                      <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                          <p className="text-[10px] text-[#FF3B30] uppercase tracking-wider font-extrabold">Встигніть забронювати: 36/100 місць</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* ABOUT ME SECTION */}
      <section className="py-24 px-6 md:px-16 bg-white overflow-hidden relative border-t border-gray-100">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-20">
              <div className="w-full md:w-[45%] reveal">
                  <div className="relative group">
                      <div className="absolute -inset-4 border border-gray-100 scale-95 group-hover:scale-100 transition-transform duration-700 pointer-events-none"></div>
                      <img src="/free-lection/expert.png"
                          onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop'; }}
                          alt="Вікторія Мещерякова"
                          className="w-full grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl relative z-10" />
                      <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#F9F9F9] -z-0"></div>
                  </div>
              </div>
              <div className="w-full md:w-[55%] reveal">
                  <div className="inline-block border-b border-black pb-1 mb-6">
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-black">Експерт</p>
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8 leading-tight">Я - Вікторія <span className="italic font-normal text-gray-500">Мещерякова</span></h2>

                  <div className="space-y-6 text-sm md:text-base text-gray-700 leading-relaxed font-light">
                      <p className="font-bold text-black text-lg">Експерт із контенту та візуалу з 9-річним досвідом.</p>

                      <ul className="space-y-4">
                          <li className="pl-4 border-l border-gray-200">
                              <strong>У сфері контенту з 2015 року:</strong> пройшла шлях від створення авторських виробів ручної роботи до розробки стратегій для міжнародних брендів.
                          </li>
                          <li className="pl-4 border-l border-gray-200">
                              <strong>Міжнародний досвід:</strong> працювала з бізнесами в Британії, США, Польщі та Україні. Серед клієнтів — великі компанії, зокрема бренд гірськолижного спорядження Fisher.
                          </li>
                          <li className="pl-4 border-l border-gray-200">
                              <strong>Творець складного візуалу:</strong> створювала високотехнологічний креативний контент вручну ще до появи нейромереж, що дозволило глибоко вивчити логіку кадру та світла.
                          </li>
                          <li className="pl-4 border-l border-gray-200">
                              <strong>Освіта та наставництво:</strong> 2 роки вела офлайн-навчання в Ужгороді та 3 роки розвиває власну онлайн-платформу.
                          </li>
                      </ul>

                      <p className="mt-8 italic">
                          Я мама двох дітей і живу в Мукачево. Я чітко розумію цінність часу, тому моя система — це не про «красиві картинки», а про те, як зробити блог вашим головним інструментом продажів, залишаючи час на реальне життя.
                      </p>

                      <div className="bg-gray-50 p-6 border-l-2 border-black mt-8">
                          <p className="text-xs md:text-sm">
                              У 2026 році ринок перенасичений ШІ та однотипним контентом. Я допомагаю експертам та бізнесу витягнути їхню справжню автентичність, упакувати її в зрозумілу структуру та почати продавати через сенси, які привертають увагу цільової аудиторії.
                          </p>
                      </div>

                      <div className="mt-10">
                          <a href="https://www.instagram.com/reel/DUvAwcJDFaF/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest hover:gap-5 transition-all group">
                              Мій інстаграм
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-4 h-4 transition-transform group-hover:translate-x-1">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                          </a>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* WHO IS THIS FOR SECTION */}
      <section className="py-24 px-6 md:px-16 bg-[#111] text-white overflow-hidden relative">
          <div className="max-w-6xl mx-auto">
              <div className="mb-20 reveal text-center">
                  <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">Кому точно потрібна <span className="italic font-normal text-gray-500">система роботи</span></h2>
                  <p className="text-xs md:text-sm text-gray-400 uppercase tracking-widest">з контентом та візуалом</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8">
                  {/* SMM/UGC */}
                  <div className="reveal group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-px bg-gray-700 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
                          <h3 className="font-bold text-lg uppercase tracking-wider">SMM-спеціалістам та UGC-кріейторам</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">Ви витрачаєте 100% ресурсу на проєкти клієнтів, залишаючи власний блог порожнім. Це не дозволяє вам обґрунтовано підвищити чек та вийти на співпрацю з великими брендами.</p>
                      <div className="bg-white/5 p-4 border-l border-white/20">
                          <p className="text-[10px] text-white/60 uppercase font-bold mb-1">На лекції:</p>
                          <p className="text-[11px] leading-relaxed italic">отримаєте алгоритм перетворення вашого досвіду в особистий бренд, який продає ваші послуги замість вас.</p>
                      </div>
                  </div>

                  {/* Experts */}
                  <div className="reveal group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-px bg-gray-700 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
                          <h3 className="font-bold text-lg uppercase tracking-wider">Експертам (бухгалтерам, майстрам, юристам і тд)</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">Ви публікуєте лише робочі процеси, що робить вас «одним з тисячі» і змушує конкурувати лише ціною.</p>
                      <div className="bg-white/5 p-4 border-l border-white/20">
                          <p className="text-[10px] text-white/60 uppercase font-bold mb-1">На лекції:</p>
                          <p className="text-[11px] leading-relaxed italic">дізнаєтесь, як за допомогою моєї системи упакувати свою експертність «дорого» і скоротити шлях клієнта від першого знайомства з вами до оплати.</p>
                      </div>
                  </div>

                  {/* Creative people */}
                  <div className="reveal group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-px bg-gray-700 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
                          <h3 className="font-bold text-lg uppercase tracking-wider">Творчим людям (художникам, фотографам, дизайнерам)</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">Ваш блог залежить від настрою: ви публікуєте контент на емоціях, а потім архівуєте його через сумніви. Це вбиває регулярність і постійний потік замовлений.</p>
                      <div className="bg-white/5 p-4 border-l border-white/20">
                          <p className="text-[10px] text-white/60 uppercase font-bold mb-1">На лекції:</p>
                          <p className="text-[11px] leading-relaxed italic">отримаєте маркетингову структуру, яка перетворить творчий хаос на прогнозовану систему продажів, що працює незалежно від вашого натхнення.</p>
                      </div>
                  </div>

                  {/* Mams/Emigrants */}
                  <div className="reveal group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-px bg-gray-700 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
                          <h3 className="font-bold text-lg uppercase tracking-wider">Мамам у декреті та емігрантам</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">Ви маєте обмежений час на блог і працюєте в умовах звичайної квартири без професійного обладнання. </p>
                      <div className="bg-white/5 p-4 border-l border-white/20">
                          <p className="text-[10px] text-white/60 uppercase font-bold mb-1">На лекції:</p>
                          <p className="text-[11px] leading-relaxed italic">ви отримаєте мою систему зйомки контенту біля вікна за 30 хвилин, який виглядатиме професійно та дорого.</p>
                      </div>
                  </div>

                  {/* Commercial */}
                  <div className="reveal group">
                      <div className="flex items-center gap-4 mb-4">
                          <div className="w-10 h-px bg-gray-700 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
                          <h3 className="font-bold text-lg uppercase tracking-wider">Власникам комерційних брендів</h3>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-6">Ваш контент складається лише з фото товарів, що не дозволяє виділитися серед конкурентів в епоху ШІ.</p>
                      <div className="bg-white/5 p-4 border-l border-white/20">
                          <p className="text-[10px] text-white/60 uppercase font-bold mb-1">На лекції:</p>
                          <p className="text-[11px] leading-relaxed italic">зрозумієте, як через систему сенсів відбудувати себе від конкурентів, підвищити лояльність аудиторії та перетворити охоплення на продажі.</p>
                      </div>
                  </div>

                  {/* CTA Card */}
                  <div className="reveal border border-white/10 p-8 flex flex-col justify-center items-center text-center group bg-white/[0.02] backdrop-blur-sm relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none"></div>
                      <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-4 relative z-10">Готові побудувати систему?</p>
                      <button onClick={toggleModal} className="w-full bg-white text-black py-4 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)] mb-4 relative z-10">Приєднатися до лекції</button>
                      <div className="flex items-center gap-2 relative z-10">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                          <p className="text-[#FF3B30] text-[10px] font-extrabold uppercase tracking-widest">36/100 місць залишилось</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* QUOTE */}
      <section className="py-20 px-6 bg-[#111] text-white text-center reveal">
          <div className="max-w-3xl mx-auto">
              <p className="font-serif text-5xl text-gray-600 mb-4">“</p>
              <p className="font-serif text-xl md:text-2xl italic leading-relaxed text-gray-200">Якщо нічого не змінювати, профіль залишиться хаотичним і не продаватиме. Але чи варто страждати на кожному кроці, якщо є система, яка працює?</p>
          </div>
      </section>

      {/* RESULTS */}
      <section className="py-24 px-6 md:px-16 bg-[#F9F9F9]">
          <div className="max-w-3xl mx-auto">
              <h2 className="font-serif text-3xl md:text-4xl text-center mb-16 reveal font-bold">Твій результат <span className="italic font-normal text-gray-500">після лекції</span></h2>
              <div className="space-y-6">
                  <div className="reveal group bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-black">
                      <div className="flex items-baseline gap-4">
                          <span className="font-serif text-3xl italic text-gray-300 group-hover:text-black transition-colors">01.</span>
                          <div>
                              <h3 className="font-bold text-lg mb-2">Візуал, який транслює тебе</h3>
                              <ul className="text-xs text-gray-600 font-light list-disc list-inside space-y-1">
                                  <li>Впізнаваний стиль, кольори і шрифти говорять про твою особистість та експертність.</li>
                                  <li>Кожен елемент профілю захоплює і запам’ятовується.</li>
                                  <li>Контент, який хочеться зберегти, коментувати і переслати.</li>
                              </ul>
                          </div>
                      </div>
                  </div>
                  <div className="reveal group bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-black">
                      <div className="flex items-baseline gap-4">
                          <span className="font-serif text-3xl italic text-gray-300 group-hover:text-black transition-colors">02.</span>
                          <div>
                              <h3 className="font-bold text-lg mb-2">Більше жодних сумнівів</h3>
                              <ul className="text-xs text-gray-600 font-light list-disc list-inside space-y-1">
                                  <li>Чіткі цілі і теми.</li>
                                  <li>Розуміння аудиторії.</li>
                                  <li>План контенту без хаосу.</li>
                              </ul>
                          </div>
                      </div>
                  </div>
                  <div className="reveal group bg-white p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-transparent hover:border-black">
                      <div className="flex items-baseline gap-4">
                          <span className="font-serif text-3xl italic text-gray-300 group-hover:text-black transition-colors">03.</span>
                          <div>
                              <h3 className="font-bold text-lg mb-2">Економія часу та енергії</h3>
                              <p className="text-xs text-gray-600 font-light leading-relaxed">Ти працюєш не “на відчуттях”, а через логічну систему і зрозумілі правила поєднання контенту та візуалу — без годин перед екраном і вигорання.</p>
                          </div>
                      </div>
                  </div>
              </div>
              <div className="mt-12 text-center reveal">
                  <button onClick={toggleModal} className="inline-block bg-transparent border border-black text-black px-10 py-3 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-[10px] font-bold mb-3">Отримати доступ до лекції</button>
                  <div className="flex items-center justify-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                      <p className="text-[#FF3B30] text-[10px] font-extrabold uppercase tracking-widest">36/100 місць (актуально на зараз)</p>
                  </div>
              </div>
          </div>
      </section>

      {/* REVIEWS */}
      <section className="py-24 bg-white overflow-hidden reveal">
          <div className="px-6 mb-10 text-center">
              <h2 className="font-serif text-3xl md:text-4xl font-bold">Відгуки</h2>
              <p className="text-xs text-gray-400 mt-2 font-light">Натисніть на фото, щоб відкрити</p>
          </div>
          <div className="w-full overflow-x-auto no-scrollbar pl-6 pb-8">
              <div className="flex gap-4 w-max">
                  {['rew3.JPG', 'rew4.JPG', 'rew5.JPG', 'rew1.JPG', 'rew2.JPG', 'rew6.JPG', 'rew8.JPG', 'rew10.JPG', 'rew9.JPG', 'rew7.JPG', 'rew11.JPG', 'rew12.JPG', 'rew14.JPG', 'rew13.JPG'].map(img => (
                    <div key={img} className="shrink-0 w-[280px] h-[210px] md:w-[360px] md:h-[270px] bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-center cursor-pointer overflow-hidden transition-transform hover:scale-[1.01]"
                        onClick={() => openLightbox(`/free-lection/${img}`)}>
                        <img src={`/free-lection/${img}`} onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x300/f0f0f0/ccc?text=No+Image'; }} className="max-w-full max-h-full object-contain" />
                    </div>
                  ))}
              </div>
          </div>
          <div className="mt-8 text-center reveal">
              <div className="flex flex-col items-center justify-center gap-4">
                  <button onClick={toggleModal} className="inline-block bg-black text-white px-10 py-3 hover:bg-gray-800 transition-all duration-300 uppercase tracking-widest text-[10px] font-bold shadow-lg">Дивитись лекцію</button>
                  <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                      <p className="text-[#FF3B30] text-[10px] font-extrabold uppercase tracking-wider">Останні 36/100 вільних місць</p>
                  </div>
              </div>
          </div>
          <p className="md:hidden text-center text-[10px] text-gray-400 mt-4 animate-pulse">гортайте →</p>
      </section>

      {/* FOOTER */}
      <footer className="bg-black text-white/40 py-8 text-center text-[10px] uppercase tracking-wider">
          <p>&copy; 2026. Content System.</p>
      </footer>

      {/* MOBILE STICKY FOOTER BUTTON */}
      <div className={`fixed bottom-0 left-0 w-full p-4 z-40 md:hidden bg-white/80 backdrop-blur-lg border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-all duration-500 ${showStickyFooter ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
          <button onClick={toggleModal} className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-[0.25em] shadow-xl flex items-center justify-center gap-3 active:scale-[0.98] transition-all">
              Дивитись лекцію
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 animate-pulse">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
          </button>
      </div>

      {/* LIGHTBOX MODAL */}
      <div className={`fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out transition-all duration-300 ${lightboxSrc ? 'visible opacity-100' : 'invisible opacity-0'}`} onClick={closeLightbox}>
          <button className="absolute top-5 right-5 text-white/70 hover:text-white z-50 p-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
          </button>
          <img src={lightboxSrc || undefined} className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm transition-transform duration-200" onClick={e => e.stopPropagation()} />
          <p className="absolute bottom-5 text-white/50 text-xs">Натисніть ESC або хрестик, щоб закрити</p>
      </div>

      {/* POPUP MODAL (FORM) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 transition-all duration-300 ${modalOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
          <div className="absolute inset-0" onClick={toggleModal}></div>
          <div className={`bg-white w-full max-w-sm p-8 relative shadow-2xl transition-transform duration-300 ${modalOpen ? 'scale-100' : 'scale-95'}`}>
              <button onClick={toggleModal} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              </button>
              <div className="text-center mb-8">
                  <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-2">Access</p>
                  <h3 className="font-serif text-3xl font-bold text-black">Отримати лекцію</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-pulse"></span>
                      <p className="text-[#FF3B30] text-[10px] font-extrabold uppercase tracking-widest">36/100 місць залишилось</p>
                  </div>
              </div>

              {/* FORM START */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Name */}
                  <div>
                      <input type="text" {...register('name', { 
                        required: true,
                        onChange: (e) => handleFieldChange('name', e.target.value)
                      })} placeholder="Ваше ім'я" className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none transition-colors text-black" />
                  </div>

                  {/* Phone */}
                  <div>
                      <PhoneInput
                        international
                        defaultCountry={countryCode as any}
                        value={phone}
                        onChange={(val) => {
                          setPhone(val || '');
                          localStorage.setItem('lead_phone', val || '');
                        }}
                        className="w-full react-phone-input-light"
                        numberInputProps={{
                          id: "phone",
                          autoComplete: "tel",
                          inputMode: "tel",
                          className: "w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none transition-colors text-black",
                          placeholder: "Твій номер телефону"
                        }}
                      />
                      {phoneError && <p className="text-red-500 text-[10px] mt-1">Перевірте правильність номеру</p>}
                  </div>

                  {/* Social */}
                  <div>
                      <input type="text" {...register('social', {
                        required: true,
                        onChange: (e) => handleFieldChange('social', e.target.value)
                      })} placeholder="Ваш Telegram (@нікнейм)" className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none transition-colors text-black" />
                  </div>

                  {/* Instagram */}
                  <div>
                      <input type="text" {...register('instagram', {
                        required: true,
                        onChange: (e) => handleFieldChange('instagram', e.target.value)
                      })} placeholder="Ваш Instagram (@нікнейм)" className="w-full bg-transparent border-b border-gray-300 py-3 text-sm focus:border-black focus:outline-none transition-colors text-black" />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-black text-white py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-[#333] transition-colors mt-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'ОБРОБКА...' : 'Дивитись безкоштовно'}
                  </button>
              </form>
              {/* FORM END */}

              <p className="text-[9px] text-gray-400 text-center mt-6">Дані захищені.</p>
          </div>
      </div>
    </div>
  );
}
