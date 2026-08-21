'use client';

import { useState, useEffect, Fragment } from 'react';
import { useAuth } from '../useAuth';
import { 
  getAdminSubmissions, 
  saveHomeworkReview, 
  AdminSubmissionItem,
  getAllStudentsWithProgress, 
  deleteStudentUser, 
  toggleUserLockout,
  getLessonsConfig, 
  updateLessonConfig,
  saveAllLessonsConfig,
  deleteLessonConfig,
  getGiftTokens,
  generateGiftToken,
  GiftTokenItem,
  getBotTemplates,
  saveBotTemplate,
  deleteBotTemplate,
  getBroadcasts,
  sendBotBroadcast,
  getBotConfig,
  connectTelegramBot,
  disconnectTelegramBot
} from '../actions';
import { extractYouTubeId } from '../supabase';
import { 
  HomeworkStatus, 
  MinicourseUser, 
  MinicourseLessonConfig, 
  StudentWithProgress, 
  LessonMaterialLink,
  BotMessageTemplate,
  BotBroadcast,
  BotMessageButton,
  BotConfig
} from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, ClipboardCheck, Award, LogOut, Search, Filter, 
  ExternalLink, Check, MessageSquare, Send, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle,
  Settings, Lock, Unlock, Trash2, Save, BookOpen, ShieldAlert, ChevronDown, ChevronUp, Plus, Link2, Video, X,
  Bot, Radio, Sparkles, Copy, RefreshCw, Smartphone, Key, CheckCircle, Power, Globe
} from 'lucide-react';
import Link from 'next/link';

const isNewCohortUser = (userObj: { created_at?: string; access_opened_at?: string; userCreatedAt?: string; userAccessOpenedAt?: string }) => {
  const dateStr = userObj.access_opened_at || userObj.created_at || userObj.userAccessOpenedAt || userObj.userCreatedAt;
  if (!dateStr) return true;
  return new Date(dateStr) >= new Date('2026-07-17T00:00:00Z');
};

