'use client';

import React, { useEffect, Suspense } from 'react';
import { trackFBEvent } from '@/components/FacebookPixel';
import { ArrowRight, Send, CheckCircle2 } from 'lucide-react';

const InstagramIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const YoutubeIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export default function AnketaThanksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0e0f0f] flex items-center justify-center text-[#ebd8b8]">
        <div className="animate-spin h-8 w-8 border-4 border-t-transparent border-[#ebd8b8] rounded-full"></div>
      </div>
    }>
      <AnketaThanksContent />
    </Suspense>
  );
}

function AnketaThanksContent() {
  useEffect(() => {
    trackFBEvent('PageView', {});
  }, []);

  const TELEGRAM_CHANNEL_URL = 'https://telegram.me/+idsZRC5s1yo0YmUy';
  const INSTAGRAM_URL = 'https://www.instagram.com/victoria_meshcheriakova/';
  const YOUTUBE_URL = 'https://www.youtube.com/@victoria_meshcheriakova';

  return (
    <div className="antialiased min-h-screen bg-[#0e0f0f] text-[#f7f4ec] font-sans selection:bg-[#5d5f2c] selection:text-white relative overflow-x-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 transform -translate-x-1/2 w-[90vw] max-w-[800px] h-[500px] bg-[#5d5f2c]/15 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] max-w-[500px] h-[400px] bg-[#ebd8b8]/5 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center">
        
        {/* Top Notification Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#5d5f2c]/20 border border-[#5d5f2c]/40 text-[#ebd8b8] text-xs sm:text-sm font-semibold uppercase tracking-wider mb-6">
          <CheckCircle2 size={16} className="text-[#8bb33d]" />
          <span>Анкету успішно надіслано</span>
        </div>

        {/* Main Headings */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10 space-y-3">
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.2]">
            Дякую за заповнення анкети!
          </h1>
          <p className="font-sans text-base sm:text-xl text-[#ebd8b8] font-medium leading-relaxed">
            Обовʼязково подивись це коротке відео перед переходом у канал 👇
          </p>
        </div>

        {/* Video Container */}
        <div className="w-full max-w-3xl rounded-2xl overflow-hidden bg-black/80 border border-[#ebd8b8]/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative group mb-8">
          <div className="relative w-full aspect-video">
            <iframe
              src="https://www.youtube-nocookie.com/embed/4eRMkjUV0MQ?autoplay=1&playsinline=1&rel=0&modestbranding=1"
              title="Відео для тих, хто заповнив анкету передзапису"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full border-0"
            />
          </div>
        </div>

        {/* Primary Call to Action */}
        <div className="w-full max-w-md mx-auto text-center space-y-4 mb-12">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-3 bg-[#5d5f2c] text-white py-4 sm:py-5 px-8 rounded-xl text-sm sm:text-base font-bold uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(93,95,44,0.3)] hover:bg-[#484a22] hover:shadow-[0_15px_40px_rgba(93,95,44,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 group cursor-pointer"
          >
            <Send size={18} className="text-white group-hover:translate-x-1 transition-transform" />
            <span>Перейти в канал передзапису</span>
            <ArrowRight size={18} />
          </a>

          <p className="text-xs text-[#f7f4ec]/60 font-light leading-relaxed">
            * У каналі на тебе чекають бонуси, матеріали та перші анонси програми
          </p>
        </div>

        {/* Social Links Block */}
        <div className="w-full max-w-lg mx-auto pt-8 border-t border-white/10 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-[#ebd8b8]/70 font-semibold mb-5">
            Слідкуй за моїм контентом та оновленнями:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#ebd8b8]/50 hover:bg-white/10 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <InstagramIcon className="w-5 h-5 text-[#E1306C]" />
              <span>Instagram</span>
            </a>

            <a
              href={YOUTUBE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#ebd8b8]/50 hover:bg-white/10 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <YoutubeIcon className="w-5 h-5 text-[#FF0000]" />
              <span>YouTube</span>
            </a>

            <a
              href={TELEGRAM_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#ebd8b8]/50 hover:bg-white/10 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 shadow-sm"
            >
              <Send size={16} className="text-[#229ED9]" />
              <span>Telegram Канал</span>
            </a>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-16 text-center text-xs text-white/30 tracking-widest uppercase">
          Вікторія Мещерякова &copy; 2026
        </div>

      </div>
    </div>
  );
}
