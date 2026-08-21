'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Gift, Sparkles, Loader2, AlertTriangle, Check, User, Send, ArrowRight } from 'lucide-react';
import { useAuth } from '../useAuth';
import { claimPrizeCode } from '../actions';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';

function ClaimContent() {
  const { login } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const codeParam = searchParams.get('code') || '';

  const [code, setCode] = useState(codeParam);
  const [name, setName] = useState('');
  const [telegram, setTelegram] = useState('');
  const [phone, setPhone] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 1. Verify prize code if present
  useEffect(() => {
    if (codeParam) {
      verifyCode(codeParam);
    }
  }, [codeParam]);

  const verifyCode = async (c: string) => {
    if (!c.trim()) return;
    setVerifying(true);
    setError('');
    try {
      const res = await fetch(`/api/minicourse/prize/verify?code=${encodeURIComponent(c.trim())}`);
      const result = await res.json();
      if (!res.ok || !result.success) {
        setError(result.error || "Цей призовий код недійсний або вже використаний.");
        setVerified(false);
      } else {
        setVerified(true);
      }
    } catch (err) {
      console.error(err);
      setError("Помилка при перевірці коду на сервері.");
    } finally {
      setVerifying(false);
    }
  };

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !telegram.trim()) return;

    setLoading(true);
    setError('');
    try {
      const result = await claimPrizeCode(code.trim(), name.trim(), telegram.trim(), phone.trim() || undefined);
      
      setSuccess(true);
      
      // Store session and redirect after 1.5s success animation
      setTimeout(() => {
        login(result.user, result.progress);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Не вдалося активувати безкоштовний доступ.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A0000] relative flex items-center justify-center p-4 overflow-hidden">
      <InAppBrowserOverlay />

      {/* Background Neon Gradients */}
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-[#81D8D0]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#4E0000]/60 rounded-full blur-[150px] pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-[#81D8D0]/10 border border-[#81D8D0]/30 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(129,216,208,0.1)]"
          >
            <Gift className="w-8 h-8 text-[#81D8D0]" />
          </motion.div>
          <h1 className="font-montserrat text-2xl font-black uppercase tracking-wider text-white">
            Victoria <span className="text-[#E5C378]">Course</span>
          </h1>
          <p className="font-narrow text-[#81D8D0] text-sm uppercase tracking-widest mt-1">
            Активація Подарункового Доступу 🎁
          </p>
        </div>

        {/* Glass Box Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          {success ? (
            /* Success State */
            <div className="py-8 text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 bg-green-500/20 border border-green-500 text-green-400 rounded-full flex items-center justify-center mx-auto"
              >
                <Check className="w-8 h-8" />
              </motion.div>
              <h2 className="font-montserrat font-bold text-lg text-white uppercase tracking-wider">
                Доступ Активовано!
              </h2>
              <p className="text-xs text-gray-300 font-arimo leading-relaxed animate-pulse">
                Створюємо навчальний кабінет та перенаправляємо на платформу...
              </p>
            </div>
          ) : (
            /* Form / Verification View */
            <div className="space-y-6">
              {!verified ? (
                /* 1. Code Input View if code not pre-verified */
                <div className="space-y-4">
                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-300 font-arimo leading-relaxed">
                      Будь ласка, введіть свій призовий код нижче для безкоштовної активації практикуму.
                    </p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-950/50 border border-red-500/25 text-red-200 rounded-xl text-xs font-arimo flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="prize-xxxx-xxxx"
                      disabled={verifying}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-mono placeholder-gray-600 text-center uppercase"
                    />
                  </div>

                  <button
                    onClick={() => verifyCode(code)}
                    disabled={verifying || !code.trim()}
                    className="w-full py-3.5 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {verifying ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Перевірка...</span>
                      </>
                    ) : (
                      <>
                        <span>Перевірити код</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* 2. Registration Form View when code is verified */
                <form onSubmit={handleClaim} className="space-y-4">
                  <div className="text-center">
                    <p className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Код успішно перевірено!
                    </p>
                    <p className="text-[10px] text-gray-400 font-arimo mt-1">
                      Заповніть свої контакти для надання безкоштовного доступу
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-950/50 border border-red-500/25 text-red-200 rounded-xl text-xs font-arimo flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#81D8D0] mb-1 font-narrow">
                      Ваше Ім'я *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Іван Іванов"
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all text-xs placeholder-gray-600 font-montserrat"
                      />
                    </div>
                  </div>

                  {/* Telegram Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#81D8D0] mb-1 font-narrow">
                      Telegram нікнейм *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-2.5 text-gray-500 font-bold text-xs">@</span>
                      <input
                        type="text"
                        required
                        value={telegram}
                        onChange={(e) => setTelegram(e.target.value)}
                        placeholder="username"
                        disabled={loading}
                        className="w-full pl-8 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all text-xs placeholder-gray-600 font-montserrat"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#81D8D0] mb-1 font-narrow">
                      Номер Телефону (опціонально)
                    </label>
                    <div className="relative">
                      <Send className="absolute left-4 top-3 h-4 w-4 text-gray-500" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+380991234567"
                        disabled={loading}
                        className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all text-xs placeholder-gray-600 font-montserrat"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !name.trim() || !telegram.trim()}
                    className="w-full py-3.5 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer shadow-[0_0_25px_rgba(129,216,208,0.2)]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Активація доступу...</span>
                      </>
                    ) : (
                      <>
                        <span>Активувати безкоштовний доступ</span>
                        <Sparkles className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="pt-2 text-center border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setVerified(false)}
                      className="text-[10px] text-gray-500 hover:text-white transition-colors"
                    >
                      Спробувати інший код
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function ClaimPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-[#81D8D0] animate-spin" />
      </main>
    }>
      <ClaimContent />
    </Suspense>
  );
}