export default function AdminDashboard() {
  // Enforce admin role check
  const { user, loading, logout } = useAuth(true);
  
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'submissions' | 'students' | 'lessons' | 'gifts' | 'bot'>('submissions');
  const [botSubTab, setBotSubTab] = useState<'events' | 'broadcast'>('events');
  
  // Data states
  const [submissions, setSubmissions] = useState<AdminSubmissionItem[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  
  const [students, setStudents] = useState<StudentWithProgress[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  
  const [lessons, setLessons] = useState<MinicourseLessonConfig[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(true);

  // Gifts states
  const [gifts, setGifts] = useState<GiftTokenItem[]>([]);
  const [giftsLoading, setGiftsLoading] = useState(true);
  const [generatingGift, setGeneratingGift] = useState(false);

  // Bot templates & broadcast states
  const [botTemplates, setBotTemplates] = useState<BotMessageTemplate[]>([]);
  const [botTemplatesLoading, setBotTemplatesLoading] = useState(true);
  const [templateSaveStatus, setTemplateSaveStatus] = useState<{ [key: string]: 'idle' | 'saving' | 'success' | 'error' }>({});
  
  const [broadcasts, setBroadcasts] = useState<BotBroadcast[]>([]);
  const [broadcastsLoading, setBroadcastsLoading] = useState(true);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAudience, setBroadcastAudience] = useState<'all' | 'paid'>('all');
  const [broadcastHasButton, setBroadcastHasButton] = useState(false);
  const [broadcastButtonText, setBroadcastButtonText] = useState('');
  const [broadcastButtonUrl, setBroadcastButtonUrl] = useState('');
  const [isConfirmBroadcastOpen, setIsConfirmBroadcastOpen] = useState(false);
  const [sendingBroadcast, setSendingBroadcast] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<{ total: number; sent: number; failed: number } | null>(null);

  // Bot Config & Connection states
  const [botConfig, setBotConfig] = useState<BotConfig | null>(null);
  const [botConfigLoading, setBotConfigLoading] = useState(true);
  const [botTokenInput, setBotTokenInput] = useState('');
  const [isConnectingBot, setIsConnectingBot] = useState(false);
  const [isEditingBotToken, setIsEditingBotToken] = useState(false);
  const [botConnectError, setBotConnectError] = useState<string | null>(null);
  
  // Filter/Search states
  const [hwFilterStatus, setHwFilterStatus] = useState<HomeworkStatus | 'all'>('all');
  const [hwSearchQuery, setHwSearchQuery] = useState('');
  
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [studentFilterPaid, setStudentFilterPaid] = useState<'all' | 'paid' | 'unpaid'>('all');
  
  // Action/Review modal states
  const [selectedSub, setSelectedSub] = useState<AdminSubmissionItem | null>(null);
  const [reviewComment, setReviewComment] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  
  // Lesson Save notifications state
  const [lessonSaveStatus, setLessonSaveStatus] = useState<{ [key: number]: 'idle' | 'saving' | 'success' | 'error' }>({});
  
  // Utility states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Fetch all homework submissions
  const fetchSubmissions = async () => {
    try {
      setSubmissionsLoading(true);
      const data = await getAdminSubmissions();
      setSubmissions(data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setSubmissionsLoading(false);
    }
  };

  // Fetch all students directory
  const fetchStudents = async () => {
    try {
      setStudentsLoading(true);
      const data = await getAllStudentsWithProgress();
      setStudents(data);
    } catch (err) {
      console.error("Error fetching students:", err);
    } finally {
      setStudentsLoading(false);
    }
  };

  // Fetch dynamic lesson configurations
  const fetchLessons = async () => {
    try {
      setLessonsLoading(true);
      const data = await getLessonsConfig();
      setLessons(data);
    } catch (err) {
      console.error("Error fetching lesson configs:", err);
    } finally {
      setLessonsLoading(false);
    }
  };

  // Fetch gift tokens
  const fetchGifts = async () => {
    try {
      setGiftsLoading(true);
      const data = await getGiftTokens();
      setGifts(data);
    } catch (err) {
      console.error("Error fetching gift tokens:", err);
    } finally {
      setGiftsLoading(false);
    }
  };

  // Fetch bot templates
  const fetchBotTemplates = async () => {
    try {
      setBotTemplatesLoading(true);
      const data = await getBotTemplates();
      setBotTemplates(data);
    } catch (err) {
      console.error("Error fetching bot templates:", err);
    } finally {
      setBotTemplatesLoading(false);
    }
  };

  // Fetch broadcast history
  const fetchBroadcastsList = async () => {
    try {
      setBroadcastsLoading(true);
      const data = await getBroadcasts();
      setBroadcasts(data);
    } catch (err) {
      console.error("Error fetching broadcasts:", err);
    } finally {
      setBroadcastsLoading(false);
    }
  };

  // Fetch bot connection status
  const fetchBotConfig = async () => {
    try {
      setBotConfigLoading(true);
      const data = await getBotConfig();
      setBotConfig(data);
      if (data?.bot_token) {
        setBotTokenInput(data.bot_token);
      }
    } catch (err) {
      console.error("Error fetching bot config:", err);
    } finally {
      setBotConfigLoading(false);
    }
  };

  const handleConnectBot = async () => {
    if (!botTokenInput.trim()) {
      setBotConnectError("Введіть токен Telegram бота");
      return;
    }
    setIsConnectingBot(true);
    setBotConnectError(null);
    try {
      const res = await connectTelegramBot(botTokenInput.trim());
      if (res.success && res.bot) {
        setBotConfig(res.bot);
        setIsEditingBotToken(false);
      }
    } catch (err: any) {
      console.error("Error connecting bot:", err);
      setBotConnectError(err.message || "Не вдалося підключити бота");
    } finally {
      setIsConnectingBot(false);
    }
  };

  const handleDisconnectBot = async () => {
    if (!confirm("Ви впевнені, що бажаєте відключити Telegram бота?")) return;
    try {
      const res = await disconnectTelegramBot();
      if (res.success && res.bot) {
        setBotConfig(res.bot);
        setBotTokenInput('');
        setIsEditingBotToken(true);
      }
    } catch (err) {
      console.error("Error disconnecting bot:", err);
      alert("Не вдалося відключити бота.");
    }
  };

  const handleGenerateGift = async () => {
    setGeneratingGift(true);
    try {
      await generateGiftToken();
      await fetchGifts();
    } catch (err) {
      console.error("Error generating gift token:", err);
      alert("Не вдалося згенерувати подарунковий лінк.");
    } finally {
      setGeneratingGift(false);
    }
  };

  const handleSaveTemplate = async (template: BotMessageTemplate) => {
    setTemplateSaveStatus(prev => ({ ...prev, [template.id]: 'saving' }));
    try {
      await saveBotTemplate(template);
      setTemplateSaveStatus(prev => ({ ...prev, [template.id]: 'success' }));
      await fetchBotTemplates();
      setTimeout(() => {
        setTemplateSaveStatus(prev => ({ ...prev, [template.id]: 'idle' }));
      }, 3000);
    } catch (err) {
      console.error("Error saving bot template:", err);
      setTemplateSaveStatus(prev => ({ ...prev, [template.id]: 'error' }));
    }
  };

  const handleAddCustomTemplate = () => {
    const customId = `custom_${Date.now()}`;
    const newTemplate: BotMessageTemplate = {
      id: customId,
      event_key: 'custom',
      title: 'Нове кастомне повідомлення',
      description: 'Додаткове кастомне сповіщення бота',
      message_text: 'Привіт, {name}! 👋\n\nТут текст вашого повідомлення.',
      buttons: [],
      is_enabled: true,
      sort_order: 100 + botTemplates.length
    };
    setBotTemplates(prev => [...prev, newTemplate]);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Ви дійсно бажаєте видалити цей шаблон?')) return;
    try {
      await deleteBotTemplate(templateId);
      setBotTemplates(prev => prev.filter(t => t.id !== templateId));
    } catch (err) {
      console.error("Error deleting template:", err);
      alert("Не вдалося видалити шаблон.");
    }
  };

  const handleExecuteBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    setSendingBroadcast(true);
    try {
      const result = await sendBotBroadcast({
        messageText: broadcastMessage.trim(),
        buttonText: broadcastHasButton ? broadcastButtonText.trim() : undefined,
        buttonUrl: broadcastHasButton ? broadcastButtonUrl.trim() : undefined,
        targetAudience: broadcastAudience,
        createdBy: user?.name || 'admin'
      });
      setBroadcastResult(result);
      setIsConfirmBroadcastOpen(false);
      setBroadcastMessage('');
      setBroadcastButtonText('');
      setBroadcastButtonUrl('');
      setBroadcastHasButton(false);
      await fetchBroadcastsList();
    } catch (err: any) {
      console.error("Error executing broadcast:", err);
      alert(`Помилка розсилки: ${err.message || 'Невідома помилка'}`);
    } finally {
      setSendingBroadcast(false);
    }
  };

  // Load datasets on mount/auth success
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchSubmissions();
      fetchStudents();
      fetchLessons();
      fetchGifts();
      fetchBotTemplates();
      fetchBroadcastsList();
      fetchBotConfig();
    }
  }, [user]);

  // Open single submission for review modal
  const handleOpenReview = (sub: AdminSubmissionItem) => {
    setSelectedSub(sub);
    setReviewComment(sub.hwComment || '');
  };

  // Run homework review status submission
  const handleReviewAction = async (status: 'accepted' | 'needs_improvement') => {
    if (!selectedSub) return;

    setSavingReview(true);
    try {
      await saveHomeworkReview(
        selectedSub.userId, 
        selectedSub.lessonId, 
        status, 
        reviewComment.trim()
      );
      
      // Reschedule or cancel QStash reminders depending on review status
      if (status === 'accepted') {
        fetch('/api/homework/cancel-reminder', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: selectedSub.userId, lessonId: selectedSub.lessonId })
        }).catch(err => console.error("Failed to cancel reminder on homework accept:", err));
      } else if (status === 'needs_improvement') {
        fetch('/api/homework/assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: selectedSub.userId,
            lessonId: selectedSub.lessonId,
            deadlineAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
          })
        }).catch(err => console.error("Failed to reschedule reminder on homework rejection:", err));
      }
      
      // Look up student to get their telegram_chat_id
      const student = students.find(s => s.id === selectedSub.userId);
      if (student && student.telegram_chat_id) {
        // Trigger notification asynchronously
        fetch('/api/minicourse/bot/notify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: student.telegram_chat_id,
            messageType: status === 'accepted' ? 'hw_accepted' : 'hw_needs_improvement',
            templateData: {
              userName: student.name,
              lessonId: selectedSub.lessonId,
              comment: reviewComment.trim(),
              actionUrl: `${window.location.origin}/minicourse`
            }
          })
        }).catch(err => console.error("Failed to trigger homework review telegram notification:", err));

        // If homework accepted and it's not the last lesson, notify about the newly unlocked lesson
        if (status === 'accepted' && selectedSub.lessonId < 3) {
          const nextLessonId = selectedSub.lessonId + 1;
          const nextConfig = lessons.find(l => l.lesson_id === nextLessonId);
          
          setTimeout(() => {
            fetch('/api/minicourse/bot/notify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                chatId: student.telegram_chat_id,
                messageType: 'new_lesson_unlocked',
                templateData: {
                  userName: student.name,
                  lessonId: nextLessonId,
                  lessonTitle: nextConfig?.title || `Ефір ${nextLessonId}`,
                  actionUrl: `${window.location.origin}/minicourse`
                }
              })
            }).catch(err => console.error("Failed to trigger new lesson telegram notification:", err));
          }, 2000);
        }
      }
      
      setSelectedSub(null);
      // Hot reload stats & directory
      await fetchSubmissions();
      await fetchStudents();
    } catch (err) {
      console.error("Error updating homework status:", err);
      alert("Не вдалося оновити статус домашнього завдання.");
    } finally {
      setSavingReview(false);
    }
  };

  // Toggle blocking/lockout security status for student
  const handleToggleBlock = async (studentId: string, currentlyBlocked: boolean) => {
    const actionText = currentlyBlocked ? 'розблокувати' : 'заблокувати';
    if (!confirm(`Ви дійсно бажаєте ${actionText} цього студента?`)) return;

    try {
      await toggleUserLockout(studentId, !currentlyBlocked);
      // Reload lists
      await fetchStudents();
      await fetchSubmissions();
    } catch (err) {
      console.error("Error toggling lockout state:", err);
      alert("Помилка зміни статусу блокування.");
    }
  };

  // Delete student completely
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!confirm(`⚠️ УВАГА! Ви дійсно бажаєте ВИДАЛИТИ користувача "${studentName}"?\nЦе безповоротно видалить усі дані профілю та історію прогресу!`)) {
      return;
    }

    try {
      await deleteStudentUser(studentId);
      // Reload lists
      await fetchStudents();
      await fetchSubmissions();
    } catch (err) {
      console.error("Error deleting student profile:", err);
      alert("Не вдалося видалити профіль учня.");
    }
  };

  // Update dynamic lesson settings configurations
  const handleSaveLessonConfig = async (lessonId: number, configForm: Partial<MinicourseLessonConfig>) => {
    setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'saving' }));
    try {
      await updateLessonConfig(lessonId, configForm);
      setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'success' }));
      
      // Refresh configurations state
      await fetchLessons();
      
      // Clear success notification indicator after 3 seconds
      setTimeout(() => {
        setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'idle' }));
      }, 3000);
    } catch (err) {
      console.error("Error updating lesson settings:", err);
      setLessonSaveStatus(prev => ({ ...prev, [lessonId]: 'error' }));
    }
  };

  const handleAddLesson = () => {
    const nextId = lessons.length > 0 ? Math.max(...lessons.map(l => l.lesson_id)) + 1 : 1;
    const newLesson: MinicourseLessonConfig = {
      lesson_id: nextId,
      title: `Урок ${nextId}`,
      description: '',
      youtube_id: '',
      youtube_url: '',
      links: [],
      description_under_video: '',
      hw_instructions: '',
      sort_order: nextId,
      updated_at: new Date().toISOString()
    };
    setLessons(prev => [...prev, newLesson]);
  };

  const handleDeleteLesson = async (lessonId: number) => {
    if (!confirm(`Ви дійсно бажаєте видалити Урок ${lessonId}? Всі налаштування цього уроку буде видалено.`)) return;
    try {
      await deleteLessonConfig(lessonId);
      setLessons(prev => prev.filter(l => l.lesson_id !== lessonId));
      await fetchLessons();
    } catch (err) {
      console.error("Error deleting lesson:", err);
      alert("Помилка видалення уроку");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#0C0508] flex items-center justify-center relative overflow-hidden font-montserrat">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#E5C378]/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="text-center space-y-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E5C378]/20 to-[#C5A059]/10 border border-[#E5C378]/40 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(229,195,120,0.2)]">
            <ClipboardCheck className="w-8 h-8 text-[#E5C378]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-wider uppercase text-white font-montserrat">
              Victoria <span className="text-[#E5C378]">Course</span>
            </h2>
            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-400 font-narrow uppercase tracking-widest">
              <div className="w-3.5 h-3.5 border-2 border-[#E5C378] border-t-transparent rounded-full animate-spin"></div>
              <span>Завантаження панелі керування...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Stats Calculations
  const pendingCount = submissions.filter(s => s.hwStatus === 'pending').length;
  const acceptedCount = submissions.filter(s => s.hwStatus === 'accepted').length;
  const totalStudentsCount = students.length;
  const blockedStudentsCount = students.filter(s => s.status === 'under_investigation').length;
  const activePaidCount = students.filter(s => s.is_paid || s.payment_status === 'paid').length;

  // Filtered Homework Submissions list
  const filteredSubmissions = submissions.filter(sub => {
    const matchesStatus = hwFilterStatus === 'all' || sub.hwStatus === hwFilterStatus;
    const matchesSearch = 
      sub.userName.toLowerCase().includes(hwSearchQuery.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(hwSearchQuery.toLowerCase()) ||
      (sub.userTelegram && sub.userTelegram.toLowerCase().includes(hwSearchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  // Filtered Students list
  const filteredStudents = students.filter(student => {
    const isPaid = student.is_paid || student.payment_status === 'paid';
    const matchesPaid = 
      studentFilterPaid === 'all' ||
      (studentFilterPaid === 'paid' && isPaid) ||
      (studentFilterPaid === 'unpaid' && !isPaid);
      
    const matchesSearch = 
      student.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      (student.telegram && student.telegram.toLowerCase().includes(studentSearchQuery.toLowerCase())) ||
      (student.phone && student.phone.includes(studentSearchQuery));

    return matchesPaid && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0C0508] text-white font-montserrat flex flex-col pb-16 relative">
      
      {/* Background Luxury Ambient Glows */}
      <div className="fixed top-0 left-0 w-[600px] h-[600px] bg-[#380E1E]/25 rounded-full blur-[180px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[160px] pointer-events-none"></div>

      {/* Sticky Premium Header */}
      <header className="border-b border-white/10 bg-[#0C0508]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5C378]/20 to-[#C5A059]/10 border border-[#E5C378]/30 flex items-center justify-center shadow-[0_0_15px_rgba(229,195,120,0.15)]">
              <ClipboardCheck className="w-5 h-5 text-[#E5C378]" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-wider uppercase">Victoria <span className="text-[#E5C378]">Course</span></span>
              <span className="text-[9px] font-bold text-[#E5C378] border border-[#E5C378]/20 bg-[#E5C378]/10 px-2 py-0.5 rounded-full uppercase font-narrow ml-2.5">
                Minicourse Platform
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#E5C378]">Панель Управління</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest">{user.name}</p>
            </div>
            <button 
              onClick={logout}
              className="p-2.5 rounded-xl border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10 cursor-pointer"
              title="Вийти з панелі"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Sticky Navigation Tabs Bar (Grid 5 columns, No scrollbars, Always accessible) */}
      <div className="sticky top-[69px] z-30 bg-[#0C0508]/90 backdrop-blur-xl border-b border-white/10 shadow-2xl py-2.5 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-2xl shadow-inner">
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer truncate ${
                activeTab === 'submissions'
                  ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_20px_rgba(229,195,120,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <ClipboardCheck className="w-4 h-4 shrink-0" />
              <span className="truncate">Перевірка ДЗ ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer truncate ${
                activeTab === 'students'
                  ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_20px_rgba(229,195,120,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Users className="w-4 h-4 shrink-0" />
              <span className="truncate">Студенти ({totalStudentsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('lessons')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer truncate ${
                activeTab === 'lessons'
                  ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_20px_rgba(229,195,120,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Уроки ({lessons.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('gifts')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer truncate ${
                activeTab === 'gifts'
                  ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_20px_rgba(229,195,120,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4 shrink-0" />
              <span className="truncate">Подарунки ({gifts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('bot')}
              className={`flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl font-bold text-xs uppercase transition-all cursor-pointer truncate col-span-2 sm:col-span-1 ${
                activeTab === 'bot'
                  ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_20px_rgba(229,195,120,0.3)]'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="truncate">Бот та Розсилка</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Panel Container */}
      <main className="max-w-6xl mx-auto px-4 py-8 w-full space-y-8 relative z-10 flex-1">

        {/* TAB 1: SUBMISSIONS REVIEW */}
        {activeTab === 'submissions' && (
          <div className="space-y-6">
            {/* Quick stats for Submissions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Надіслано домашніх робіт</span>
                  <h4 className="text-2xl font-black text-white mt-1">{submissions.length}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                  <BookOpen className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-[#E5C378]/30 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between shadow-[0_0_15px_rgba(229,195,120,0.05)]">
                <div>
                  <span className="text-[10px] text-[#E5C378] uppercase tracking-widest font-narrow font-bold">Очікують перевірки</span>
                  <h4 className="text-2xl font-black text-[#E5C378] mt-1">{pendingCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#E5C378]/10 flex items-center justify-center text-[#E5C378]">
                  <HelpCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Успішно складено (Зараховано)</span>
                  <h4 className="text-2xl font-black text-white mt-1">{acceptedCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for submissions */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text"
                  value={hwSearchQuery}
                  onChange={(e) => setHwSearchQuery(e.target.value)}
                  placeholder="Шукати домашку за ім'ям або TG..."
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs font-arimo text-white transition-all placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto overflow-x-auto">
                <Filter className="w-4 h-4 text-gray-500 hidden sm:block" />
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 w-full md:w-auto">
                  {[
                    { value: 'all', label: 'Усі' },
                    { value: 'pending', label: 'Черга ⏳' },
                    { value: 'accepted', label: 'Прийняті 🎉' },
                    { value: 'needs_improvement', label: 'На доопрацюванні ⚠️' }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setHwFilterStatus(tab.value as any)}
                      className={`px-3 py-2 rounded-lg font-bold text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                        hwFilterStatus === tab.value
                          ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_10px_rgba(229,195,120,0.25)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submissions Directory Grid Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Студент</th>
                      <th className="p-4">Урок</th>
                      <th className="p-4">Посилання на звіт</th>
                      <th className="p-4">Час подачі</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4 pr-6 text-right">Дія</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {submissionsLoading ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center">
                          <div className="w-8 h-8 border-3 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження робіт...</p>
                        </td>
                      </tr>
                    ) : filteredSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-12 text-center text-gray-500">
                          Жодних домашніх робіт не знайдено
                        </td>
                      </tr>
                    ) : (
                      filteredSubmissions.map(sub => {
                        const rowId = `${sub.userId}-${sub.lessonId}`;
                        let statusLabel = "Очікує";
                        let statusStyle = "text-[#E5C378] bg-[#E5C378]/10 border-[#E5C378]/20";
                        let statusIcon = <HelpCircle className="w-3.5 h-3.5" />;

                        if (sub.hwStatus === 'accepted') {
                          statusLabel = "Зараховано 🎉";
                          statusStyle = "text-green-400 bg-green-950/20 border-green-500/20";
                          statusIcon = <CheckCircle2 className="w-3.5 h-3.5" />;
                        } else if (sub.hwStatus === 'needs_improvement') {
                          statusLabel = "Допрацювання ⚠️";
                          statusStyle = "text-amber-400 bg-amber-950/20 border-amber-500/20";
                          statusIcon = <AlertTriangle className="w-3.5 h-3.5" />;
                        }

                        return (
                          <tr key={rowId} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 pl-6 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <p className="font-bold text-white">{sub.userName}</p>
                                <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  isNewCohortUser(sub)
                                    ? 'bg-purple-950/20 border border-purple-500/20 text-purple-300'
                                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                }`}>
                                  {isNewCohortUser(sub) ? 'Нові' : 'Старі'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-arimo">
                                {sub.userTelegram && (
                                  <span 
                                    onClick={() => copyToClipboard(`@${sub.userTelegram}`, `${rowId}-tg`)}
                                    className="hover:text-white cursor-pointer transition-colors text-[#E5C378]"
                                  >
                                    @{sub.userTelegram}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="p-4">
                              <span className="font-bold text-xs uppercase bg-[#E5C378]/5 border border-[#E5C378]/10 px-2.5 py-1 rounded text-[#E5C378]">
                                Ефір {sub.lessonId}
                              </span>
                            </td>

                            <td className="p-4">
                              <a 
                                href={sub.hwUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-[#E5C378] hover:underline flex items-center space-x-1 max-w-[200px] truncate font-arimo"
                              >
                                <span>Відкрити таблицю</span>
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              </a>
                            </td>

                            <td className="p-4 text-gray-400 font-narrow">
                              {new Date(sub.hwSubmittedAt).toLocaleDateString('uk-UA')} {new Date(sub.hwSubmittedAt).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                            </td>

                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded border text-[10px] font-bold uppercase flex items-center space-x-1.5 w-max ${statusStyle}`}>
                                {statusIcon}
                                <span>{statusLabel}</span>
                              </span>
                            </td>

                            <td className="p-4 pr-6 text-right">
                              <button 
                                onClick={() => handleOpenReview(sub)}
                                className="px-3.5 py-2 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-bold text-[10px] uppercase rounded-lg shadow-[0_0_10px_rgba(229,195,120,0.2)] transition-all cursor-pointer font-montserrat"
                              >
                                Перевірити
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS DIRECTORY & MANAGEMENT */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            {/* Student Accounts Stat Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Зареєстровано учнів</span>
                  <h4 className="text-2xl font-black text-white mt-1">{totalStudentsCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-[#E5C378]">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow">Оплачений доступ (Активні)</span>
                  <h4 className="text-2xl font-black text-green-400 mt-1">{activePaidCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="bg-white/5 border border-red-500/20 rounded-2xl p-5 backdrop-blur-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-red-300 uppercase tracking-widest font-narrow">Заблоковані учні (Security Alert)</span>
                  <h4 className="text-2xl font-black text-red-400 mt-1">{blockedStudentsCount}</h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-red-950/20 flex items-center justify-center text-red-400">
                  <Lock className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Filter and Search Bar for student directory */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-500" />
                <input 
                  type="text"
                  value={studentSearchQuery}
                  onChange={(e) => setStudentSearchQuery(e.target.value)}
                  placeholder="Шукати учня за ім'ям, TG або телефоном..."
                  className="w-full pl-11 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs font-arimo text-white transition-all placeholder-gray-500"
                />
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <span className="text-xs text-gray-500 font-narrow uppercase tracking-wider font-bold">Оплата:</span>
                <div className="flex bg-black/20 rounded-xl p-1 border border-white/5 w-full md:w-auto">
                  {[
                    { value: 'all', label: 'Усі' },
                    { value: 'paid', label: 'Тільки Оплачені' },
                    { value: 'unpaid', label: 'Неоплачені / Помилки' }
                  ].map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setStudentFilterPaid(tab.value as any)}
                      className={`px-4 py-2 rounded-lg font-bold text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                        studentFilterPaid === tab.value
                          ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_10px_rgba(229,195,120,0.25)]'
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Students List Table */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Учень / Контакти</th>
                      <th className="p-4">Доступ (Сплачено)</th>
                      <th className="p-4 text-center">Прогрес</th>
                      <th className="p-4">Активні пристрої</th>
                      <th className="p-4">Дата реєстрації</th>
                      <th className="p-4">Безпека (Статус)</th>
                      <th className="p-4 pr-6 text-right">Деталі</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {studentsLoading ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center">
                          <div className="w-8 h-8 border-3 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження профілів учнів...</p>
                        </td>
                      </tr>
                    ) : filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-12 text-center text-gray-500">
                          Немає учнів за вказаними параметрами пошуку
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map(student => {
                        const isPaid = student.is_paid || student.payment_status === 'paid';
                        const deviceCount = student.device_uuids?.length || 0;
                        const isBlocked = student.status === 'under_investigation';
                        const isExpanded = expandedStudentId === student.id;
                        const progressPercent = student.progress?.progressPercent || 0;

                        return (
                          <Fragment key={student.id}>
                            <tr className="hover:bg-white/5 transition-colors border-b border-white/5">
                              {/* Profile details */}
                              <td className="p-4 pl-6 space-y-1">
                                <p className="font-bold text-white">{student.name}</p>
                                <div className="space-y-0.5 text-[10px] text-gray-400 font-arimo">
                                  <p className="flex items-center space-x-2">
                                    {student.telegram && (
                                      <>
                                        <span className="text-gray-500">TG:</span>
                                        <span className="text-[#E5C378]">@{student.telegram}</span>
                                      </>
                                    )}
                                    {student.phone && (
                                      <>
                                        <span className="text-gray-500">• Тел:</span>
                                        <span className="text-gray-300">{student.phone}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                              </td>

                              {/* Access/payment state */}
                              <td className="p-4">
                                <span className={`px-2.5 py-1 rounded border text-[9px] font-bold uppercase ${
                                  isPaid 
                                    ? 'text-green-400 bg-green-950/20 border-green-500/20' 
                                    : 'text-red-400 bg-red-950/20 border-red-500/20'
                                }`}>
                                  {isPaid ? 'Доступ дозволено 🟢' : 'Неоплачено / Блоковано 🔴'}
                                </span>
                              </td>

                              {/* Miniature Progress Timeline */}
                              <td className="p-4">
                                <div className="flex flex-col items-center space-y-1.5">
                                  <span className="font-bold text-[#E5C378] text-xs">{progressPercent}%</span>
                                  <div className="flex space-x-1.5">
                                    {[1, 2, 3].map(lessonId => {
                                      const lesson = student.progress?.lessons[lessonId as 1 | 2 | 3];
                                      if (!lesson) {
                                        return <div key={lessonId} className="w-2.5 h-2.5 rounded-full bg-gray-800" title={`Ефір ${lessonId}: Закрито`} />;
                                      }
                                      
                                      let color = "bg-gray-800";
                                      let title = `Ефір ${lessonId}: Заблоковано`;

                                      if (lesson.unlocked) {
                                        color = "bg-blue-600";
                                        title = `Ефір ${lessonId}: Відкрито (перегляд відео)`;
                                        
                                        if (lesson.videoCompleted) {
                                          color = "bg-green-600";
                                          title = `Ефір ${lessonId}: Відео переглянуто`;
                                        }

                                        if (lesson.hwStatus === 'pending') {
                                          color = "bg-amber-500 animate-pulse";
                                          title = `Ефір ${lessonId}: ДЗ на перевірці`;
                                        } else if (lesson.hwStatus === 'accepted') {
                                          color = "bg-emerald-500";
                                          title = `Ефір ${lessonId}: ДЗ прийнято`;
                                        } else if (lesson.hwStatus === 'needs_improvement') {
                                          color = "bg-red-500";
                                          title = `Ефір ${lessonId}: ДЗ потребує доопрацювання`;
                                        } else if (lesson.hwStatus === 'expired_not_submitted') {
                                          color = "bg-red-950 border border-red-500/30";
                                          title = `Ефір ${lessonId}: ДЗ не здано вчасно`;
                                        }
                                      }
                                      
                                      return (
                                        <div 
                                          key={lessonId} 
                                          className={`w-2.5 h-2.5 rounded-full ${color}`} 
                                          title={title}
                                        />
                                      );
                                    })}
                                  </div>
                                </div>
                              </td>

                              {/* Devices list and count */}
                              <td className="p-4">
                                <div className="flex items-center space-x-2">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold font-narrow ${
                                    deviceCount >= 4 
                                      ? 'bg-red-950/30 text-red-400 border border-red-500/30' 
                                      : deviceCount > 1 
                                      ? 'bg-amber-950/30 text-amber-300 border border-amber-500/20' 
                                      : 'bg-white/5 text-gray-400'
                                  }`}>
                                    {deviceCount} / 4 пристроїв
                                  </span>
                                </div>
                              </td>

                              {/* Registered date */}
                              <td className="p-4 space-y-1">
                                <p className="text-gray-300 font-narrow font-bold">
                                  {student.created_at ? new Date(student.created_at).toLocaleDateString('uk-UA') : 'Дані відсутні'}
                                </p>
                                <span className={`inline-block px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                                  isNewCohortUser(student)
                                    ? 'bg-purple-950/20 border border-purple-500/20 text-purple-300'
                                    : 'bg-zinc-800 border border-zinc-700 text-zinc-400'
                                }`}>
                                  {isNewCohortUser(student) ? 'Нові ефіри 🆕' : 'Старі ефіри 📻'}
                                </span>
                              </td>

                              {/* Safety state */}
                              <td className="p-4">
                                {isBlocked ? (
                                  <span className="px-2.5 py-1 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 font-bold text-[9px] uppercase flex items-center space-x-1.5 w-max animate-pulse">
                                    <ShieldAlert className="w-3 h-3" />
                                    <span>Блокування пристроїв 🚫</span>
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-lg bg-green-950/20 border border-green-500/20 text-green-400 font-bold text-[9px] uppercase flex items-center space-x-1.5 w-max">
                                    <Check className="w-3 h-3" />
                                    <span>Безпечно (Активний)</span>
                                  </span>
                                )}
                              </td>

                              {/* Action details expander */}
                              <td className="p-4 pr-6 text-right">
                                <button
                                  onClick={() => setExpandedStudentId(isExpanded ? null : student.id)}
                                  className="p-2 border border-white/5 hover:border-[#E5C378]/40 hover:bg-[#E5C378]/10 text-gray-400 hover:text-[#E5C378] rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 ml-auto"
                                  title="Показати детальний прогрес"
                                >
                                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  <span className="font-narrow text-[10px] uppercase font-bold">Деталі</span>
                                </button>
                              </td>
                            </tr>

                            {/* Collapsible Details Drawer */}
                            {isExpanded && (
                              <tr className="bg-black/30">
                                <td colSpan={7} className="p-6 border-b border-white/10">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {[1, 2, 3].map(lessonId => {
                                      const lesson = student.progress?.lessons[lessonId as 1 | 2 | 3];
                                      const hasVideoProgress = lesson && lesson.videoDurationSec && lesson.videoWatchedSec !== undefined;
                                      const watchedPercent = hasVideoProgress ? Math.min(100, Math.round((lesson.videoWatchedSec! / lesson.videoDurationSec!) * 100)) : 0;
                                      
                                      let hwStatusText = 'Не розпочато';
                                      let hwStatusColor = 'text-gray-500';
                                      
                                      if (lesson) {
                                        if (lesson.hwStatus === 'pending') {
                                          hwStatusText = 'Очікує перевірки ⏳';
                                          hwStatusColor = 'text-amber-400';
                                        } else if (lesson.hwStatus === 'accepted') {
                                          hwStatusText = 'Зараховано 🎉';
                                          hwStatusColor = 'text-emerald-400';
                                        } else if (lesson.hwStatus === 'needs_improvement') {
                                          hwStatusText = 'На доопрацюванні ⚠️';
                                          hwStatusColor = 'text-red-400';
                                        } else if (lesson.hwStatus === 'expired_not_submitted') {
                                          hwStatusText = 'Не здано вчасно ⏱️';
                                          hwStatusColor = 'text-red-500 font-bold';
                                        } else if (lesson.hwSubmitted) {
                                          hwStatusText = 'Надіслано';
                                          hwStatusColor = 'text-blue-400';
                                        }
                                      }

                                      const formatTime = (secs?: number) => {
                                        if (secs === undefined) return '0:00';
                                        const m = Math.floor(secs / 60);
                                        const s = Math.floor(secs % 60);
                                        return `${m}:${s < 10 ? '0' : ''}${s}`;
                                      };

                                      return (
                                        <div key={lessonId} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
                                          <div className="flex items-center justify-between border-b border-white/5 pb-2">
                                            <span className="font-bold text-xs uppercase tracking-wider text-[#E5C378]">Ефір {lessonId}</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${lesson?.unlocked ? 'bg-blue-950 text-blue-400' : 'bg-gray-800 text-gray-400'}`}>
                                              {lesson?.unlocked ? 'Відкрито' : 'Закрито'}
                                            </span>
                                          </div>
                                          
                                          <div className="space-y-2 text-xs">
                                            {/* Video Info */}
                                            <div>
                                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow mb-1">Перегляд відео:</p>
                                              {lesson?.unlocked ? (
                                                <div className="space-y-1">
                                                  <div className="flex justify-between text-[11px] font-arimo">
                                                    <span className="text-gray-300">
                                                      {hasVideoProgress ? `${formatTime(lesson.videoWatchedSec)} / ${formatTime(lesson.videoDurationSec)}` : '0:00 / --:--'}
                                                    </span>
                                                    <span className="text-[#E5C378] font-bold">{watchedPercent}%</span>
                                                  </div>
                                                  <div className="w-full bg-black/40 rounded-full h-1.5 overflow-hidden">
                                                    <div 
                                                      className={`h-full rounded-full transition-all duration-500 ${lesson.videoCompleted ? 'bg-emerald-500' : 'bg-[#E5C378]'}`}
                                                      style={{ width: `${watchedPercent}%` }}
                                                    ></div>
                                                  </div>
                                                  {lesson.videoCompleted && (
                                                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-narrow uppercase mt-1">
                                                      <Check className="w-3 h-3" /> Відео зараховано (&ge;80%)
                                                    </p>
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 italic font-arimo">Доступ до відео заблоковано</p>
                                              )}
                                            </div>

                                            {/* Homework Info */}
                                            <div className="pt-1">
                                              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-narrow mb-1">Домашнє завдання:</p>
                                              {lesson?.unlocked ? (
                                                <div className="space-y-1">
                                                  <p className={`font-bold ${hwStatusColor}`}>{hwStatusText}</p>
                                                  {lesson.hwUrl && (
                                                    <a 
                                                      href={lesson.hwUrl} 
                                                      target="_blank" 
                                                      rel="noopener noreferrer" 
                                                      className="text-[#E5C378] hover:underline flex items-center gap-1 mt-1 font-arimo"
                                                    >
                                                      <span>Посилання на звіт</span>
                                                      <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                  )}
                                                </div>
                                              ) : (
                                                <p className="text-gray-500 italic font-arimo">Доступ до ДЗ заблоковано</p>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  {/* Admin Actions inside expanded panel */}
                                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-gray-400">ID користувача:</span>
                                      <code className="text-[10px] bg-black/50 px-2.5 py-1 rounded text-gray-300 font-mono select-all">{student.id}</code>
                                    </div>
                                    
                                    <div className="flex items-center space-x-3">
                                      {isBlocked ? (
                                        <button
                                          onClick={() => handleToggleBlock(student.id, true)}
                                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-black font-montserrat font-bold text-[10px] uppercase rounded-xl flex items-center space-x-1.5 transition-all shadow-[0_4px_12px_rgba(34,197,94,0.2)] cursor-pointer"
                                          title="Розблокувати та повністю обнулити ліміт пристроїв"
                                        >
                                          <Unlock className="w-3.5 h-3.5" />
                                          <span>Розблокувати</span>
                                        </button>
                                      ) : (
                                        <button
                                          onClick={() => handleToggleBlock(student.id, false)}
                                          className="px-4 py-2 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 font-montserrat font-bold text-[10px] uppercase rounded-xl flex items-center space-x-1.5 bg-red-950/10 transition-all cursor-pointer"
                                          title="Заблокувати доступ до практикуму"
                                        >
                                          <Lock className="w-3.5 h-3.5" />
                                          <span>Заблокувати</span>
                                        </button>
                                      )}
                                      
                                      <button
                                        onClick={() => handleDeleteStudent(student.id, student.name)}
                                        className="px-4 py-2 border border-white/5 hover:border-red-500/40 hover:bg-red-500/10 text-gray-500 hover:text-red-400 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5"
                                        title="Видалити користувача назавжди"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        <span>Видалити учня</span>
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DYNAMIC LESSON CONFIGURATIONS EDITOR */}
        {activeTab === 'lessons' && (
          <div className="space-y-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-montserrat font-black uppercase text-base text-white flex items-center space-x-2">
                  <Settings className="w-5 h-5 text-[#E5C378]" />
                  <span>Налаштування Навчальних Уроків</span>
                </h3>
                <p className="text-xs text-gray-400 font-arimo mt-1 leading-relaxed">
                  Створюйте та налаштовуйте уроки курсу, додавайте посилання на YouTube, матеріали та опис під відео.
                </p>
              </div>
              <button
                onClick={handleAddLesson}
                className="px-5 py-3 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(229,195,120,0.2)] cursor-pointer self-start md:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Додати новий модуль</span>
              </button>
            </div>

            {lessonsLoading ? (
              <div className="py-24 text-center">
                <div className="w-10 h-10 border-4 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження налаштувань...</p>
              </div>
            ) : lessons.length === 0 ? (
              /* FULL-WIDTH ZERO-STATE CARD */
              <div className="bg-white/5 border-2 border-dashed border-white/15 rounded-3xl p-12 sm:p-16 text-center backdrop-blur-sm space-y-6 hover:border-[#E5C378]/40 transition-all">
                <div className="w-20 h-20 rounded-3xl bg-[#E5C378]/10 border border-[#E5C378]/20 flex items-center justify-center mx-auto text-[#E5C378] shadow-[0_0_30px_rgba(229,195,120,0.15)]">
                  <BookOpen className="w-10 h-10" />
                </div>
                <div className="max-w-md mx-auto space-y-2">
                  <h4 className="font-montserrat text-xl font-bold uppercase text-white tracking-wider">
                    Уроків поки немає
                  </h4>
                  <p className="text-xs text-gray-400 font-arimo leading-relaxed">
                    Наразі навчальна програма порожня. Натисніть кнопку нижче, щоб додати перший модуль вашого курсу.
                  </p>
                </div>
                <button
                  onClick={handleAddLesson}
                  className="px-8 py-4 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-widest rounded-2xl inline-flex items-center space-x-2 transition-all shadow-[0_0_25px_rgba(229,195,120,0.3)] hover:scale-105 cursor-pointer"
                >
                  <Plus className="w-5 h-5" />
                  <span>Додати перший модуль (Урок 1)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-10">
                {lessons.map((lesson, idx) => (
                  <LessonFormCard 
                    key={lesson.lesson_id} 
                    lesson={lesson}
                    lessonNumber={idx + 1}
                    saveStatus={lessonSaveStatus[lesson.lesson_id] || 'idle'}
                    onSave={handleSaveLessonConfig}
                    onDelete={() => handleDeleteLesson(lesson.lesson_id)}
                  />
                ))}

                {/* BOTTOM ADD NEXT LESSON BUTTON */}
                <div className="text-center pt-4">
                  <button
                    onClick={handleAddLesson}
                    className="px-8 py-4 border-2 border-dashed border-[#E5C378]/40 hover:border-[#E5C378] bg-[#E5C378]/5 hover:bg-[#E5C378]/10 text-[#E5C378] font-montserrat font-bold text-xs uppercase tracking-widest rounded-2xl inline-flex items-center space-x-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(229,195,120,0.1)] hover:scale-102"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Додати наступний урок (Урок {lessons.length + 1})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: GIFT TOKENS */}
        {activeTab === 'gifts' && (
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <h3 className="font-montserrat text-2xl font-bold uppercase text-[#E5C378] tracking-wider">
                  🎁 Подарункові Посилання
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed font-arimo">
                  Тут можна створювати унікальні одноразові посилання для переможців чи VIP-учасників.
                  Кожне посилання веде безпосередньо в Telegram-бота. Після того, як людина перейде і натисне <b>«Старт»</b>, доступ активуется, а посилання автоматично <b>«згорить»</b> (його не зможуть передати іншим).
                </p>
              </div>
              <button
                onClick={handleGenerateGift}
                disabled={generatingGift}
                className="px-6 py-4 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center space-x-2 transition-all shadow-[0_0_20px_rgba(229,195,120,0.2)] disabled:opacity-50 cursor-pointer shrink-0"
              >
                {generatingGift ? (
                  <div className="w-4 h-4 border-2 border-[#0C0508] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Award className="w-4 h-4" />
                )}
                <span>Згенерувати посилання</span>
              </button>
            </div>

            {/* Gift tokens directory list */}
            <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                      <th className="p-4 pl-6">Подарунковий лінк для Telegram</th>
                      <th className="p-4">Створено</th>
                      <th className="p-4">Статус</th>
                      <th className="p-4">Використано ким</th>
                      <th className="p-4 pr-6 text-right">Дія</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-xs">
                    {giftsLoading ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center">
                          <div className="w-8 h-8 border-3 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження посилань...</p>
                        </td>
                      </tr>
                    ) : gifts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-12 text-center text-gray-500">
                          Поки що немає згенерованих подарункових посилань
                        </td>
                      </tr>
                    ) : (
                      gifts.map(g => {
                        const botUsername = botConfig?.bot_username || 'victoriacourse_bot';
                        const botLink = `https://t.me/${botUsername}?start=gift_${g.token}`;
                        return (
                          <tr key={g.token} className="hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 pl-6 font-mono text-[11px] text-gray-300 select-all max-w-xs truncate">
                              {botLink}
                            </td>
                            <td className="p-4 text-gray-400 font-arimo">
                              {new Date(g.created_at).toLocaleString('uk-UA')}
                            </td>
                            <td className="p-4">
                              {g.is_used ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-950/20 border border-red-500/20 text-red-400 uppercase font-narrow">
                                  Використано ❌
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-950/20 border border-green-500/20 text-green-400 uppercase font-narrow">
                                  Активне ✅
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-gray-400 font-arimo">
                              {g.is_used ? (
                                <div className="space-y-0.5">
                                  <p className="font-bold">Chat ID: {g.used_by_chat_id}</p>
                                  {g.used_at && (
                                    <p className="text-[10px] text-gray-500">
                                      {new Date(g.used_at).toLocaleString('uk-UA')}
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-600">—</span>
                              )}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <button
                                onClick={() => copyToClipboard(botLink, g.token)}
                                className={`px-3 py-1.5 rounded-lg border font-bold text-[10px] uppercase tracking-wider transition-all cursor-pointer ${
                                  copiedId === g.token
                                    ? 'bg-green-500 border-green-500 text-[#1A0000]'
                                    : 'border-[#E5C378]/30 hover:border-[#E5C378] text-[#E5C378] hover:bg-[#E5C378]/10 bg-white/5'
                                }`}
                              >
                                {copiedId === g.token ? 'Скопійовано!' : 'Копіювати'}
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BOT MESSAGES & BROADCAST */}
        {activeTab === 'bot' && (
          <div className="space-y-8">
            {/* TELEGRAM BOT CONNECTION / WEBHOOK STATUS CARD */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#E5C378]/5 rounded-full blur-3xl pointer-events-none"></div>

              {botConfigLoading ? (
                <div className="py-6 text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-gray-400 font-narrow uppercase tracking-wider">Перевірка зв&apos;язку з Telegram ботом...</p>
                </div>
              ) : !botConfig?.is_connected || isEditingBotToken ? (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5C378]/10 border border-[#E5C378]/30 flex items-center justify-center text-[#E5C378]">
                        <Key className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-black uppercase text-white font-montserrat tracking-wider">
                          Підключення Telegram Бота
                        </h4>
                        <p className="text-xs text-gray-400 font-arimo">
                          Введіть токен від @BotFather для синхронізації вебхука та відправки сповіщень.
                        </p>
                      </div>
                    </div>

                    {isEditingBotToken && botConfig?.is_connected && (
                      <button
                        type="button"
                        onClick={() => setIsEditingBotToken(false)}
                        className="px-4 py-2 border border-white/10 hover:border-white/20 text-gray-300 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Скасувати
                      </button>
                    )}
                  </div>

                  {botConnectError && (
                    <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs font-arimo flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{botConnectError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow">
                      Telegram Bot API Token (HTTP API) *
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={botTokenInput}
                        onChange={(e) => setBotTokenInput(e.target.value)}
                        placeholder="наприклад: 7812938491:AAHq_mKl9..."
                        className="flex-1 px-4 py-3.5 bg-black/50 border border-white/15 rounded-2xl focus:border-[#E5C378] outline-none text-xs font-mono text-white tracking-wide"
                      />
                      <button
                        type="button"
                        disabled={isConnectingBot || !botTokenInput.trim()}
                        onClick={handleConnectBot}
                        className="px-8 py-3.5 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-wider rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(229,195,120,0.25)] disabled:opacity-50 cursor-pointer shrink-0"
                      >
                        {isConnectingBot ? (
                          <div className="w-4 h-4 border-2 border-[#0C0508] border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <Power className="w-4 h-4" />
                            <span>Підключити та налаштувати вебхук</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 font-arimo">
                      Після натискання токен перевіряється в Telegram, завантажується профіль бота та автоматично встановлюється вебхук.
                    </p>
                  </div>
                </div>
              ) : (
                /* CONNECTED BOT STATUS CARD */
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-center space-x-4">
                    {botConfig.bot_photo_url ? (
                      <img
                        src={botConfig.bot_photo_url}
                        alt="Bot Profile"
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-[#E5C378]/40 shadow-[0_0_20px_rgba(229,195,120,0.2)]"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-[#E5C378]/10 border border-[#E5C378]/30 flex items-center justify-center text-[#E5C378] font-black text-xl shadow-[0_0_15px_rgba(229,195,120,0.15)]">
                        VB
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2.5">
                        <h4 className="text-lg font-black text-white font-montserrat">
                          {botConfig.bot_name || 'Victoria Course Bot'}
                        </h4>
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-950/40 border border-green-500/30 text-green-400 font-narrow uppercase">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                          <span>Підключено</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        {botConfig.bot_username && (
                          <a
                            href={`https://t.me/${botConfig.bot_username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#E5C378] font-mono hover:underline flex items-center space-x-1"
                          >
                            <span>@{botConfig.bot_username}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <span className="text-gray-500">•</span>
                        <span className="text-gray-400 text-[11px] font-arimo">
                          Вебхук активний ({botConfig.webhook_url ? 'встановлено' : 'стандартний'})
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() => setIsEditingBotToken(true)}
                      className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-300 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer font-narrow"
                    >
                      Змінити токен
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnectBot}
                      className="px-4 py-2.5 bg-red-950/20 hover:bg-red-950/40 border border-red-500/20 hover:border-red-500/40 text-red-400 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer font-narrow"
                    >
                      Відключити
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Header & Sub-tab Switcher */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-xl">
                <div className="flex items-center space-x-2">
                  <span className="p-2 rounded-xl bg-[#E5C378]/10 border border-[#E5C378]/30 text-[#E5C378]">
                    <Bot className="w-5 h-5" />
                  </span>
                  <h3 className="font-montserrat text-2xl font-bold uppercase text-white tracking-wider">
                    Управління <span className="text-[#E5C378]">Повідомленнями</span>
                  </h3>
                </div>
                <p className="text-xs text-gray-300 font-arimo leading-relaxed">
                  Налаштовуйте автоматичні системні тригери під кожен урок та проводьте миттєві розсилки.
                </p>
              </div>

              {/* Sub-tab Navigation Buttons */}
              <div className="flex bg-black/40 rounded-2xl p-1.5 border border-white/5 w-full sm:w-auto shrink-0 gap-1">
                <button
                  onClick={() => setBotSubTab('events')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                    botSubTab === 'events'
                      ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_15px_rgba(229,195,120,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Події та Уроки ({botTemplates.length})</span>
                </button>
                <button
                  onClick={() => setBotSubTab('broadcast')}
                  className={`flex-1 sm:flex-initial flex items-center justify-center space-x-2 px-5 py-3 rounded-xl font-bold text-xs uppercase transition-all whitespace-nowrap cursor-pointer ${
                    botSubTab === 'broadcast'
                      ? 'bg-[#E5C378] text-[#0C0508] shadow-[0_0_15px_rgba(229,195,120,0.3)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Radio className="w-4 h-4" />
                  <span>Масова розсилка</span>
                </button>
              </div>
            </div>

            {/* SUB-TAB 1: EVENTS & LESSON TRIGGERS */}
            {botSubTab === 'events' && (
              <div className="space-y-8">
                {/* Actions & Filters bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-montserrat font-bold text-base text-white uppercase tracking-wider">
                      Автоматичні сценарії бота
                    </h4>
                    <p className="text-xs text-gray-400 font-arimo">
                      Ці повідомлення автоматично надсилаються учням при зміні статусів або відкритті нових модулів.
                    </p>
                  </div>

                  <button
                    onClick={handleAddCustomTemplate}
                    className="px-5 py-3 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(229,195,120,0.25)] cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Додати кастомне повідомлення</span>
                  </button>
                </div>

                {botTemplatesLoading ? (
                  <div className="py-24 text-center">
                    <div className="w-10 h-10 border-4 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-gray-500 font-narrow uppercase tracking-widest">Завантаження шаблонів бота...</p>
                  </div>
                ) : botTemplates.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-12 text-center text-gray-400">
                    Не знайдено налаштованих шаблонів. Натисніть «Додати кастомне повідомлення».
                  </div>
                ) : (
                  <div className="space-y-6">
                    {botTemplates.map((template) => (
                      <BotTemplateCard
                        key={template.id}
                        template={template}
                        saveStatus={templateSaveStatus[template.id] || 'idle'}
                        onSave={handleSaveTemplate}
                        onDelete={() => handleDeleteTemplate(template.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* SUB-TAB 2: MASS BROADCAST */}
            {botSubTab === 'broadcast' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left Column: Composer Form (7 cols) */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)]">
                      <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-[#E5C378] font-bold uppercase tracking-widest font-narrow">Створення повідомлення</span>
                          <h4 className="text-xl font-black text-white mt-0.5">Нова розсилка в Telegram</h4>
                        </div>
                        <Radio className="w-5 h-5 text-[#E5C378] animate-pulse" />
                      </div>

                      {/* Target Audience Selector */}
                      <div className="space-y-2">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow">
                          Отримувачі розсилки *
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setBroadcastAudience('all')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              broadcastAudience === 'all'
                                ? 'bg-[#E5C378]/10 border-[#E5C378] text-white shadow-[0_0_15px_rgba(229,195,120,0.2)]'
                                : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">Всі підписники бота</span>
                              <Users className="w-4 h-4 text-[#E5C378]" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-arimo">
                              {students.filter(s => s.telegram_chat_id).length} активних контактів
                            </p>
                          </button>

                          <button
                            type="button"
                            onClick={() => setBroadcastAudience('paid')}
                            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                              broadcastAudience === 'paid'
                                ? 'bg-[#E5C378]/10 border-[#E5C378] text-white shadow-[0_0_15px_rgba(229,195,120,0.2)]'
                                : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-xs">Тільки оплачені студенти</span>
                              <Award className="w-4 h-4 text-[#E5C378]" />
                            </div>
                            <p className="text-[10px] text-gray-400 font-arimo">
                              {students.filter(s => s.telegram_chat_id && (s.is_paid || s.payment_status === 'paid')).length} учнів
                            </p>
                          </button>
                        </div>
                      </div>

                      {/* Message Textarea */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow">
                            Текст повідомлення (Markdown) *
                          </label>
                          <button
                            type="button"
                            onClick={() => setBroadcastMessage(prev => prev + ' {name}')}
                            className="text-[10px] text-[#E5C378] bg-[#E5C378]/10 hover:bg-[#E5C378]/20 px-2 py-0.5 rounded border border-[#E5C378]/20 font-mono transition-all cursor-pointer"
                          >
                            + Ім&apos;я ({'{name}'})
                          </button>
                        </div>
                        <textarea
                          rows={6}
                          value={broadcastMessage}
                          onChange={(e) => setBroadcastMessage(e.target.value)}
                          placeholder="Привіт, {name}! 👋&#10;&#10;Запрошуємо вас приєднатися до нашого прямого ефіру або основного курсу..."
                          className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs text-white transition-all font-arimo placeholder-gray-600 resize-y leading-relaxed"
                        ></textarea>
                        <p className="text-[9px] text-gray-500 font-arimo">
                          Підтримуються жирний шрифт (*текст*), курсив (_текст_) та тег {'{name}'} для персоналізації.
                        </p>
                      </div>

                      {/* Optional Inline Button */}
                      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
                        <label className="flex items-center space-x-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={broadcastHasButton}
                            onChange={(e) => setBroadcastHasButton(e.target.checked)}
                            className="w-4 h-4 rounded bg-black/50 border-white/20 text-[#E5C378] focus:ring-[#E5C378]"
                          />
                          <span className="text-xs font-bold text-white uppercase font-narrow">
                            Додати кнопку-посилання під повідомленням
                          </span>
                        </label>

                        {broadcastHasButton && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                                Текст на кнопці
                              </label>
                              <input
                                type="text"
                                value={broadcastButtonText}
                                onChange={(e) => setBroadcastButtonText(e.target.value)}
                                placeholder="наприклад: Приєднатися до вебінару"
                                className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:border-[#E5C378] outline-none text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                                Посилання (URL)
                              </label>
                              <input
                                type="url"
                                value={broadcastButtonUrl}
                                onChange={(e) => setBroadcastButtonUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-2.5 bg-black/60 border border-white/10 rounded-xl focus:border-[#E5C378] outline-none text-xs text-white"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Send Action Button */}
                      <button
                        type="button"
                        disabled={!broadcastMessage.trim()}
                        onClick={() => setIsConfirmBroadcastOpen(true)}
                        className="w-full py-4 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center space-x-2 transition-all shadow-[0_0_20px_rgba(229,195,120,0.25)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer hover:scale-101"
                      >
                        <Send className="w-4 h-4" />
                        <span>Надіслати розсилку в Telegram</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Telegram Live Simulator Preview (5 cols) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-sm space-y-4">
                      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
                        <Smartphone className="w-4 h-4 text-[#E5C378]" />
                        <h5 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-narrow">
                          Попередній перегляд у Telegram
                        </h5>
                      </div>

                      {/* Telegram Dark Bubble Mockup */}
                      <div className="bg-[#182533] border border-[#242f3d] rounded-2xl p-4 space-y-3 shadow-inner font-sans">
                        <div className="flex items-center space-x-2.5">
                          {botConfig?.bot_photo_url ? (
                            <img
                              src={botConfig.bot_photo_url}
                              alt="Bot Avatar"
                              className="w-8 h-8 rounded-full object-cover border border-[#E5C378]/40"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#E5C378] text-[#0C0508] font-black text-xs flex items-center justify-center shadow-sm">
                              {botConfig?.bot_name ? botConfig.bot_name.charAt(0).toUpperCase() : 'V'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">
                              {botConfig?.bot_name || 'Victoria Course Bot'}
                            </p>
                            <p className="text-[10px] text-[#E5C378]">
                              {botConfig?.bot_username ? `@${botConfig.bot_username}` : 'bot'}
                            </p>
                          </div>
                        </div>

                        <div className="text-xs text-[#f5f5f5] leading-relaxed whitespace-pre-line break-words bg-[#202b36] p-3.5 rounded-xl border border-white/5">
                          {broadcastMessage.trim() ? (
                            broadcastMessage
                              .replace(/{name}/g, user.name || 'Олександр')
                              .replace(/\\n/g, '\n')
                          ) : (
                            <span className="text-gray-500 italic">
                              Тут з&apos;явиться текст вашого повідомлення...
                            </span>
                          )}
                        </div>

                        {broadcastHasButton && broadcastButtonText.trim() && (
                          <div className="pt-1">
                            <div className="w-full py-2.5 bg-[#2b5278] hover:bg-[#34608c] text-white text-center rounded-xl font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-sm">
                              <span>{broadcastButtonText}</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Broadcasts History Section */}
                <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden backdrop-blur-sm shadow-[0_8px_30px_rgba(0,0,0,0.3)] space-y-4 p-6">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <h4 className="font-montserrat font-bold text-base text-white uppercase tracking-wider flex items-center space-x-2">
                      <Radio className="w-4 h-4 text-[#E5C378]" />
                      <span>Історія розсилок ({broadcasts.length})</span>
                    </h4>
                    <button
                      onClick={fetchBroadcastsList}
                      className="text-xs text-[#E5C378] hover:underline flex items-center space-x-1 cursor-pointer font-narrow"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${broadcastsLoading ? 'animate-spin' : ''}`} />
                      <span>Оновити</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-xs">
                      <thead>
                        <tr className="border-b border-white/10 bg-black/30 font-narrow text-[10px] uppercase tracking-wider text-gray-400">
                          <th className="p-3 pl-4">Дата</th>
                          <th className="p-3">Текст повідомлення</th>
                          <th className="p-3">Аудиторія</th>
                          <th className="p-3 text-center">Доставлено</th>
                          <th className="p-3">Кнопка</th>
                          <th className="p-3 pr-4 text-right">Статус</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 font-arimo">
                        {broadcastsLoading ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center">
                              <div className="w-6 h-6 border-2 border-[#E5C378] border-t-transparent rounded-full animate-spin mx-auto mb-1"></div>
                              <p className="text-[10px] text-gray-500 font-narrow uppercase tracking-widest">Завантаження історії...</p>
                            </td>
                          </tr>
                        ) : broadcasts.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-500">
                              Ще не було відправлено жодної масової розсилки
                            </td>
                          </tr>
                        ) : (
                          broadcasts.map(b => (
                            <tr key={b.id} className="hover:bg-white/[0.02] transition-colors">
                              <td className="p-3 pl-4 text-gray-400 font-narrow whitespace-nowrap">
                                {new Date(b.created_at).toLocaleDateString('uk-UA')} {new Date(b.created_at).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-3 text-white max-w-xs truncate font-mono text-[11px]">
                                {b.message_text}
                              </td>
                              <td className="p-3 text-gray-300 font-narrow uppercase text-[10px]">
                                {b.target_audience === 'paid' ? 'Тільки оплачені' : 'Всі підписники'}
                              </td>
                              <td className="p-3 text-center font-bold">
                                <span className="text-green-400">{b.sent_count}</span>
                                <span className="text-gray-500"> / </span>
                                <span className="text-white">{b.total_recipients}</span>
                                {b.failed_count > 0 && (
                                  <span className="text-red-400 text-[10px] ml-1">({b.failed_count} помилок)</span>
                                )}
                              </td>
                              <td className="p-3 text-gray-400">
                                {b.button_text ? (
                                  <span className="text-[#E5C378] text-[10px] truncate block max-w-[120px]">
                                    🔗 {b.button_text}
                                  </span>
                                ) : (
                                  <span className="text-gray-600">—</span>
                                )}
                              </td>
                              <td className="p-3 pr-4 text-right">
                                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase font-narrow ${
                                  b.status === 'completed'
                                    ? 'bg-green-950/30 border border-green-500/30 text-green-400'
                                    : 'bg-red-950/30 border border-red-500/30 text-red-400'
                                }`}>
                                  {b.status === 'completed' ? 'Успішно ✅' : 'Помилка ❌'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}


      </main>

      {/* CONFIRM BROADCAST MODAL */}
      <AnimatePresence>
        {isConfirmBroadcastOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0C0508] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#E5C378]/10 border border-[#E5C378]/30 text-[#E5C378] flex items-center justify-center mx-auto">
                  <Send className="w-7 h-7" />
                </div>
                <h4 className="text-xl font-bold uppercase text-white font-montserrat">
                  Підтвердити розсилку?
                </h4>
                <p className="text-xs text-gray-400 font-arimo leading-relaxed">
                  Повідомлення буде миттєво відправлено{' '}
                  <b className="text-white">
                    {broadcastAudience === 'paid'
                      ? `${students.filter(s => s.telegram_chat_id && (s.is_paid || s.payment_status === 'paid')).length} оплаченим учням`
                      : `${students.filter(s => s.telegram_chat_id).length} підписникам бота`}
                  </b>.
                </p>
              </div>

              <div className="bg-black/40 border border-white/5 rounded-xl p-4 text-xs text-gray-300 font-arimo max-h-36 overflow-y-auto whitespace-pre-line">
                {broadcastMessage}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  disabled={sendingBroadcast}
                  onClick={() => setIsConfirmBroadcastOpen(false)}
                  className="py-3.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                >
                  Скасувати
                </button>
                <button
                  type="button"
                  disabled={sendingBroadcast}
                  onClick={handleExecuteBroadcast}
                  className="py-3.5 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-bold text-xs uppercase rounded-xl transition-all flex items-center justify-center space-x-1.5 shadow-[0_0_15px_rgba(229,195,120,0.3)] disabled:opacity-50 cursor-pointer font-montserrat"
                >
                  {sendingBroadcast ? (
                    <div className="w-4 h-4 border-2 border-[#0C0508] border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span>Так, надіслати</span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BROADCAST RESULT MODAL */}
      <AnimatePresence>
        {broadcastResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0C0508] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] text-center space-y-5"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/30 text-green-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h4 className="text-xl font-bold uppercase text-white font-montserrat">
                  Розсилку завершено!
                </h4>
                <p className="text-xs text-gray-400 font-arimo">
                  Успішно доставлено: <b className="text-green-400">{broadcastResult.sent}</b> з {broadcastResult.total}
                </p>
                {broadcastResult.failed > 0 && (
                  <p className="text-[10px] text-red-400 font-arimo">
                    Помилок доставки (заблоковано бот): {broadcastResult.failed}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setBroadcastResult(null)}
                className="w-full py-3.5 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-bold text-xs uppercase rounded-xl transition-all cursor-pointer font-montserrat"
              >
                Зрозуміло
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DETAILED FEEDBACK REVIEW MODAL (TAB 1) */}
      <AnimatePresence>
        {selectedSub && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-[#0C0508] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-xl w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#E5C378]/5 rounded-full blur-2xl pointer-events-none"></div>

              <h3 className="font-montserrat font-black text-xl uppercase text-white mb-2">
                Рецензування Завдання
              </h3>
              <p className="text-xs text-[#E5C378] font-narrow font-bold uppercase tracking-widest mb-6">
                Ефір {selectedSub.lessonId} • {selectedSub.userName}
              </p>

              <div className="space-y-6">
                {/* Clickable spreadsheet link card */}
                <div className="bg-black/35 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1 overflow-hidden pr-2">
                    <p className="text-[9px] text-gray-500 uppercase tracking-widest font-narrow">Посилання на виконане ДЗ:</p>
                    <a 
                      href={selectedSub.hwUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#E5C378] font-arimo hover:underline truncate block max-w-full"
                    >
                      {selectedSub.hwUrl}
                    </a>
                  </div>
                  <a 
                    href={selectedSub.hwUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] flex items-center justify-center shadow-[0_0_10px_rgba(229,195,120,0.2)] flex-shrink-0"
                    title="Відкрити таблицю у новій вкладці"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Review Text comment */}
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] font-narrow">
                    Коментар / Поради для учня (Куратор може написати що виправити)
                  </label>
                  <textarea
                    rows={5}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Чудова робота! Все заповнено абсолютно вірно, наступний ефір відкрито..."
                    className="w-full p-4 bg-black/50 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs text-white transition-all font-arimo placeholder-gray-700 resize-none"
                  ></textarea>
                </div>

                {/* Explicit Action Buttons */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => handleReviewAction('accepted')}
                      className="py-4 px-4 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-black font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_15px_rgba(34,197,94,0.3)] cursor-pointer"
                    >
                      <CheckCircle2 className="w-4.5 h-4.5" />
                      <span>Зарахувати та відкрити наступний</span>
                    </button>
                    
                    <button
                      type="button"
                      disabled={savingReview}
                      onClick={() => handleReviewAction('needs_improvement')}
                      className="py-4 px-4 border border-amber-500 hover:bg-amber-950/20 disabled:opacity-50 text-amber-400 font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all shadow-[0_4px_15px_rgba(245,158,11,0.1)] cursor-pointer"
                    >
                      <AlertTriangle className="w-4.5 h-4.5" />
                      <span>Відхилити (Потребує доопрацювання)</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedSub(null)}
                    className="w-full py-3.5 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white font-montserrat font-bold text-xs uppercase rounded-xl transition-all block text-center bg-black/10 cursor-pointer"
                  >
                    Скасувати
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// NESTED INDIVIDUAL FORM CARD COMPONENT FOR TAB 3
interface LessonFormCardProps {
  lesson: MinicourseLessonConfig;
  lessonNumber: number;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  onSave: (lessonId: number, configForm: Partial<MinicourseLessonConfig>) => Promise<void>;
  onDelete: () => Promise<void>;
}

function LessonFormCard({ lesson, lessonNumber, saveStatus, onSave, onDelete }: LessonFormCardProps) {
  const [title, setTitle] = useState(lesson.title || `Урок ${lesson.lesson_id}`);
  const [description, setDescription] = useState(lesson.description || '');
  const [youtubeInput, setYoutubeInput] = useState(lesson.youtube_url || lesson.youtube_id || '');
  const [links, setLinks] = useState<LessonMaterialLink[]>(
    Array.isArray(lesson.links) && lesson.links.length > 0 
      ? lesson.links 
      : []
  );
  const [descriptionUnderVideo, setDescriptionUnderVideo] = useState(
    lesson.description_under_video || lesson.hw_instructions || ''
  );

  const detectedYouTubeId = extractYouTubeId(youtubeInput);

  const handleAddLink = () => {
    if (links.length >= 5) return;
    setLinks(prev => [
      ...prev,
      { id: 'link-' + Math.random().toString(36).substr(2, 9), title: '', url: '' }
    ]);
  };

  const handleUpdateLink = (index: number, field: 'title' | 'url', value: string) => {
    setLinks(prev => prev.map((l, i) => i === index ? { ...l, [field]: value } : l));
  };

  const handleRemoveLink = (index: number) => {
    setLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(lesson.lesson_id, {
      title: title.trim(),
      description: description.trim(),
      youtube_id: detectedYouTubeId || youtubeInput.trim(),
      youtube_url: youtubeInput.trim(),
      links: links.filter(l => l.title.trim() && l.url.trim()),
      description_under_video: descriptionUnderVideo.trim(),
      hw_instructions: descriptionUnderVideo.trim()
    });
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6 relative overflow-hidden transition-all hover:border-white/15 shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
    >
      <div className="absolute top-0 right-0 p-6 font-bold text-5xl opacity-5 text-white select-none pointer-events-none">
        {lessonNumber < 10 ? `0${lessonNumber}` : lessonNumber}
      </div>

      {/* Header with Title and Delete */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className="px-3 py-1 rounded-lg bg-[#E5C378]/10 border border-[#E5C378]/30 text-[#E5C378] font-black text-xs uppercase tracking-wider font-montserrat">
            Урок {lesson.lesson_id}
          </span>
          <h4 className="text-lg font-black text-white">{title || `Урок ${lesson.lesson_id}`}</h4>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-[11px] font-narrow font-bold text-gray-500">
            Оновлено: {lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString('uk-UA') : 'Сьогодні'}
          </div>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center space-x-1.5 text-xs font-narrow uppercase"
            title="Видалити цей урок"
          >
            <Trash2 className="w-4 h-4" />
            <span>Видалити</span>
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Lesson Title */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
            Назва уроку *
          </label>
          <input 
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="наприклад: Урок 1: Вступ та перший практичний крок"
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs font-arimo text-white transition-all placeholder-gray-600"
          />
        </div>

        {/* Short Description */}
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
            Короткий опис уроку *
          </label>
          <input 
            type="text"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Короткий зміст або мета цього модуля..."
            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs font-arimo text-white transition-all placeholder-gray-600"
          />
        </div>

      </div>

      {/* YouTube Video URL Field with Realtime Auto-Decoder */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-3">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#E5C378] font-narrow flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <Video className="w-3.5 h-3.5" />
            <span>Посилання на відео в YouTube *</span>
          </span>
          <span className="text-[9px] text-gray-500 font-normal">Підтримуються будь-які YouTube посилання або ID</span>
        </label>

        <div className="relative">
          <input 
            type="text"
            required
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... або https://youtu.be/..."
            className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs font-arimo text-white transition-all font-mono placeholder-gray-600"
          />
        </div>

        {/* Realtime detection feedback */}
        <div className="flex items-center justify-between pt-1">
          {detectedYouTubeId ? (
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <Check className="w-3 h-3" />
                <span>Розпізнано ID: {detectedYouTubeId}</span>
              </span>
              <a 
                href={`https://www.youtube.com/watch?v=${detectedYouTubeId}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] text-[#E5C378] hover:underline flex items-center space-x-1 font-narrow"
              >
                <span>Переглянути на YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500 font-arimo">
              Введіть посилання на відео на YouTube (ID буде вилучено автоматично)
            </p>
          )}
        </div>
      </div>

      {/* DYNAMIC CUSTOM LINKS MANAGER (UP TO 5 LINKS) */}
      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-narrow flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#E5C378]" />
              <span>Додаткові матеріали та посилання</span>
              <span className="text-gray-500 text-[10px]">({links.length} / 5)</span>
            </h5>
            <p className="text-[10px] text-gray-400 font-arimo mt-0.5">
              Додавайте кнопки з посиланнями (наприклад: таблиці, конспекти, Notion, файли).
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddLink}
            disabled={links.length >= 5}
            className="px-3.5 py-2 bg-white/5 hover:bg-[#E5C378]/10 border border-white/10 hover:border-[#E5C378]/30 text-[#E5C378] font-montserrat font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Додати посилання</span>
          </button>
        </div>

        {links.length === 0 ? (
          <div className="py-4 text-center border border-dashed border-white/10 rounded-xl bg-black/20 text-gray-500 text-xs font-arimo">
            Немає доданих посилань. Натисніть «Додати посилання», якщо до уроку потрібні таблиці або матеріали.
          </div>
        ) : (
          <div className="space-y-3">
            {links.map((link, linkIdx) => (
              <div 
                key={link.id || linkIdx} 
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-black/40 border border-white/10 rounded-xl items-center"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                    Назва посилання #{linkIdx + 1}
                  </label>
                  <input 
                    type="text"
                    required
                    value={link.title}
                    onChange={(e) => handleUpdateLink(linkIdx, 'title', e.target.value)}
                    placeholder="наприклад: Таблиця розрахунків"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg focus:border-[#E5C378] outline-none text-xs font-arimo text-white transition-all"
                  />
                </div>

                <div className="sm:col-span-7">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                    URL адреса посилання
                  </label>
                  <input 
                    type="url"
                    required
                    value={link.url}
                    onChange={(e) => handleUpdateLink(linkIdx, 'url', e.target.value)}
                    placeholder="https://docs.google.com/... або https://notion.site/..."
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg focus:border-[#E5C378] outline-none text-xs font-arimo text-white transition-all"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(linkIdx)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Видалити це посилання"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DESCRIPTION UNDER VIDEO / HOMEWORK INSTRUCTIONS */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow flex items-center justify-between">
          <span>Опис під відео (конспект, домашнє завдання, замітки)</span>
          <span className="text-[9px] text-gray-500">Відображається під відеоплеєром на сторінці уроку</span>
        </label>
        <textarea
          rows={6}
          value={descriptionUnderVideo}
          onChange={(e) => setDescriptionUnderVideo(e.target.value)}
          placeholder="Введіть опис уроку, ключові пункти конспекту або завдання для учня..."
          className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs text-white transition-all font-arimo placeholder-gray-600 resize-y"
        ></textarea>
      </div>

      {/* Save panel */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div>
          {saveStatus === 'success' && (
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <CheckCircle2 className="w-4 h-4" />
              <span>Зміни збережено! 🎉</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <AlertCircle className="w-4 h-4" />
              <span>Помилка збереження! ❌</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-[#E5C378] font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#E5C378] border-t-transparent rounded-full animate-spin"></div>
              <span>Запис змін...</span>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="px-6 py-3.5 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(229,195,120,0.2)] disabled:opacity-50 cursor-pointer hover:scale-102"
        >
          <Save className="w-4 h-4" />
          <span>Зберегти Урок {lesson.lesson_id}</span>
        </button>
      </div>
    </form>
  );
}

// ----------------------------------------------------
// NESTED BOT TEMPLATE CARD COMPONENT (TAB 5)
// ----------------------------------------------------
interface BotTemplateCardProps {
  template: BotMessageTemplate;
  saveStatus: 'idle' | 'saving' | 'success' | 'error';
  onSave: (template: BotMessageTemplate) => Promise<void>;
  onDelete: () => Promise<void>;
}

function BotTemplateCard({ template, saveStatus, onSave, onDelete }: BotTemplateCardProps) {
  const [title, setTitle] = useState(template.title);
  const [description, setDescription] = useState(template.description || '');
  const [messageText, setMessageText] = useState((template.message_text || '').replace(/\\n/g, '\n'));
  const [buttons, setButtons] = useState<BotMessageButton[]>(Array.isArray(template.buttons) ? template.buttons : []);
  const [isEnabled, setIsEnabled] = useState(template.is_enabled ?? true);

  const getEventBadge = () => {
    switch (template.event_key) {
      case 'welcome':
        return { label: 'Привітання', color: 'bg-[#E5C378]/15 border-[#E5C378]/30 text-[#E5C378]' };
      case 'hw_submitted':
        return { label: 'Здача ДЗ', color: 'bg-blue-950/30 border-blue-500/30 text-blue-400' };
      case 'hw_accepted':
        return { label: 'Зарахування ДЗ', color: 'bg-green-950/30 border-green-500/30 text-green-400' };
      case 'hw_needs_improvement':
        return { label: 'Доопрацювання', color: 'bg-amber-950/30 border-amber-500/30 text-amber-400' };
      case 'reminder':
        return { label: 'Нагадування', color: 'bg-purple-950/30 border-purple-500/30 text-purple-400' };
      case 'lesson_unlocked':
        return { label: `Урок ${template.lesson_id || ''}`, color: 'bg-[#E5C378]/10 border-[#E5C378]/30 text-[#E5C378]' };
      default:
        return { label: 'Кастомне', color: 'bg-pink-950/30 border-pink-500/30 text-pink-400' };
    }
  };

  const badge = getEventBadge();

  const handleAddButton = () => {
    if (buttons.length >= 3) return;
    setButtons(prev => [
      ...prev,
      { text: '👉 Відкрити урок', url_type: 'autologin_lesson', custom_url: '' }
    ]);
  };

  const handleUpdateButton = (index: number, field: keyof BotMessageButton, value: any) => {
    setButtons(prev => prev.map((b, i) => i === index ? { ...b, [field]: value } : b));
  };

  const handleRemoveButton = (index: number) => {
    setButtons(prev => prev.filter((_, i) => i !== index));
  };

  const handleInsertTag = (tag: string) => {
    setMessageText(prev => prev + ' ' + tag);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...template,
      title: title.trim(),
      description: description.trim(),
      message_text: messageText.trim(),
      buttons: buttons.filter(b => b.text.trim()),
      is_enabled: isEnabled
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white/5 border rounded-3xl p-6 sm:p-8 backdrop-blur-sm space-y-6 transition-all shadow-[0_8px_30px_rgba(0,0,0,0.3)] ${
        isEnabled ? 'border-white/10 hover:border-white/20' : 'border-white/5 opacity-60'
      }`}
    >
      {/* Header with Badges, Title, and Enable Switch */}
      <div className="border-b border-white/10 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-lg border text-xs font-black uppercase tracking-wider font-narrow ${badge.color}`}>
            {badge.label}
          </span>
          <h4 className="text-lg font-black text-white">{title || 'Шаблон повідомлення'}</h4>
        </div>

        <div className="flex items-center space-x-4">
          {/* Active Switch Toggle */}
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-black/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E5C378] relative"></div>
            <span className="text-xs font-bold font-narrow uppercase text-gray-300">
              {isEnabled ? 'Активне' : 'Вимкнено'}
            </span>
          </label>

          {template.event_key === 'custom' && (
            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              title="Видалити шаблон"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Description Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
            Назва події в адмінці *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] outline-none text-xs font-arimo text-white"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 font-narrow">
            Пояснення / Коли спрацьовує
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опис моменту спрацювання тригера..."
            className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] outline-none text-xs font-arimo text-gray-300"
          />
        </div>
      </div>

      {/* Message Text with Quick Variables Insert Bar */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 font-narrow">
            Текст повідомлення бота (Markdown) *
          </label>

          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
            <span className="text-[10px] text-gray-500 font-narrow uppercase">Змінні:</span>
            <button
              type="button"
              onClick={() => handleInsertTag('{name}')}
              className="text-[10px] text-[#E5C378] bg-[#E5C378]/10 hover:bg-[#E5C378]/20 px-2 py-0.5 rounded border border-[#E5C378]/20 font-mono transition-all cursor-pointer"
              title="Підставити ім'я користувача"
            >
              {'{name}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('{lesson_id}')}
              className="text-[10px] text-[#E5C378] bg-[#E5C378]/10 hover:bg-[#E5C378]/20 px-2 py-0.5 rounded border border-[#E5C378]/20 font-mono transition-all cursor-pointer"
              title="Підставити номер уроку"
            >
              {'{lesson_id}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('{lesson_title}')}
              className="text-[10px] text-[#E5C378] bg-[#E5C378]/10 hover:bg-[#E5C378]/20 px-2 py-0.5 rounded border border-[#E5C378]/20 font-mono transition-all cursor-pointer"
              title="Підставити назву уроку"
            >
              {'{lesson_title}'}
            </button>
            <button
              type="button"
              onClick={() => handleInsertTag('{comment}')}
              className="text-[10px] text-[#E5C378] bg-[#E5C378]/10 hover:bg-[#E5C378]/20 px-2 py-0.5 rounded border border-[#E5C378]/20 font-mono transition-all cursor-pointer"
              title="Підставити коментар куратора"
            >
              {'{comment}'}
            </button>
          </div>
        </div>

        <textarea
          rows={6}
          required
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          className="w-full p-4 bg-black/40 border border-white/10 rounded-xl focus:border-[#E5C378] focus:ring-1 focus:ring-[#E5C378] outline-none text-xs text-white transition-all font-arimo resize-y placeholder-gray-600 leading-relaxed"
        ></textarea>
      </div>

      {/* Dynamic Inline Buttons Manager */}
      <div className="bg-black/30 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider font-narrow flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#E5C378]" />
              <span>Кнопки під повідомленням</span>
              <span className="text-gray-500 text-[10px]">({buttons.length} / 3)</span>
            </h5>
            <p className="text-[10px] text-gray-400 font-arimo mt-0.5">
              Кнопки переходять на урок з автологіном або за кастомним посиланням.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddButton}
            disabled={buttons.length >= 3}
            className="px-3 py-1.5 bg-white/5 hover:bg-[#E5C378]/10 border border-white/10 hover:border-[#E5C378]/30 text-[#E5C378] font-montserrat font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center space-x-1 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Додати кнопку</span>
          </button>
        </div>

        {buttons.length === 0 ? (
          <div className="py-3 text-center border border-dashed border-white/10 rounded-xl bg-black/20 text-gray-500 text-xs font-arimo">
            Без кнопок (тільки текст)
          </div>
        ) : (
          <div className="space-y-3">
            {buttons.map((btn, btnIdx) => (
              <div
                key={btnIdx}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-black/50 border border-white/10 rounded-xl items-center"
              >
                <div className="sm:col-span-4">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                    Текст кнопки #{btnIdx + 1}
                  </label>
                  <input
                    type="text"
                    required
                    value={btn.text}
                    onChange={(e) => handleUpdateButton(btnIdx, 'text', e.target.value)}
                    placeholder="👉 Перейти до уроку"
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg focus:border-[#E5C378] outline-none text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                    Тип посилання
                  </label>
                  <select
                    value={btn.url_type}
                    onChange={(e) => handleUpdateButton(btnIdx, 'url_type', e.target.value as any)}
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg focus:border-[#E5C378] outline-none text-xs text-white"
                  >
                    <option value="autologin_lesson">Перехід на Урок (з автологіном)</option>
                    <option value="autologin_dashboard">Особистий кабінет (з автологіном)</option>
                    <option value="custom_url">Своє посилання (URL)</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1 font-narrow">
                    {btn.url_type === 'custom_url' ? 'URL адреса' : 'Автоматичний лінк'}
                  </label>
                  {btn.url_type === 'custom_url' ? (
                    <input
                      type="url"
                      required
                      value={btn.custom_url || ''}
                      onChange={(e) => handleUpdateButton(btnIdx, 'custom_url', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-lg focus:border-[#E5C378] outline-none text-xs text-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-black/30 border border-white/5 rounded-lg text-xs text-gray-500 font-mono truncate">
                      {btn.url_type === 'autologin_lesson' ? '👉 /minicourse/lessons/[id]' : '👉 /minicourse'}
                    </div>
                  )}
                </div>

                <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-4">
                  <button
                    type="button"
                    onClick={() => handleRemoveButton(btnIdx)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                    title="Видалити кнопку"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save panel */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
        <div>
          {saveStatus === 'success' && (
            <span className="text-xs text-green-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <CheckCircle2 className="w-4 h-4" />
              <span>Шаблон збережено! 🎉</span>
            </span>
          )}
          {saveStatus === 'error' && (
            <span className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow">
              <AlertCircle className="w-4 h-4" />
              <span>Помилка збереження! ❌</span>
            </span>
          )}
          {saveStatus === 'saving' && (
            <span className="text-xs text-[#E5C378] font-bold uppercase tracking-wider flex items-center space-x-1.5 font-narrow animate-pulse">
              <div className="w-3.5 h-3.5 border-2 border-[#E5C378] border-t-transparent rounded-full animate-spin"></div>
              <span>Запис змін...</span>
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="px-6 py-3 bg-[#E5C378] hover:bg-[#d4b065] text-[#0C0508] font-montserrat font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition-all shadow-[0_0_15px_rgba(229,195,120,0.25)] disabled:opacity-50 cursor-pointer hover:scale-102"
        >
          <Save className="w-4 h-4" />
          <span>Зберегти шаблон</span>
        </button>
      </div>
    </form>
  );
}
