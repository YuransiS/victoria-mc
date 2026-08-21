'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../useAuth';
import { Sparkles, Loader2, AlertTriangle, Send } from 'lucide-react';
import { loginUser } from '../actions';
import InAppBrowserOverlay from '@/components/InAppBrowserOverlay';

function LoginContent() {
  const { login, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tokenParam = searchParams.get('token');
  const tgIdParam = searchParams.get('tg_id') || searchParams.get('username') || searchParams.get('telegram');
  const redirectParam = searchParams.get('redirect') || '/minicourse';
  const warningParam = searchParams.get('warning');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenVerifying, setTokenVerifying] = useState(!!(tokenParam || tgIdParam));
  const [deviceUuid, setDeviceUuid] = useState('');
  const [isUnpaid, setIsUnpaid] = useState(false);
  const [telegramInput, setTelegramInput] = useState('');

  const handleManualLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!telegramInput.trim()) return;

    setLoading(true);
    setError('');
    setIsUnpaid(false);
    try {
      const res = await loginUser(telegramInput.trim(), undefined, deviceUuid);
      if (!res.success || !res.user || !res.progress) {
        const errMsg = res.error || '';
        if (errMsg.includes('ще не сплачено') || errMsg.includes('не сплачено')) {
          setIsUnpaid(true);
        }
        setError(errMsg || "Не вдалося авторизуватися. Будь ласка, перевірте свій нікнейм.");
        return;
      }
      login(res.user, res.progress);
      router.push(redirectParam);
    } catch (err: any) {
      console.error("Manual login failed:", err);
      setError("Помилка авторизації. Будь ласка, спробуйте пізніше.");
    } finally {
      setLoading(false);
    }
  };

  // 1. Get or generate device UUID for device tracking limits
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let uuid = localStorage.getItem('minicourse_device_uuid');
      if (!uuid) {
        uuid = 'dev-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now().toString(36);
        localStorage.setItem('minicourse_device_uuid', uuid);
      }
      setDeviceUuid(uuid);
    }
  }, []);

  // 2. Detect warning parameters and show descriptive error messages
  useEffect(() => {
    if (warningParam) {
      if (warningParam === 'expired') {
        setError('Термін дії Вашого доступу до міні-курсу закінчився. Доступ надається на 2 тижні з моменту оплати.');
      } else if (warningParam === 'unpaid') {
        setIsUnpaid(true);
        setError('Доступ обмежено. Оплата практикуму ще не підтверджена.');
      } else if (warningParam === 'blocked') {
        setError('Доступ заблоковано через перевищення ліміту унікальних пристроїв. Будь ласка, зверніться до підтримки.');
      }
    }
  }, [warningParam]);

  // 3. Auto-authenticate when coming from bot with autologin token or tg_id
  useEffect(() => {
    if ((tokenParam || tgIdParam) && deviceUuid) {
      const performTokenAuth = async () => {
        setLoading(true);
        setTokenVerifying(true);
        setError('');
        setIsUnpaid(false);
        try {
          const res = await fetch('/api/minicourse/token-auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: tokenParam, tgId: tgIdParam, deviceUuid })
          });
          const result = await res.json();

          if (!res.ok || !result.success) {
            if (result.error === 'access_expired') {
              setError('Термін дії Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).');
            } else if (result.error === 'unpaid') {
              setIsUnpaid(true);
              setError('Доступ обмежено. Оплата практикуму не підтверджена або профіль не знайдено.');
            } else {
              setError(result.error || 'Не вдалося авторизуватися. Будь ласка, перейдіть за свіжим посиланням з бота.');
            }
            return;
          }

          // Successfully authenticated, store session and redirect
          login(result.user, result.progress);
          router.push(redirectParam);
        } catch (err: any) {
          console.error("Autologin via token failed:", err);
          setError("Помилка автоматичного входу. Будь ласка, спробуйте пізніше.");
        } finally {
          setLoading(false);
          setTokenVerifying(false);
        }
      };
      performTokenAuth();
    }
  }, [tokenParam, tgIdParam, deviceUuid, login, redirectParam, router]);

  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-[#81D8D0] animate-spin" />
      </main>
    );
  }

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
            <Sparkles className="w-8 h-8 text-[#81D8D0]" />
          </motion.div>
          <h1 className="font-montserrat text-3xl font-black uppercase tracking-wider text-white">
            Victoria <span className="text-[#E5C378]">Course</span>
          </h1>
          <p className="font-narrow text-[#81D8D0] text-lg uppercase tracking-widest mt-1">
            Платформа Міні-Курсу
          </p>
        </div>

        {/* Glass Box Container */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_16px_40px_rgba(0,0,0,0.5)] space-y-6">

          {tokenVerifying ? (
            /* Loading State for Token Verification */
            <div className="py-8 text-center space-y-4">
              <Loader2 className="h-12 w-12 text-[#81D8D0] animate-spin mx-auto" />
              <p className="font-narrow text-[#81D8D0] uppercase tracking-widest text-sm font-bold animate-pulse">
                Авторизація через Telegram...
              </p>
            </div>
          ) : isUnpaid ? (
            /* Unpaid error view with link to purchase */
            <div className="py-4 text-center space-y-6">
              <div className="rounded-full bg-red-950/50 border border-red-500/25 p-4 w-16 h-16 flex items-center justify-center mx-auto text-red-400">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-white font-montserrat font-bold text-lg uppercase tracking-wider">
                  Доступ обмежено
                </h2>
                <p className="text-xs text-gray-300 font-arimo leading-relaxed">
                  На жаль, оплату для цього профілю не знайдено, або Ваша участь ще не підтверджена платіжною системою.
                </p>
                <p className="text-xs text-gray-400 font-arimo leading-relaxed">
                  Якщо Ви ще не придбали міні-курс, Ви можете зробити це на нашій головній сторінці за посиланням нижче.
                </p>
              </div>
              
              <a
                href="/"
                className="flex w-full items-center justify-center rounded-xl bg-[#81D8D0] py-4 text-center font-bold uppercase tracking-wider text-[#4E0000] transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(129,216,208,0.2)] font-montserrat"
              >
                Придбати міні-курс
              </a>
              
              <div className="pt-2 text-center border-t border-white/5">
                <p className="text-[10px] text-gray-400 font-arimo">
                  Вже оплатили і виникла помилка? Напишіть у техпідтримку:{" "}
                  <a href="https://t.me/YuransiS" target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline font-bold font-montserrat">
                    @YuransiS
                  </a>
                </p>
              </div>
            </div>
          ) : (
            /* Standard Telegram Auth Info */
            <>
              <div className="text-center space-y-2">
                <h2 className="text-white font-montserrat font-bold text-lg uppercase tracking-wider">
                  Вхід на Платформу
                </h2>
                <p className="text-xs text-gray-300 font-arimo leading-relaxed">
                  Вхід до кабінету практикуму здійснюється за Вашим Telegram нікнеймом.
                  Будь ласка, введіть його нижче для входу на платформу.
                </p>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 bg-red-950/50 border border-red-500/25 text-red-200 rounded-xl text-xs font-arimo flex items-start space-x-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Manual Telegram Username Login Form */}
              <div className="space-y-4 flex flex-col items-center w-full">
                <form onSubmit={handleManualLogin} className="space-y-4 w-full">
                  <div className="relative">
                    <span className="absolute left-4 top-3.5 text-gray-400 font-montserrat font-bold">@</span>
                    <input
                      type="text"
                      required
                      value={telegramInput}
                      onChange={(e) => setTelegramInput(e.target.value)}
                      placeholder="username"
                      disabled={loading}
                      className="w-full pl-8 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white transition-all font-montserrat placeholder-gray-500"
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading || !telegramInput.trim()}
                    className="w-full py-3.5 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(129,216,208,0.2)] disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Вхід...</span>
                      </>
                    ) : (
                      <span>Увійти</span>
                    )}
                  </motion.button>
                </form>

                <div className="pt-2 text-center border-t border-white/5 w-full">
                  <p className="text-[10px] text-gray-400 font-arimo">
                    Виникли проблеми з доступом? Напишіть у техпідтримку:{" "}
                    <a href="https://t.me/YuransiS" target="_blank" rel="noopener noreferrer" className="text-[#81D8D0] hover:underline font-bold font-montserrat">
                      @YuransiS
                    </a>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#1A0000] flex items-center justify-center p-4">
        <Loader2 className="h-10 w-10 text-[#81D8D0] animate-spin" />
      </main>
    }>
      <LoginContent />
    </Suspense>
  );
}
