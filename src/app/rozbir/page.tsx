'use client';

import React, { useState, useEffect, useRef } from 'react';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import Script from 'next/script';
import { useForm } from 'react-hook-form';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  Fingerprint, 
  Clock, 
  Copy, 
  ShieldCheck, 
  X 
} from 'lucide-react';
import { trackFBEvent } from '@/components/FacebookPixel';

declare global {
  interface Window {
    Wayforpay: any;
  }
}

interface FormData {
  name: string;
  social: string;
  phone: string;
}

const PRICING: Record<string, { current: number; old: number }> = {
  '290': { current: 290, old: 1290 },
  'default': { current: 390, old: 1790 },
  '590': { current: 590, old: 2190 },
  'test_8f7b2c9a': { current: 1, old: 100 }
};

export default function RozbirPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState('');
  const [timerText, setTimerText] = useState('10:00');
  const [currentPriceObj, setCurrentPriceObj] = useState(PRICING.default);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);
  const [phone, setPhone] = useState<string>('');
  const [countryCode, setCountryCode] = useState<string>('UA');

  const heroRef = useRef<HTMLElement>(null);
  const storytellingRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);

  const { register, handleSubmit, setValue } = useForm<FormData>();

  useEffect(() => {
    // Initial Price
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    if (uid && PRICING[uid]) {
      setCurrentPriceObj(PRICING[uid]);
    }

    // Timer
    let duration = 600;
    const interval = setInterval(() => {
      const minutes = Math.floor(duration / 60);
      const seconds = duration % 60;
      setTimerText(`${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      if (--duration < 0) duration = 0;
    }, 1000);

    // Intersection Observer for sticky CTA
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        setStickyVisible(!entry.isIntersecting);
      });
    }, { threshold: 0.2 });

    if (heroRef.current) observer.observe(heroRef.current);
    
    // Global persistence load
    const savedName = localStorage.getItem('lead_name');
    const savedPhone = localStorage.getItem('lead_phone');
    const savedSocial = localStorage.getItem('lead_social');

    if (savedName) setValue('name', savedName);
    if (savedSocial) setValue('social', savedSocial);
    if (savedPhone) setPhone(savedPhone);

    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
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

  const openModal = () => {
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
    trackFBEvent('InitiateCheckout', {
      value: currentPriceObj.current,
      currency: 'UAH',
      content_name: 'Персональна Діагностика Віка',
      content_type: 'product',
      content_ids: ['diag_v_1']
    });
  };

  const closeModal = () => {
    setModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const openImageModal = (src: string) => {
    setLightboxSrc(src);
    setImageModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    document.body.style.overflow = 'auto';
  };

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 340 * direction, behavior: 'smooth' });
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    localStorage.setItem(`lead_${field}`, value);
  };

  const startPayment = (paymentData: any) => {
    if (window.Wayforpay) {
      const wayforpay = new window.Wayforpay();
      wayforpay.run(paymentData,
        function (response: any) {
          window.location.href = `/rozbir/thanks?orderReference=${paymentData.orderReference}`;
        },
        function (response: any) {
          window.location.href = "/rozbir/fail";
        },
        function (response: any) {
          console.log("Payment pending/error");
        }
      );
    }
  };

  const onSubmit = async (data: FormData) => {
    setPhoneError(false);
    if (!phone || !isValidPhoneNumber(phone)) {
      setPhoneError(true);
      return;
    }

    setLoading(true);
    const fullPhone = phone;

    const params = new URLSearchParams(window.location.search);
    const utms = {
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || ''
    };

    try {
      const response = await fetch('/api/rozbir/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          social: data.social,
          phone: fullPhone,
          amount: currentPriceObj.current,
          visitor_id: localStorage.getItem('visitor_id') || '',
          ...utms
        })
      });

      const paymentData = await response.json();

      if (paymentData.error) {
        throw new Error(paymentData.error);
      }

      localStorage.setItem('purchase_price', String(currentPriceObj.current));
      localStorage.setItem('lead_name', data.name);
      localStorage.setItem('lead_phone', fullPhone);
      localStorage.setItem('lead_social', data.social || '');
      if (paymentData.uuid) {
        localStorage.setItem('lead_uuid', paymentData.uuid);
      }

      trackFBEvent('Lead', {
        value: currentPriceObj.current,
        currency: 'UAH',
        content_name: 'Персональна Діагностика Віка',
        content_type: 'product',
        content_ids: ['diag_v_1']
      });

      startPayment(paymentData);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
      alert('Виникла помилка при створенні замовлення. Спробуйте пізніше.');
    }
  };

  return (
    <div className="antialiased text-sm md:text-base pb-24 bg-[#F9F9F9] text-[#0F0F0F] font-sans">
      <Script 
        id="widget-wfp-script"
        src="https://secure.wayforpay.com/server/pay-widget.js"
        strategy="afterInteractive"
      />

      <style>{`
        body { background-color: #F9F9F9; color: #0F0F0F; overflow-x: hidden; }
        input { background-color: transparent !important; border: 1px solid #E5E5E5 !important; color: #0F0F0F !important; border-radius: 0px !important; font-size: 14px !important; }
        input:focus { border-color: #0F0F0F !important; box-shadow: none !important; outline: none !important; }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .text-glow { text-shadow: 0 2px 10px rgba(255, 255, 255, 1); }
        .font-sans { font-family: var(--font-manrope), sans-serif; }
        .font-serif { font-family: var(--font-playfair), serif; }
      `}</style>

      {/* HERO SECTION */}
      <section id="hero-section" ref={heroRef}
        className="relative min-h-[100dvh] flex flex-col justify-end md:justify-center pb-12 md:pb-8 pt-[15vh] md:pt-0 overflow-hidden bg-[#F9F9F9]">
        
        <div className="absolute inset-0 z-0 overflow-hidden bg-[#F9F9F9]">
          <img src="/rozbir/IMG_2527.jpg" alt="Victoria Meshcheriakova"
            className="w-full h-full object-cover object-center opacity-95" />

          <div className="absolute top-[52%] md:top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[160%] md:w-[80%] h-[80%] md:h-[85%] bg-[#F9F9F9]/80 blur-[45px] rounded-full z-10 pointer-events-none"></div>
          <div className="absolute top-[52%] md:top-[50%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[130%] md:w-[60%] h-[68%] md:h-[65%] bg-[#F9F9F9]/60 backdrop-blur-md blur-[15px] rounded-full z-10 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F9F9F9]/60 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F9F9F9] to-transparent z-10 pointer-events-none"></div>
        </div>

        <div className="container mx-auto px-4 relative z-20 w-full max-w-lg md:max-w-3xl flex flex-col items-center text-center md:mt-24">
          <div className="inline-block border-b border-black pb-1 mb-4">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-black text-glow">Персональний розбір</p>
          </div>

          <h1 className="font-serif text-[26px] xs:text-[28px] md:text-3xl lg:text-4xl font-bold leading-[1.25] text-black mb-4 tracking-tight relative text-glow">
            Отримай готову схему роботи з контентом і візуалом <span className="italic font-normal text-gray-700">під твою нішу</span>, яка зробить ведення профілю простішим
          </h1>

          <div className="w-[95%] max-w-[400px] border-l-2 border-black pl-4 mb-5 mx-auto bg-white/50 backdrop-blur-sm py-2.5 pr-2 rounded-r-lg shadow-sm">
            <p className="font-sans text-[13px] md:text-sm font-bold text-gray-900 leading-snug text-left">
              і приводитиме клієнтів без хаосу, щоденних зйомок та втрати часу.
            </p>
          </div>

          <div className="w-full max-w-[280px] mx-auto flex flex-col gap-2 mb-6">
            <div className="bg-white/90 backdrop-blur-md rounded-none py-3.5 px-6 text-center shadow-sm relative overflow-hidden border border-gray-200">
              <div className="text-[#6B6B6B] line-through font-medium text-xs mb-0.5">{currentPriceObj.old} грн</div>
              <div className="text-[32px] font-serif font-bold text-black leading-none">{currentPriceObj.current} грн</div>
            </div>

            <div className="border border-gray-300 rounded-none py-2 px-4 text-center bg-white/70 backdrop-blur-md">
              <p className="text-black text-[10px] font-bold uppercase tracking-widest mb-0 inline-flex items-center gap-2">
                до збільшення ціни:
                <span className="text-black text-[15px] font-serif font-bold">{timerText}</span>
              </p>
            </div>
          </div>

          <div className="w-full max-w-[280px] mx-auto">
            <button onClick={openModal}
              className="w-full bg-black text-white px-8 py-3.5 font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-gray-800 transition-colors shadow-xl flex items-center justify-center gap-3">
              <span>Хочу розбір</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* RESULTS SECTION */}
      <section className="py-24 px-6 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Ось як змінюється твій візуал і контент
              <br/><span className="italic font-normal text-[#6B6B6B]">після розбору</span>
            </h2>
            <div className="w-16 h-px bg-black mx-auto mt-6"></div>
          </div>

          <div className="relative group/slider">
            <button onClick={() => scrollContainer(storytellingRef, -1)}
              className="hidden md:flex absolute -left-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 text-black shadow-sm hover:border-black transition-all">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div ref={storytellingRef} className="flex overflow-x-auto gap-4 pb-8 scrollbar-hide px-4 md:px-0">
              {['bo1.jpg', 'bo2.jpg', 'bo3.jpg', 'bo4.jpg'].map((img) => (
                <div key={img} className="shrink-0 w-[80vw] md:w-[320px] aspect-square flex items-center justify-center overflow-hidden relative border border-gray-100 transition-all group cursor-pointer"
                  onClick={() => openImageModal(`/rozbir/${img}`)}>
                  <img src={`/rozbir/${img}`} alt="Результат" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <ZoomIn className="text-black w-8 h-8 opacity-80" />
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => scrollContainer(storytellingRef, 1)}
              className="hidden md:flex absolute -right-12 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 text-black shadow-sm hover:border-black transition-all">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 text-[#6B6B6B] mt-2">
            <p className="text-[9px] uppercase tracking-[0.2em] font-medium">Гортайте приклади</p>
          </div>

          <div className="w-full max-w-xs mx-auto mt-10 text-center">
            <button onClick={openModal}
              className="inline-block bg-transparent border border-black text-black px-10 py-3 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-[10px] font-bold">
              Хочу розбір
            </button>
          </div>
        </div>
      </section>

      {/* AGITATION SECTION */}
      <section className="py-24 px-6 bg-[#F9F9F9] relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold mb-3">Чому твій контент і візуал <br/><span className="italic font-normal text-[#6B6B6B]">не працює і не продає?</span></h2>
            <div className="w-16 h-px bg-black mx-auto mt-6"></div>
            <p className="text-xs md:text-sm text-gray-500 uppercase tracking-[0.2em] font-bold mt-6">90% ЕКСПЕРТІВ РОБЛЯТЬ ОДНІ Й ТІ САМІ ПОМИЛКИ</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { 
                icon: Fingerprint, 
                prefix: 'Немає ', 
                bold: 'відчуття "це я"', 
                suffix: ': виглядаєш "як усі", що не дозволяє виділитися і запам\'ятатися.' 
              },
              { 
                icon: Clock, 
                prefix: 'Витрачаєш години на ', 
                bold: '"ідеальний пост"', 
                suffix: ' — і все одно незадоволена. Або публікуєш хаотично, або не публікуєш взагалі.' 
              },
              { 
                icon: Copy, 
                prefix: 'Працюєш то по шаблонах, то по трендам — ', 
                bold: 'не розумієш як створювати контент', 
                suffix: ', який продає.' 
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col p-6 border-l border-gray-200 hover:border-black transition-colors duration-500 group bg-white shadow-sm">
                <item.icon className="w-8 h-8 text-gray-300 group-hover:text-black transition-colors mb-4 stroke-[1.5]" />
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {item.prefix}
                  <span className="text-black font-bold">{item.bold}</span>
                  {item.suffix}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <button onClick={openModal}
              className="inline-block bg-black text-white px-10 py-4 hover:bg-gray-800 transition-all duration-300 uppercase tracking-[0.15em] text-[10px] font-bold shadow-xl">
              Хочу розбір
            </button>
          </div>
        </div>
      </section>

      {/* EXPERTS HIDE SECTION */}
      <section className="py-24 px-6 bg-white border-t border-gray-100">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-6 font-bold">
            Інші експерти <span className="italic font-normal text-[#6B6B6B]">приховують це</span>, <br/>бо заробляють на твоєму хаосі
          </h2>
          <p className="text-base md:text-lg text-black text-center mb-12 font-bold uppercase tracking-widest">На розборі ти отримаєш:</p>

          <div className="space-y-4">
            {[
              { num: '01.', text: 'Повний "апгрейд" твого блогу - розбір по деталям що змінити' },
              { num: '02.', text: 'Персональний план системи контенту та візуалу' },
              { num: '03.', text: 'Матеріали і програми для блогу' }
            ].map((item, idx) => (
              <div key={idx} className="group bg-white p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-black transition-all duration-300 flex flex-col md:flex-row md:items-center gap-4">
                <span className="font-serif text-4xl italic text-gray-300 group-hover:text-black transition-colors shrink-0">{item.num}</span>
                <p className="font-bold text-base md:text-lg text-black leading-snug">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button onClick={openModal}
              className="inline-block bg-transparent border border-black text-black px-10 py-3 hover:bg-black hover:text-white transition-all duration-300 uppercase tracking-widest text-[10px] font-bold">
              Хочу розбір
            </button>
          </div>
        </div>
      </section>

      {/* EXPERT SECTION */}
      <section className="py-24 px-6 bg-[#F9F9F9] relative border-t border-gray-200">
        <div className="max-w-2xl mx-auto">
          <div className="mb-12 text-center">
            <span className="text-black text-[10px] uppercase tracking-[0.25em] font-bold block mb-4 border-b border-black pb-1 inline-block">Контент стає легким, коли є система</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-black mb-2">Привіт, я <span className="italic font-normal text-[#6B6B6B]">Віка</span></h2>
            <p className="text-gray-500 text-xs md:text-sm uppercase font-bold tracking-widest mt-2">— ЕКСПЕРТ З КОНТЕНТУ ТА ВІЗУАЛУ</p>
          </div>

          <div className="w-64 h-80 mx-auto overflow-hidden mb-12 relative shadow-xl">
            <img src="/rozbir/vik.jpg" alt="Victoria Meshcheriakova" className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6 text-gray-800 w-full">
            <div className="bg-white p-6 md:p-8 shadow-sm border-l-4 border-black text-center">
              <p className="text-black font-medium italic leading-relaxed font-serif text-xl md:text-2xl">
                "Моє завдання — навчити бачити блог як систему, де кожен крок веде до покупки."
              </p>
            </div>
            <p className="leading-relaxed font-light text-base md:text-lg">
              Я працювала з десятками блогів експертів та брендів. Мій підхід — фундамент блогу, сенси які продають, візуал який говорить без слів. Я не вірю в "немає натхнення", я вірю в правильну структуру.
            </p>
            <p className="leading-relaxed font-light text-base md:text-lg">
              Багато експертів приходять після років хаосу: витрачають години на контент — результату немає. Публікують хаотично, без логіки. Роблять "ідеальний пост" пів дня — і не публікують взагалі. Контент = постійний стрес.
            </p>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <strong className="text-black block mb-3 uppercase text-sm tracking-widest font-bold">Я НЕ ДАЮ ЗАГАЛЬНИХ ПОРАД</strong>
              <p className="text-base md:text-lg text-gray-700 font-light leading-relaxed">На розборі я аналізую ТВОЮ ситуацію: чому контент не чіпляє, де губляться сенси, що у візуалі не працює — щоб ти точно знала як перетворити хаос на контент, який приводить клієнтів.</p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <button onClick={openModal}
              className="inline-block bg-black text-white px-10 py-4 hover:bg-gray-800 transition-all duration-300 uppercase tracking-[0.15em] text-[10px] font-bold shadow-xl">
              Хочу розбір
            </button>
          </div>
        </div>
      </section>

      {/* REVIEWS SECTION */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="px-6 mb-12 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold">Що кажуть <span className="italic font-normal text-[#6B6B6B]">дівчата</span></h2>
          <p className="text-[10px] text-gray-400 mt-3 font-light uppercase tracking-widest">Натисніть на фото, щоб відкрити</p>
        </div>

        <div className="relative max-w-6xl mx-auto group/slider">
          <button onClick={() => scrollContainer(reviewsRef, -1)}
            className="hidden md:flex absolute -left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 text-black shadow-sm hover:border-black transition-all">
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div ref={reviewsRef} className="flex overflow-x-auto gap-4 pb-8 scrollbar-hide px-6 md:px-0 w-full">
            {['r5.jpg', 'r1.jpg', 'r4.jpg', 'r2.jpg', 'r3.jpg', 'r6.jpg', 'r7.jpg', 'r8.jpg', 'r9.jpg', 'r10.jpg'].map((img) => (
              <div key={img} className="relative shrink-0 w-[80vw] md:w-[320px] aspect-square bg-gray-50 border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden transition-transform hover:scale-[1.01]"
                onClick={() => openImageModal(`/rozbir/${img}`)}>
                <img src={`/rozbir/${img}`} alt="Review" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-gray-800/15 pointer-events-none"></div>
              </div>
            ))}
          </div>

          <button onClick={() => scrollContainer(reviewsRef, 1)}
            className="hidden md:flex absolute -right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 items-center justify-center bg-white border border-gray-200 text-black shadow-sm hover:border-black transition-all">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="md:hidden text-center text-[9px] text-gray-400 mt-2 tracking-widest uppercase">гортайте →</p>
      </section>

      {/* GUARANTEE SECTION */}
      <section className="py-24 px-6 bg-[#F9F9F9] text-center pb-32">
        <div className="max-w-xl mx-auto">
          <div className="bg-white border border-gray-200 p-10 shadow-xl relative overflow-hidden">
            <div className="relative z-10 flex flex-col items-center">
              <ShieldCheck className="w-10 h-10 stroke-[1.5] text-black mb-6" />
              <h3 className="font-serif text-3xl font-bold text-black mb-4 uppercase tracking-widest">
                Гарантія <br/>
                <span className="italic font-normal text-[#6B6B6B] lowercase text-2xl">повернення</span>
              </h3>
              <p className="text-gray-600 text-sm md:text-base mb-10 font-light leading-relaxed">
                Якщо персональна система не принесе користі — я поверну тобі усі <span className="font-bold text-black">{currentPriceObj.current}</span> грн.
              </p>
              <button onClick={openModal}
                className="inline-block bg-black text-white px-10 py-4 hover:bg-gray-800 transition-all duration-300 uppercase tracking-[0.15em] text-[10px] font-bold shadow-lg w-full md:w-auto">
                Хочу розбір
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* STICKY CTA */}
      <div className={`fixed bottom-0 left-0 w-full z-40 px-6 pb-safe bg-gradient-to-t from-white via-white/95 to-transparent pt-6 transition-all duration-300 ${stickyVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'}`}>
        <div className="max-w-md mx-auto mb-2">
          <button onClick={openModal}
            className="w-full bg-black text-white px-8 py-4 font-bold uppercase tracking-[0.15em] text-[10px] md:text-xs hover:bg-gray-800 transition-colors shadow-2xl flex items-center justify-center gap-3">
            <span>Хочу розбір</span>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5">
              <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <footer className="bg-black text-white/40 py-12 text-center text-[10px] uppercase tracking-wider">
        <div className="container mx-auto px-4">
          <p className="mb-4">Віка Мещерякова &copy; 2024</p>
          {/* 
          <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-8 opacity-50">
            <a href="/privacy-policy" className="hover:text-white transition-colors">Політика конфіденційності</a>
            <a href="/public-offer" className="hover:text-white transition-colors">Публічна оферта</a>
          </div>
          */}
        </div>
      </footer>

      {/* FORM MODAL */}
      <div className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-300 ${modalOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeModal}></div>
        <div className={`bg-white w-full max-w-sm p-8 relative shadow-2xl transition-transform duration-300 ${modalOpen ? 'scale-100' : 'scale-95'}`}>
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-black transition-colors">
            <X className="w-6 h-6" />
          </button>
          <div className="text-center mb-8">
            <p className="text-[9px] uppercase tracking-[0.3em] text-gray-400 mb-2">Останній крок</p>
            <h3 className="font-serif text-3xl font-bold text-black leading-tight">ЗАБРОНЮВАТИ МІСЦЕ</h3>
            <p className="text-[12px] text-gray-500 mt-2">Введіть дані для зв'язку та отримання розбору.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Ваше ім'я</label>
              <input type="text" {...register('name', { 
                required: true,
                onChange: (e) => handleFieldChange('name', e.target.value)
              })} placeholder="Олена" className="w-full py-3 px-4" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Ваш Telegram</label>
              <input type="text" {...register('social', { 
                required: true,
                onChange: (e) => handleFieldChange('social', e.target.value)
              })} placeholder="@username" className="w-full py-3 px-4" />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Телефон</label>
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
                  className: "w-full py-3 px-4",
                  placeholder: "+"
                }}
              />
              {phoneError && <p className="text-red-500 text-[10px] mt-1">Перевірте правильність номеру</p>}
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-black text-white py-4 text-[10px] font-bold uppercase tracking-[0.15em] hover:bg-gray-800 transition-colors mt-6 disabled:opacity-50">
              {loading ? 'ОБРОБКА...' : 'Перейти до оплати'}
            </button>
          </form>
          <p className="text-[9px] text-gray-400 text-center mt-6 uppercase tracking-wider">Дані захищені.</p>
        </div>
      </div>

      {/* LIGHTBOX */}
      <div className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/95 backdrop-blur-sm transition-opacity duration-300 ${imageModalOpen ? 'visible opacity-100' : 'invisible opacity-0'}`} onClick={closeImageModal}>
        <button className="absolute top-5 right-5 text-white/70 hover:text-white z-50 p-2">
          <X className="w-8 h-8" />
        </button>
        <div className="w-full h-full flex items-center justify-center overflow-auto">
          <img src={lightboxSrc} alt="Full Screen" className="max-w-[95vw] max-h-[90vh] object-contain shadow-2xl rounded-sm" onClick={e => e.stopPropagation()} />
        </div>
      </div>
    </div>
  );
}
