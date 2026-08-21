'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../useAuth';
import { updateProgress, getLessonsConfig, uploadHomeworkFile } from '../../supabase';
import { HomeworkStatus, MinicourseLessonConfig } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Clock, AlertCircle, FileText, Download, 
  Send, HelpCircle, CheckCircle, ChevronRight, Play, BookOpen, AlertTriangle, Award, X, ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function LessonPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = Number(params.id) as 1 | 2 | 3;
  
  
  const { user, progress, loading, refreshProgress } = useAuth();
  
  const accessStart = user?.access_opened_at || user?.created_at;
  const feedbackElapsedDays = accessStart 
    ? (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24) 
    : 0;
  const isFeedbackExpired = user?.role === 'student' && feedbackElapsedDays > 7;

  // State definitions
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [isCompletionModalOpen, setIsCompletionModalOpen] = useState(false);
  const [hwUrlInput, setHwUrlInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [lessonConfigs, setLessonConfigs] = useState<MinicourseLessonConfig[]>([]);
  const [isTelegramModalOpen, setIsTelegramModalOpen] = useState(false);
  const [telegramCountdown, setTelegramCountdown] = useState(5);

  const currentProgressRef = useRef<{ currentTime: number; duration: number; isCompletedNow: boolean } | null>(null);

  // Lesson Metadata Config loaded dynamically
  const currentConfig = lessonConfigs.find(c => c.lesson_id === lessonId);
  
  const isNewCohort = accessStart 
    ? new Date(accessStart) >= new Date('2026-07-18T00:00:00Z')
    : true; // Default to new if no date yet
  
  const currentLesson = currentConfig ? {
    title: currentConfig.title || `Урок ${lessonId}`,
    description: currentConfig.description || '',
    youtubeId: currentConfig.youtube_id || '',
    links: Array.isArray(currentConfig.links) ? currentConfig.links : [],
    descriptionUnderVideo: currentConfig.description_under_video || currentConfig.hw_instructions || '',
    hwInstructions: currentConfig.description_under_video || currentConfig.hw_instructions || ''
  } : {
    title: `Урок ${lessonId}`,
    description: '',
    youtubeId: '',
    links: [],
    descriptionUnderVideo: '',
    hwInstructions: ''
  };

  const lessonProgress = progress?.lessons[lessonId];

  // Load YouTube Player API and initialize
  useEffect(() => {
    if (!currentLesson.youtubeId) return;

    // 1. Inject YouTube Iframe Player API script if not already loaded
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let player: any = null;
    let intervalId: NodeJS.Timeout | null = null;
    let localVideoCompleted = lessonProgress?.videoCompleted || false;

    const initializePlayer = () => {
      player = new (window as any).YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: currentLesson.youtubeId,
        playerVars: {
          autoplay: 0,
          rel: 0,
          modestbranding: 1,
          controls: 1
        },
        events: {
          onStateChange: (event: any) => {
            if (event.data === (window as any).YT.PlayerState.PLAYING) {
              startTracking();
            } else {
              stopTracking();
              saveProgressToDb();
            }
          }
        }
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initializePlayer();
    } else {
      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initializePlayer();
      };
    }

    const startTracking = () => {
      if (intervalId) clearInterval(intervalId);
      intervalId = setInterval(() => {
        if (!player || typeof player.getCurrentTime !== 'function') return;

        const currentTime = Math.round(player.getCurrentTime());
        const duration = Math.round(player.getDuration());

        if (duration > 0) {
          const progressPercent = (currentTime / duration) * 100;
          const isCompletedNow = progressPercent >= 80;

          if (isCompletedNow && !localVideoCompleted) {
            localVideoCompleted = true;
            triggerVideoCompletion(currentTime, duration);
          }

          currentProgressRef.current = { currentTime, duration, isCompletedNow };
        }
      }, 3000);
    };

    const stopTracking = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const saveProgressToDb = async () => {
      const current = currentProgressRef.current;
      if (!current || !user || !progress) return;

      try {
        await updateProgress(user.id, lessonId, {
          videoWatchedSec: current.currentTime,
          videoDurationSec: current.duration,
          videoCompleted: current.isCompletedNow || lessonProgress?.videoCompleted || false,
          ...(current.isCompletedNow && !lessonProgress?.videoCompleted ? { videoCompletedAt: new Date().toISOString() } : {})
        });
      } catch (err) {
        console.error("Failed to auto-save video progress:", err);
      }
    };

    const triggerVideoCompletion = async (watchedSec: number, durationSec: number) => {
      if (!user) return;
      try {
        await updateProgress(user.id, lessonId, {
          videoWatchedSec: watchedSec,
          videoDurationSec: durationSec,
          videoCompleted: true,
          videoCompletedAt: new Date().toISOString()
        });
        refreshProgress();
      } catch (err) {
        console.error("Failed to update video completion status:", err);
      }
    };

    return () => {
      stopTracking();
      if (player && typeof player.destroy === 'function') {
        player.destroy();
      }
    };
  }, [currentLesson.youtubeId, lessonId, user, progress]);

  const formatInstructions = (text: string) => {
    if (!text) return null;
    const paragraphs = text.split('\n\n');
    return paragraphs.map((p, idx) => (
      <p key={idx} className={idx > 0 ? "mt-4" : ""}>
        {p.trim()}
      </p>
    ));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg("Файл занадто великий. Максимальний розмір 5MB.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg('');
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  

  // Fetch lesson configurations dynamically
  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const configs = await getLessonsConfig();
        setLessonConfigs(configs);
      } catch (err) {
        console.error("Failed to load lesson configs:", err);
      }
    };
    fetchConfigs();
  }, []);

  // Timer state
  const [timeLeftStr, setTimeLeftStr] = useState('');
  const [timerWarning, setTimerWarning] = useState(false);



  // Auto-record "Opened At" timestamp if not set
  useEffect(() => {
    const recordOpenTime = async () => {
      if (user && progress && lessonProgress && !lessonProgress.openedAt) {
        try {
          const openTime = new Date().toISOString();
          await updateProgress(user.id, lessonId, {
            openedAt: openTime
          });
          refreshProgress();

          // Schedule QStash deadline reminder (24 hours from opening)
          fetch('/api/homework/assign', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id,
              lessonId,
              deadlineAt: new Date(new Date(openTime).getTime() + 24 * 60 * 60 * 1000).toISOString()
            })
          }).catch(err => console.error("Failed to schedule QStash reminder:", err));
        } catch (err) {
          console.error("Failed to update lesson opened timestamp:", err);
        }
      }
    };

    if (!loading && user && progress) {
      if (!lessonProgress || !lessonProgress.unlocked) {
        // Redirect if trying to access a locked lesson
        router.push('/minicourse');
      } else {
        recordOpenTime();
      }
    }
  }, [loading, user, progress, lessonProgress, lessonId, router, refreshProgress]);

  // Handle countdown timer
  useEffect(() => {
    if (!lessonProgress || !lessonProgress.openedAt || lessonProgress.hwStatus === 'accepted' || lessonProgress.hwSubmitted) {
      setTimeLeftStr('');
      setTimerWarning(false);
      return;
    }

    const openedTime = new Date(lessonProgress.openedAt).getTime();
    const deadline = openedTime + 24 * 3600 * 1000; // + 24 hours

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadline - now;

      if (diff <= 0) {
        setTimeLeftStr("Час вичерпано ⏰");
        setTimerWarning(true);
        return;
      }

      const hours = Math.floor(diff / (3600 * 1000));
      const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((diff % (60 * 1000)) / 1000);

      const hoursStr = hours.toString().padStart(2, '0');
      const minsStr = mins.toString().padStart(2, '0');
      const secsStr = secs.toString().padStart(2, '0');

      setTimeLeftStr(`${hoursStr}:${minsStr}:${secsStr}`);

      // Warning when less than 3 hours left (3 * 3600 * 1000)
      if (diff < 3 * 3600 * 1000) {
        setTimerWarning(true);
      } else {
        setTimerWarning(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [lessonProgress]);

  // Sync input value with already submitted URL
  useEffect(() => {
    if (lessonProgress?.hwUrl) {
      setHwUrlInput(lessonProgress.hwUrl);
    }
  }, [lessonProgress]);

  // Handle Telegram Redirect Countdown for Lesson 1
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTelegramModalOpen && telegramCountdown > 0) {
      interval = setInterval(() => {
        setTelegramCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isTelegramModalOpen && telegramCountdown === 0) {
      window.location.href = "https://t.me/+gKmEEjeNar02NDIy";
    }
    return () => clearInterval(interval);
  }, [isTelegramModalOpen, telegramCountdown]);

  if (loading || !user || !progress || !lessonProgress) {
    return (
      <div className="min-h-screen bg-[#1A0000] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#81D8D0] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-narrow text-[#81D8D0] uppercase tracking-widest text-sm">Завантаження уроку...</p>
        </div>
      </div>
    );
  }

  const handleHwSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (isFeedbackExpired) {
      setErrorMsg("Термін зворотнього зв'язку закінчився. Здача ДЗ більше недоступна.");
      return;
    }

    if (!hwUrlInput.trim()) {
      setErrorMsg("Будь ласка, введіть посилання на вашу таблицю/звіт");
      return;
    }

    setSubmitting(true);
    try {
      await updateProgress(user.id, lessonId, {
        hwSubmitted: true,
        hwUrl: hwUrlInput.trim(),
        hwStatus: 'pending',
        hwSubmittedAt: new Date().toISOString()
      });
      setSuccessMsg("Домашнє завдання успішно надіслано на перевірку! 🎉");
      refreshProgress();

      // Cancel QStash deadline reminder
      fetch('/api/homework/cancel-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          lessonId
        })
      }).catch(err => console.error("Failed to cancel QStash reminder:", err));

      // Trigger Telegram notification to the student about submission receipt
      if (user.telegram_chat_id) {
        fetch('/api/minicourse/bot/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: user.telegram_chat_id,
            messageType: 'hw_submitted',
            templateData: {
              userName: user.name,
              lessonId: lessonId,
              actionUrl: `${window.location.origin}/minicourse`
            }
          })
        }).catch(err => console.error("Failed to trigger homework submit telegram notification:", err));
      }

      // Trigger Telegram invite modal if it's Lesson 1
      if (lessonId === 1) {
        setIsTelegramModalOpen(true);
        setTelegramCountdown(5);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Помилка надсилання. Спробуйте ще раз.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1A0000] text-white font-montserrat flex flex-col pb-16">
      {/* Background Neon Glows */}
      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#81D8D0]/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/minicourse" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-all font-narrow text-xs font-bold uppercase tracking-wider">
            <ArrowLeft className="w-4 h-4 text-[#81D8D0]" />
            <span>Назад на панель</span>
          </Link>
          <span className="font-bold text-xs uppercase tracking-widest text-[#81D8D0] bg-[#81D8D0]/10 px-3 py-1.5 rounded-lg border border-[#81D8D0]/20">
            {currentLesson.title}
          </span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 flex-1">
        
        {/* Left Column - Video Player & Materials (Width 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Cinema YouTube Container */}
          <section className="bg-black/40 border border-white/10 rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            <div className="relative aspect-video w-full bg-black">
              <div className="absolute inset-0 w-full h-full">
                <div id="youtube-player" className="w-full h-full"></div>
              </div>
            </div>
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl font-black uppercase text-white">{currentLesson.title}</h2>
              <p className="text-sm text-[#81D8D0] font-narrow uppercase tracking-widest mt-1">{currentLesson.description}</p>
            </div>
          </section>

          {/* Description / Notes Under Video */}
          {currentLesson.descriptionUnderVideo && (
            <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-4 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <span className="text-[10px] font-bold text-[#81D8D0] uppercase tracking-widest font-narrow flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Опис та завдання до уроку</span>
              </span>
              <div className="text-xs font-arimo text-gray-300 leading-relaxed space-y-3 whitespace-pre-line">
                {currentLesson.descriptionUnderVideo}
              </div>
            </section>
          )}

          {/* Dynamic Download & Materials Links Section */}
          {currentLesson.links && currentLesson.links.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-[#81D8D0]" />
                <span>Корисні матеріали та посилання</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {currentLesson.links.map((link, idx) => (
                  <div 
                    key={link.id || idx}
                    className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between backdrop-blur-sm hover:border-[#81D8D0]/30 transition-all group"
                  >
                    <div className="flex items-center space-x-4 pr-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-[#81D8D0]/10 border border-[#81D8D0]/20 flex items-center justify-center text-[#81D8D0] shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate">{link.title}</h4>
                        <p className="text-[10px] text-gray-400 font-arimo truncate">{link.url}</p>
                      </div>
                    </div>
                    <a 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#81D8D0]/50 hover:bg-[#81D8D0] hover:text-[#1A0000] text-gray-300 transition-all shrink-0"
                      title="Відкрити посилання"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}

          
        </div>

        {/* Right Column - Submission Form & Timers (Width 1/3) */}
        <div className="space-y-8">
          
          {/* 24h Countdown Timer Widget */}
          {timeLeftStr && (
            <div className={`border rounded-3xl p-6 backdrop-blur-md relative overflow-hidden transition-all ${
              timerWarning 
                ? 'bg-red-950/20 border-red-500/30' 
                : 'bg-[#81D8D0]/5 border-[#81D8D0]/20'
            }`}>
              <div className="flex items-center space-x-3 mb-2">
                <Clock className={`w-5 h-5 ${timerWarning ? 'text-red-400 animate-pulse' : 'text-[#81D8D0]'}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest font-narrow ${
                  timerWarning ? 'text-red-400' : 'text-[#81D8D0]'
                }`}>
                  Ліміт на здачу домашнього завдання
                </span>
              </div>
              
              <div className="flex items-baseline space-x-2">
                <span className={`text-4xl font-black font-narrow tracking-widest ${
                  timerWarning ? 'text-red-400' : 'text-white'
                }`}>
                  {timeLeftStr}
                </span>
              </div>

              <p className="text-[10px] text-gray-400 mt-2 font-arimo">
                У вас є 24 години на здачу завдання після відкриття ефіру. 
                {timerWarning && " ⚠️ Менше 3 годин залишилось! Покваптесь."}
              </p>
            </div>
          )}

          {/* Homework Submission Box */}
          <section className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-md space-y-6">
            <h3 className="text-lg font-black uppercase text-white tracking-wider flex items-center space-x-2">
              <FileText className="w-5 h-5 text-[#81D8D0]" />
              <span>Домашнє завдання</span>
            </h3>

            {/* Markdown Instructions */}
            <div className="text-xs font-arimo text-gray-300 leading-relaxed whitespace-pre-line bg-black/20 border border-white/5 rounded-2xl p-4">
              {formatInstructions(currentLesson.hwInstructions) || (
                <p className="text-gray-500 italic">Виконайте завдання згідно з матеріалами уроку та надішліть посилання нижче.</p>
              )}
            </div>

            {/* Homework submission Status Indicator */}
            {lessonProgress.hwSubmitted && (
              <div className="border border-white/5 rounded-2xl p-4 bg-black/30 space-y-3">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-narrow">Статус завдання</span>
                  {lessonProgress.hwStatus === 'accepted' ? (
                    <span className="px-2.5 py-1 rounded bg-green-950/20 border border-green-500/30 text-green-400 font-bold text-[10px] uppercase">
                      Зараховано 🎉
                    </span>
                  ) : lessonProgress.hwStatus === 'needs_improvement' ? (
                    <span className="px-2.5 py-1 rounded bg-amber-950/20 border border-amber-500/30 text-amber-400 font-bold text-[10px] uppercase">
                      Потребує допрацювання ⚠️
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded bg-[#81D8D0]/10 border border-[#81D8D0]/20 text-[#81D8D0] font-bold text-[10px] uppercase">
                      На перевірці ⏳
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-narrow">Ваше посилання на перевірку:</p>
                  <a 
                    href={lessonProgress.hwUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-[#81D8D0] hover:underline block break-all font-arimo"
                  >
                    {lessonProgress.hwUrl}
                  </a>
                </div>

                {lessonProgress.hwComment && (
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-1 bg-white/5 rounded-xl p-3">
                    <p className="text-[9px] text-[#E5C378] font-bold uppercase tracking-wider font-narrow">Рецензія Куратора / Адміна:</p>
                    <p className="text-xs text-gray-300 italic font-arimo">&ldquo;{lessonProgress.hwComment}&rdquo;</p>
                  </div>
                )}
              </div>
            )}

            {/* Submission Input form */}
            {isFeedbackExpired ? (
              <div className="p-4 bg-amber-950/20 border border-amber-500/25 text-amber-400 rounded-2xl flex items-start space-x-3 mt-4">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase">Термін здачі минув</p>
                  <p className="text-[10px] text-gray-300 font-arimo leading-relaxed">
                    Термін перевірки домашнього завдання з куратором (7 днів) закінчився. Ви все ще можете переглядати уроки та виконувати завдання для себе, але надсилання робіт на перевірку більше недоступне.
                  </p>
                </div>
              </div>
            ) : (
              (lessonProgress.hwStatus === 'not_started' || lessonProgress.hwStatus === 'needs_improvement') && (
                <form onSubmit={handleHwSubmit} className="space-y-4 pt-4 border-t border-white/10">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#81D8D0] mb-2 font-narrow">
                      Введіть посилання на скопійовану таблицю / Notion звіт:
                    </label>
                    <input 
                      type="url"
                      required
                      value={hwUrlInput}
                      onChange={(e) => setHwUrlInput(e.target.value)}
                      placeholder="https://docs.google.com/spreadsheets/d/..."
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#81D8D0] focus:ring-1 focus:ring-[#81D8D0] outline-none text-white text-xs font-arimo transition-all placeholder-gray-600"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-950/40 border border-red-500/20 text-red-300 rounded-xl text-[10px] font-arimo">
                      {errorMsg}
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-3 bg-green-950/40 border border-green-500/20 text-green-300 rounded-xl text-[10px] font-arimo">
                      {successMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase text-xs tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_15px_rgba(129,216,208,0.2)] disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submitting ? 'Надсилання...' : 'Здати на перевірку'}</span>
                  </button>
                </form>
              )
            )}

            {/* Next lesson unlocked notification */}
            {lessonProgress.hwStatus === 'accepted' && (
              <div className="p-4 bg-green-950/30 border border-green-500/20 rounded-2xl flex items-start space-x-3 text-green-400">
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase">Завдання успішно прийнято!</p>
                  <p className="text-[10px] text-gray-300 font-arimo">
                    {lessonId < 3 
                      ? "Вітаємо! Наступний ефір вже відкритий на вашому робочому столі. Поверніться на панель."
                      : "🎉 Ви повністю закінчили цей курс та придбали свою першу акцію! Вітаємо!"}
                  </p>
                </div>
              </div>
            )}
          </section>

          {/* Permanent Help Telegram Button */}
          <a 
            href="https://t.me/YuransiS" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-3.5 bg-white/5 border border-white/10 hover:border-[#81D8D0]/30 text-gray-300 hover:text-white text-center font-montserrat font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all bg-black/20"
          >
            <HelpCircle className="w-4 h-4 text-[#81D8D0]" />
            <span>Маєте питання? Напишіть нам</span>
          </a>
        </div>
      </main>

      
      {/* Completion Success Modal for Lesson 3 */}
      <AnimatePresence>
        {isCompletionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#2E0000] border border-[#81D8D0]/30 rounded-3xl p-8 text-center shadow-[0_24px_50px_rgba(129,216,208,0.15)] overflow-hidden"
            >
              <button 
                onClick={() => setIsCompletionModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="w-16 h-16 bg-[#81D8D0]/10 border border-[#81D8D0]/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-[#81D8D0]" />
              </div>

              <h3 className="font-montserrat text-2xl font-black text-white uppercase tracking-wider mb-4">
                ЗАВДАННЯ УСПІШНО ПРИЙНЯТО!
              </h3>

              <p className="font-arimo text-gray-200 text-sm leading-relaxed mb-6">
                🎉 Ви повністю закінчили цей курс та придбали свою першу акцію! Вітаємо!
              </p>

              <div className="p-4 bg-black/25 border border-white/5 rounded-2xl mb-8">
                <p className="font-narrow text-xs font-bold text-[#81D8D0] uppercase tracking-widest leading-relaxed">
                  Щоб дізнатись більше про менторство з Софією пишіть нам на телеграм кодове слово «МЕНТОРСТВО»
                </p>
              </div>

              <a 
                href="https://t.me/sofi_finsight"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(129,216,208,0.3)]"
              >
                <Send className="w-5 h-5" />
                <span>Звʼязатись з нами в TG</span>
              </a>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Telegram Channel Promo Modal */}
      <AnimatePresence>
        {isTelegramModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#2E0000] border border-[#81D8D0]/30 rounded-3xl p-8 text-center shadow-[0_24px_50px_rgba(129,216,208,0.15)] overflow-hidden"
            >
              {/* Decorative background glows */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-[#81D8D0]/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-[#81D8D0]/10 rounded-full blur-2xl pointer-events-none" />

              <button 
                onClick={() => setIsTelegramModalOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-all z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Telegram Custom Premium Icon */}
              <div className="w-16 h-16 bg-[#81D8D0]/10 border border-[#81D8D0]/20 rounded-2xl flex items-center justify-center text-[#81D8D0] mx-auto mb-6 shadow-[0_0_20px_rgba(129,216,208,0.1)]">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15.82-1.05 4.67-1.5 6.75-.19.88-.6 1.18-.91 1.21-.69.06-1.21-.46-1.88-.9-1.05-.68-1.64-1.11-2.66-1.78-1.17-.78-.41-1.2.26-1.89.17-.18 3.19-2.92 3.25-3.18.01-.03.01-.15-.06-.21-.07-.06-.17-.04-.25-.02-.11.02-1.82 1.15-5.12 3.38-.48.33-.92.49-1.31.48-.43-.01-1.26-.24-1.87-.44-.75-.24-1.35-.37-1.3-.79.03-.22.33-.45.92-.69 3.6-1.57 6-2.6 7.2-3.1 3.42-1.42 4.13-1.67 4.6-.17.1.32.08.68.04.89z" />
                </svg>
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-black uppercase text-white mb-3 tracking-wide leading-snug">
                Вступайте в телеграм канал з учасниками міні-курсу
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-6 font-arimo">
                В ньому публікуємо корисну інформацію для учасників та даємо цінні поради
              </p>

              {/* Link Container */}
              <div className="bg-black/30 border border-white/5 rounded-2xl p-4 mb-6">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider font-narrow block mb-1">
                  Посилання на канал
                </span>
                <a 
                  href="https://t.me/+gKmEEjeNar02NDIy" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs sm:text-sm font-semibold text-[#81D8D0] hover:underline font-arimo break-all"
                >
                  https://t.me/+gKmEEjeNar02NDIy
                </a>
              </div>

              {/* Action Button */}
              <a 
                href="https://t.me/+gKmEEjeNar02NDIy"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 bg-[#81D8D0] hover:bg-[#97e3db] text-[#1A0000] font-montserrat font-bold uppercase text-xs tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(129,216,208,0.3)] hover:scale-[1.02] mb-6 inline-flex"
              >
                <span>Приєднатися до каналу</span>
              </a>

              {/* Countdown Message */}
              <p className="text-xs text-gray-400 font-narrow uppercase tracking-widest">
                Ви будете автоматично перенаправлені через <span className="text-[#81D8D0] font-bold">{telegramCountdown}...</span>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
