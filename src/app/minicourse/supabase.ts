import { createClient } from '@supabase/supabase-js';
import { 
  MinicourseUser, 
  MinicourseProgress, 
  HomeworkStatus, 
  LessonProgress, 
  MinicourseLessonConfig, 
  StudentWithProgress, 
  MinicoursePrizeCode,
  BotMessageTemplate,
  BotBroadcast,
  BotMessageButton,
  BotConfig
} from './types';

// Read keys from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// On the server, use service role key to bypass RLS. On the client, use anon key.
const activeKey = (typeof window === 'undefined' && supabaseServiceKey) 
  ? supabaseServiceKey 
  : supabaseAnonKey;

// Initialize actual Supabase client if keys are present
export const supabase = supabaseUrl && activeKey 
  ? createClient(supabaseUrl, activeKey, {
      auth: {
        persistSession: typeof window !== 'undefined'
      }
    }) 
  : null;

const IS_MOCK_MODE = !supabase;

if (IS_MOCK_MODE) {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.endsWith('.local')) {
      throw new Error("CRITICAL: Supabase credentials are missing on this production deployment! LocalStorage fallback disabled for safety.");
    }
  }
  console.warn("⚠️ Supabase credentials not found. Mini-Course Platform is running in MOCK MODE (LocalStorage-backed).");
}

// Initial mockup data if LocalStorage is empty
const DEFAULT_USERS: MinicourseUser[] = [
  { id: 'admin-sofifinsight', name: 'Адміністратор Owner (Вікторія)', email: 'victoria@minicourse.com', telegram: 'victoria_owner', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-yuransis', name: 'Адміністратор YuransiS', email: 'yuransis@minicourse.com', telegram: 'yuransis', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-jeniaproop', name: 'Адміністратор JeniaProop', email: 'jeniaproop@minicourse.com', telegram: 'jeniaproop', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
  { id: 'admin-anya-koorator', name: 'Адміністратор Anya-Koorator', email: 'anya-koorator@minicourse.com', telegram: 'anya-koorator', role: 'admin', created_at: new Date().toISOString(), is_paid: true, payment_status: 'paid', device_uuids: [], status: 'active' },
];

const DEFAULT_PROGRESS: MinicourseProgress[] = [];


// Helper functions for mock storage
function getLocalUsers(): MinicourseUser[] {
  if (typeof window === 'undefined') return DEFAULT_USERS;
  const data = localStorage.getItem('minicourse_users');
  if (!data) {
    localStorage.setItem('minicourse_users', JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  try {
    const parsed = JSON.parse(data) as MinicourseUser[];
    // Clear out unrealistic placeholder student records
    const cleaned = parsed.filter(u => 
      u.role === 'admin' || 
      (u.role === 'student' && 
       !u.id.startsWith('mock-') && 
       (!u.email || (!u.email.includes('alex_invest') && !u.email.includes('student'))) && 
       !u.name.includes('Алекс') && 
       !u.name.includes('Студент') && 
       !u.name.includes('Марія'))
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('minicourse_users', JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_USERS;
  }
}

function saveLocalUsers(users: MinicourseUser[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_users', JSON.stringify(users));
  }
}

function getLocalProgress(): MinicourseProgress[] {
  if (typeof window === 'undefined') return DEFAULT_PROGRESS;
  const data = localStorage.getItem('minicourse_progress');
  if (!data) {
    localStorage.setItem('minicourse_progress', JSON.stringify(DEFAULT_PROGRESS));
    return DEFAULT_PROGRESS;
  }
  try {
    const parsed = JSON.parse(data) as MinicourseProgress[];
    const validUserIds = new Set(getLocalUsers().map(u => u.id));
    const cleaned = parsed.filter(p => validUserIds.has(p.userId));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem('minicourse_progress', JSON.stringify(cleaned));
      return cleaned;
    }
    return parsed;
  } catch (e) {
    return DEFAULT_PROGRESS;
  }
}

function saveLocalProgress(progress: MinicourseProgress[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_progress', JSON.stringify(progress));
  }
}

export function extractYouTubeId(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regex);
  if (match && match[1]) {
    return match[1];
  }
  return trimmed;
}

export const DEFAULT_LESSONS_CONFIG: MinicourseLessonConfig[] = [
  {
    lesson_id: 1,
    title: "Урок 1: Вступний модуль",
    description: "Перший практичний крок та план дій",
    youtube_id: "SnyxALmvvnE",
    links: [
      { id: '1', title: 'Таблиця розрахунків', url: 'https://docs.google.com/spreadsheets/d/1xptWzJrSQ8aW2pOyuWpSH7P-4_tOJ6i04iB2-roF9kw/edit?usp=sharing' }
    ],
    description_under_video: `ВАЖЛИВО! Починаємо роботу лише в скопійованій таблиці!

Зробіть копію таблиці за посиланням вище.
Заповніть її за відповідними критеріями та надішліть посилання на перевірку.`,
    sort_order: 1,
    updated_at: new Date().toISOString()
  }
];

function getLocalLessonsConfig(): MinicourseLessonConfig[] {
  if (typeof window === 'undefined') return DEFAULT_LESSONS_CONFIG;
  const data = localStorage.getItem('minicourse_lessons_config');
  if (!data) {
    localStorage.setItem('minicourse_lessons_config', JSON.stringify(DEFAULT_LESSONS_CONFIG));
    return DEFAULT_LESSONS_CONFIG;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_LESSONS_CONFIG;
  }
}

function saveLocalLessonsConfig(config: MinicourseLessonConfig[]) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_lessons_config', JSON.stringify(config));
  }
}

// Calculate total progress percentage out of 100 dynamically
export function calculateProgressPercent(lessons: MinicourseProgress['lessons'], totalCount: number = 3): number {
  if (!lessons) return 0;
  let points = 0;
  const lessonIds = Object.keys(lessons).map(Number).filter(n => !isNaN(n));
  const count = Math.max(lessonIds.length, totalCount, 1);

  lessonIds.forEach(id => {
    const l = lessons[id];
    if (l) {
      if (l.videoCompleted) points += 1;
      if (l.hwStatus === 'accepted') points += 1;
    }
  });

  const totalPoints = count * 2;
  return Math.min(100, Math.round((points / totalPoints) * 100));
}

// Platform API Layer
export async function loginUser(telegramUsername: string, name?: string, deviceUuid?: string): Promise<{ user: MinicourseUser; progress: MinicourseProgress }> {
  const normInput = telegramUsername.replace(/^@/, '').trim().toLowerCase();
  const digitsOnly = normInput.replace(/\D/g, '');

  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    let user = users.find(u => 
      (u.telegram && u.telegram.toLowerCase() === normInput) ||
      (digitsOnly && u.phone && u.phone.replace(/\D/g, '') === digitsOnly)
    );
    
    if (!user) {
      // Auto-register new student but mark as unpaid so they are prompted to pay
      user = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name: name || normInput,
        telegram: normInput,
        phone: digitsOnly || undefined,
        role: 'student',
        is_paid: false,
        payment_status: 'pending',
        device_uuids: [],
        status: 'active',
        created_at: new Date().toISOString()
      };
      users.push(user);
      saveLocalUsers(users);
    }

    const activeUser = user as MinicourseUser;

    if (activeUser.role === 'student') {
      if (!activeUser.is_paid) {
        throw new Error("Практикум ще не сплачено. Оплатіть участь на головній сторінці для отримання доступу.");
      }
      if (activeUser.status === 'under_investigation') {
        throw new Error("Доступ заблоковано. Зафіксовано вхід з великої кількості пристроїв. Будь ласка, зверніться в підтримку.");
      }

      // Check 14-day limit
      const accessStart = activeUser.access_opened_at || activeUser.created_at;
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays > 14) {
        throw new Error("Термін Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).");
      }

      if (deviceUuid) {
        const uuids = activeUser.device_uuids || [];
        if (!uuids.includes(deviceUuid)) {
          if (uuids.length >= 4) {
            activeUser.status = 'under_investigation';
            activeUser.device_uuids = [...uuids, deviceUuid];
            saveLocalUsers(users);
            throw new Error("Доступ заблоковано. Зафіксовано вхід з 5 унікальних пристроїв. Зверніться до підтримки.");
          } else {
            activeUser.device_uuids = [...uuids, deviceUuid];
            saveLocalUsers(users);
          }
        }
      }
    }

    const progressList = getLocalProgress();
    let progress = progressList.find(p => p.userId === activeUser.id);
    if (!progress) {
      progress = {
        id: 'p-' + Math.random().toString(36).substr(2, 9),
        userId: activeUser.id,
        progressPercent: 0,
        lessons: {
          1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
          2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
          3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
        },
        updatedAt: new Date().toISOString()
      };
      progressList.push(progress);
      saveLocalProgress(progressList);
    }

    return { user: activeUser, progress };
  } else {
    // ACTUAL SUPABASE INTEGRATION
    // 1. Fetch user
    let queryFilter = `telegram.ilike.${normInput}`;
    if (digitsOnly) {
      queryFilter += `,phone.eq.${digitsOnly}`;
    }

    let { data: users, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .or(queryFilter)
      .order('created_at', { ascending: false });

    if (error) throw error;

    let user = null;
    if (users && users.length > 0) {
      user = users.find(u => u.is_paid && u.status !== 'under_investigation') ||
             users.find(u => u.is_paid) ||
             users[0];
    }

    if (!user) {
      throw new Error("Вхід заборонено. Користувача не знайдено. Будь ласка, придбайте практикум на головній сторінці.");
    }

    if (user.role === 'student') {
      if (!user.is_paid) {
        throw new Error("Практикум ще не сплачено. Оплатіть участь на головній сторінці для отримання доступу.");
      }
      if (user.status === 'under_investigation') {
        throw new Error("Доступ заблоковано. Зафіксовано вхід з великої кількості пристроїв. Будь ласка, зверніться в підтримку.");
      }

      // Check 14-day limit
      const accessStart = user.access_opened_at || user.created_at;
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays > 14) {
        throw new Error("Термін Вашого доступу до міні-курсу закінчився (доступ надається на 2 тижні з моменту оплати).");
      }

      if (deviceUuid) {
        const uuids: string[] = user.device_uuids || [];
        if (!uuids.includes(deviceUuid)) {
          const newUuids = [...uuids, deviceUuid];
          if (uuids.length >= 4) {
            const { error: blockErr } = await supabase!
              .from('minicourse_users')
              .update({
                status: 'under_investigation',
                device_uuids: newUuids
              })
              .eq('id', user.id);
            
            if (blockErr) throw blockErr;
            throw new Error("Доступ заблоковано. Зафіксовано вхід з 5 унікальних пристроїв. Зверніться до підтримки.");
          } else {
            const { error: updateErr } = await supabase!
              .from('minicourse_users')
              .update({
                device_uuids: newUuids
              })
              .eq('id', user.id);
            
            if (updateErr) throw updateErr;
            user.device_uuids = newUuids;
          }
        }
      }
    }

    // 2. Fetch or create progress
    let { data: progress, error: progError } = await supabase!
      .from('minicourse_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (progError) throw progError;

    if (!progress) {
      const defaultLessons = {
        1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
        2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
        3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
      };

      const { data: newProg, error: createProgErr } = await supabase!
        .from('minicourse_progress')
        .insert({
          user_id: user.id,
          progress_percent: 0,
          lessons: defaultLessons
        })
        .select()
        .single();
      
      if (createProgErr) throw createProgErr;
      progress = newProg;
    }

    // Map database fields to application types
    const appProgress: MinicourseProgress = {
      id: progress.id,
      userId: progress.user_id,
      progressPercent: progress.progress_percent,
      lessons: progress.lessons,
      updatedAt: progress.updated_at
    };

    return { user: user as MinicourseUser, progress: appProgress };
  }
}

export async function getProfile(userId: string): Promise<MinicourseUser | null> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    return users.find(u => u.id === userId) || null;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data as MinicourseUser;
  }
}

export async function getProgress(userId: string): Promise<MinicourseProgress | null> {
  if (IS_MOCK_MODE) {
    const progressList = getLocalProgress();
    return progressList.find(p => p.userId === userId) || null;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) return null;
    return {
      id: data.id,
      userId: data.user_id,
      progressPercent: data.progress_percent,
      lessons: data.lessons,
      updatedAt: data.updated_at
    };
  }
}

export async function updateProgress(userId: string, lessonId: 1 | 2 | 3, updates: Partial<LessonProgress>): Promise<MinicourseProgress> {
  // If the student is submitting homework, verify the 7-day feedback limit
  if (updates.hwSubmitted) {
    const user = await getProfile(userId);
    const accessStart = user?.access_opened_at || user?.created_at;
    if (user && user.role === 'student' && accessStart) {
      const elapsedDays = (Date.now() - new Date(accessStart).getTime()) / (1000 * 60 * 60 * 24);
      if (elapsedDays > 7) {
        throw new Error("Термін здачі домашнього завдання (7 днів) закінчився. Здача більше недоступна.");
      }
    }
  }

  if (IS_MOCK_MODE) {
    const progressList = getLocalProgress();
    const idx = progressList.findIndex(p => p.userId === userId);
    if (idx === -1) throw new Error("Progress record not found");

    const record = progressList[idx];
    record.lessons[lessonId] = {
      ...record.lessons[lessonId],
      ...updates
    };

    // Calculate progression
    record.progressPercent = calculateProgressPercent(record.lessons);
    record.updatedAt = new Date().toISOString();

    progressList[idx] = record;
    saveLocalProgress(progressList);
    return record;
  } else {
    // Read existing
    const current = await getProgress(userId);
    if (!current) throw new Error("Progress not found");

    const updatedLessons = {
      ...current.lessons,
      [lessonId]: {
        ...current.lessons[lessonId],
        ...updates
      }
    };

    const newPercent = calculateProgressPercent(updatedLessons);

    const { data, error } = await supabase!
      .from('minicourse_progress')
      .update({
        lessons: updatedLessons,
        progress_percent: newPercent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      progressPercent: data.progress_percent,
      lessons: data.lessons,
      updatedAt: data.updated_at
    };
  }
}

export function maskTelegram(tg: string): string {
  const clean = tg.replace(/^@/, '');
  if (!clean) return '';
  if (clean.length <= 3) {
    return '@' + clean[0] + '*'.repeat(clean.length - 1);
  }
  return '@' + clean.slice(0, 3) + '***' + clean.slice(-2);
}

export interface StudentLeaderboardEntry {
  id: string;
  name: string;
  telegram?: string;
  progressPercent: number;
}

export async function getLeaderboard(currentUserId?: string): Promise<StudentLeaderboardEntry[]> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers().filter(u => u.role === 'student');
    const progressList = getLocalProgress();
    
    return users.map(user => {
      const prog = progressList.find(p => p.userId === user.id);
      const isSelf = user.id === currentUserId;
      return {
        id: user.id,
        name: user.name,
        telegram: isSelf ? user.telegram : undefined,
        progressPercent: prog ? prog.progressPercent : 0
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);
  } else {
    // Join logic in supabase or via dual query
    const { data: users, error: uErr } = await supabase!
      .from('minicourse_users')
      .select('id, name, telegram')
      .eq('role', 'student');
    
    if (uErr) throw uErr;

    const { data: progress, error: pErr } = await supabase!
      .from('minicourse_progress')
      .select('user_id, progress_percent');

    if (pErr) throw pErr;

    return users.map(u => {
      const prog = progress.find(p => p.user_id === u.id);
      const isSelf = u.id === currentUserId;
      return {
        id: u.id,
        name: u.name,
        telegram: isSelf ? (u.telegram || undefined) : undefined,
        progressPercent: prog ? prog.progress_percent : 0
      };
    }).sort((a, b) => b.progressPercent - a.progressPercent);
  }
}

export interface AdminSubmissionItem {
  userId: string;
  userName: string;
  userEmail: string;
  userTelegram?: string;
  userCreatedAt?: string;
  userAccessOpenedAt?: string;
  lessonId: 1 | 2 | 3;
  hwUrl: string;
  hwStatus: HomeworkStatus;
  hwSubmittedAt: string;
  hwComment?: string;
}

export async function getAdminSubmissions(): Promise<AdminSubmissionItem[]> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers().filter(u => u.role === 'student');
    const progressList = getLocalProgress();
    const items: AdminSubmissionItem[] = [];

    users.forEach(user => {
      const prog = progressList.find(p => p.userId === user.id);
      if (!prog) return;

      ([1, 2, 3] as const).forEach(lessonId => {
        const lesson = prog.lessons[lessonId];
        if (lesson && lesson.hwSubmitted && lesson.hwUrl) {
          items.push({
            userId: user.id,
            userName: user.name,
            userEmail: user.email || '',
            userTelegram: user.telegram,
            userCreatedAt: user.created_at,
            userAccessOpenedAt: user.access_opened_at,
            lessonId,
            hwUrl: lesson.hwUrl,
            hwStatus: lesson.hwStatus,
            hwSubmittedAt: lesson.hwSubmittedAt || new Date().toISOString(),
            hwComment: lesson.hwComment
          });
        }
      });
    });

    return items.sort((a, b) => new Date(b.hwSubmittedAt).getTime() - new Date(a.hwSubmittedAt).getTime());
  } else {
    const { data: users, error: uErr } = await supabase!
      .from('minicourse_users')
      .select('id, name, email, telegram, created_at, access_opened_at')
      .eq('role', 'student');
    
    if (uErr) throw uErr;

    const { data: progress, error: pErr } = await supabase!
      .from('minicourse_progress')
      .select('user_id, lessons');
    
    if (pErr) throw pErr;

    const items: AdminSubmissionItem[] = [];
    users.forEach(u => {
      const prog = progress.find(p => p.user_id === u.id);
      if (!prog || !prog.lessons) return;

      ([1, 2, 3] as const).forEach(lessonId => {
        const lesson = prog.lessons[lessonId] as LessonProgress | undefined;
        if (lesson && lesson.hwSubmitted && lesson.hwUrl) {
          items.push({
            userId: u.id,
            userName: u.name,
            userEmail: u.email || '',
            userTelegram: u.telegram || undefined,
            userCreatedAt: u.created_at,
            userAccessOpenedAt: u.access_opened_at,
            lessonId,
            hwUrl: lesson.hwUrl,
            hwStatus: lesson.hwStatus,
            hwSubmittedAt: lesson.hwSubmittedAt || new Date().toISOString(),
            hwComment: lesson.hwComment
          });
        }
      });
    });

    return items.sort((a, b) => new Date(b.hwSubmittedAt).getTime() - new Date(a.hwSubmittedAt).getTime());
  }
}

export async function saveHomeworkReview(userId: string, lessonId: 1 | 2 | 3, status: HomeworkStatus, comment: string): Promise<MinicourseProgress> {
  const updates: Partial<LessonProgress> = {
    hwStatus: status,
    hwComment: comment
  };

  // If homework is approved, unlock the NEXT lesson!
  const progress = await getProgress(userId);
  if (!progress) throw new Error("Progress record not found");

  const nextLessonId = (lessonId + 1) as 2 | 3;
  
  if (status === 'accepted') {
    // Unlock next lesson
    if (lessonId < 3) {
      await updateProgress(userId, nextLessonId, { unlocked: true });
    }
  }

  return await updateProgress(userId, lessonId, updates);
}

export async function deleteStudentUser(userId: string): Promise<boolean> {
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const progressList = getLocalProgress();

    const filteredUsers = users.filter(u => u.id !== userId);
    const filteredProgress = progressList.filter(p => p.userId !== userId);

    saveLocalUsers(filteredUsers);
    saveLocalProgress(filteredProgress);
    return true;
  } else {
    // 1. Delete progress
    const { error: pErr } = await supabase!
      .from('minicourse_progress')
      .delete()
      .eq('user_id', userId);
    if (pErr) throw pErr;

    // 2. Delete user
    const { error: uErr } = await supabase!
      .from('minicourse_users')
      .delete()
      .eq('id', userId);
    if (uErr) throw uErr;

    return true;
  }
}

export async function getLessonsConfig(): Promise<MinicourseLessonConfig[]> {
  if (IS_MOCK_MODE) {
    return getLocalLessonsConfig();
  } else {
    const { data, error } = await supabase!
      .from('minicourse_lessons_config')
      .select('*')
      .order('lesson_id', { ascending: true });

    if (error) {
      console.warn("Error fetching minicourse_lessons_config:", error);
      return getLocalLessonsConfig();
    }

    if (!data || data.length === 0) {
      return [];
    }

    return data.map(item => ({
      lesson_id: item.lesson_id,
      title: item.title,
      description: item.description,
      youtube_id: item.youtube_id,
      youtube_id_new: item.youtube_id_new,
      links: Array.isArray(item.links) ? item.links : [],
      description_under_video: item.description_under_video || item.hw_instructions || '',
      hw_instructions: item.description_under_video || item.hw_instructions || '',
      sort_order: item.sort_order || item.lesson_id,
      mindmap_url: item.mindmap_url,
      hw_spreadsheet_url: item.hw_spreadsheet_url,
      notion_url: item.notion_url,
      bonus_video_title: item.bonus_video_title,
      bonus_video_youtube_id: item.bonus_video_youtube_id,
      bonus_video_youtube_id_new: item.bonus_video_youtube_id_new,
      updated_at: item.updated_at
    }));
  }
}

export async function saveAllLessonsConfig(configs: MinicourseLessonConfig[]): Promise<MinicourseLessonConfig[]> {
  if (IS_MOCK_MODE) {
    saveLocalLessonsConfig(configs);
    return configs;
  } else {
    // 1. Get existing IDs in database
    const { data: existing } = await supabase!
      .from('minicourse_lessons_config')
      .select('lesson_id');
    
    const existingIds = (existing || []).map(r => r.lesson_id);
    const newIds = configs.map(c => c.lesson_id);
    const idsToDelete = existingIds.filter(id => !newIds.includes(id));

    if (idsToDelete.length > 0) {
      await supabase!
        .from('minicourse_lessons_config')
        .delete()
        .in('lesson_id', idsToDelete);
    }

    if (configs.length > 0) {
      const rows = configs.map(c => ({
        lesson_id: c.lesson_id,
        title: c.title,
        description: c.description || '',
        youtube_id: extractYouTubeId(c.youtube_id || c.youtube_url || ''),
        youtube_id_new: c.youtube_id_new || null,
        links: c.links || [],
        description_under_video: c.description_under_video || '',
        hw_instructions: c.description_under_video || '',
        sort_order: c.sort_order || c.lesson_id,
        updated_at: new Date().toISOString()
      }));

      const { data, error } = await supabase!
        .from('minicourse_lessons_config')
        .upsert(rows, { onConflict: 'lesson_id' })
        .select();

      if (error) throw error;
    }

    saveLocalLessonsConfig(configs);
    return configs;
  }
}

export async function deleteLessonConfig(lessonId: number): Promise<void> {
  if (IS_MOCK_MODE) {
    const configs = getLocalLessonsConfig().filter(c => c.lesson_id !== lessonId);
    saveLocalLessonsConfig(configs);
  } else {
    const { error } = await supabase!
      .from('minicourse_lessons_config')
      .delete()
      .eq('lesson_id', lessonId);
    if (error) throw error;

    const configs = getLocalLessonsConfig().filter(c => c.lesson_id !== lessonId);
    saveLocalLessonsConfig(configs);
  }
}

export async function updateLessonConfig(lessonId: number, updates: Partial<MinicourseLessonConfig>): Promise<MinicourseLessonConfig> {
  if (IS_MOCK_MODE) {
    const config = getLocalLessonsConfig();
    const idx = config.findIndex(c => c.lesson_id === lessonId);
    if (idx === -1) throw new Error("Lesson config not found");

    const updated = {
      ...config[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    config[idx] = updated;
    saveLocalLessonsConfig(config);
    return updated;
  } else {
    const cleanUpdates: any = { ...updates, updated_at: new Date().toISOString() };
    if (updates.youtube_id || updates.youtube_url) {
      cleanUpdates.youtube_id = extractYouTubeId(updates.youtube_id || updates.youtube_url || '');
    }
    if (updates.description_under_video !== undefined) {
      cleanUpdates.hw_instructions = updates.description_under_video;
    }

    const { data, error } = await supabase!
      .from('minicourse_lessons_config')
      .upsert({
        lesson_id: lessonId,
        ...cleanUpdates
      }, { onConflict: 'lesson_id' })
      .select()
      .single();

    if (error) throw error;
    return data as any as MinicourseLessonConfig;
  }
}

export function calculateSyncedProgress(user: MinicourseUser, progress: MinicourseProgress): MinicourseProgress {
  if (user.role !== 'student') return progress;

  const accessStart = user.access_opened_at || user.created_at;
  if (!accessStart) return progress;

  const now = Date.now();
  const accessStartMs = new Date(accessStart).getTime();
  const elapsedMsSinceAccess = now - accessStartMs;
  const elapsedDaysSinceAccess = elapsedMsSinceAccess / (1000 * 60 * 60 * 24);

  const syncedLessons = {
    1: { ...progress.lessons[1] },
    2: { ...progress.lessons[2] },
    3: { ...progress.lessons[3] }
  };

  // Lesson 2 Unlock Conditions:
  // - Lesson 1 Homework accepted
  // - OR 24 hours have passed since Lesson 1 opened
  // - OR 2 days have passed since access start
  const lesson1 = syncedLessons[1];
  const lesson2 = syncedLessons[2];
  if (lesson2 && !lesson2.unlocked) {
    const isL1HwAccepted = lesson1.hwStatus === 'accepted';
    const isL1Opened24h = lesson1.openedAt && (now - new Date(lesson1.openedAt).getTime() >= 24 * 3600 * 1000);
    const isAccess2Days = elapsedDaysSinceAccess >= 2;

    if (isL1HwAccepted || isL1Opened24h || isAccess2Days) {
      lesson2.unlocked = true;
      if (!lesson1.hwSubmitted && lesson1.hwStatus === 'not_started' && isL1Opened24h) {
        lesson1.hwStatus = 'expired_not_submitted';
      }
    }
  }

  // Lesson 3 Unlock Conditions:
  // - Lesson 2 Homework accepted
  // - OR 24 hours have passed since Lesson 2 opened
  // - OR 4 days have passed since access start
  const lesson3 = syncedLessons[3];
  if (lesson3 && !lesson3.unlocked) {
    const isL2HwAccepted = lesson2.hwStatus === 'accepted';
    const isL2Opened24h = lesson2.openedAt && (now - new Date(lesson2.openedAt).getTime() >= 24 * 3600 * 1000);
    const isAccess4Days = elapsedDaysSinceAccess >= 4;

    if (isL2HwAccepted || isL2Opened24h || isAccess4Days) {
      lesson3.unlocked = true;
      if (!lesson2.hwSubmitted && lesson2.hwStatus === 'not_started' && isL2Opened24h) {
        lesson2.hwStatus = 'expired_not_submitted';
      }
    }
  }

  // Check Lesson 3 opened time expiration
  if (lesson3 && lesson3.unlocked && !lesson3.hwSubmitted && lesson3.hwStatus === 'not_started') {
    const isL3Opened24h = lesson3.openedAt && (now - new Date(lesson3.openedAt).getTime() >= 24 * 3600 * 1000);
    if (isL3Opened24h) {
      lesson3.hwStatus = 'expired_not_submitted';
    }
  }

  return {
    ...progress,
    lessons: syncedLessons,
    progressPercent: calculateProgressPercent(syncedLessons)
  };
}

export async function syncProgressStates(userId: string, user?: MinicourseUser): Promise<MinicourseProgress | null> {
  let activeUser: MinicourseUser | null | undefined = user;
  if (!activeUser) {
    activeUser = await getProfile(userId);
  }
  if (!activeUser || activeUser.role !== 'student') {
    return await getProgress(userId);
  }

  const progress = await getProgress(userId);
  if (!progress) return null;

  const synced = calculateSyncedProgress(activeUser, progress);
  const changed = JSON.stringify(progress.lessons) !== JSON.stringify(synced.lessons);

  if (changed) {
    if (IS_MOCK_MODE) {
      const progressList = getLocalProgress();
      const idx = progressList.findIndex(p => p.userId === userId);
      if (idx !== -1) {
        progressList[idx].lessons = synced.lessons;
        progressList[idx].progressPercent = synced.progressPercent;
        progressList[idx].updatedAt = new Date().toISOString();
        saveLocalProgress(progressList);
      }
      return progressList.find(p => p.userId === userId) || null;
    } else {
      const { data, error } = await supabase!
        .from('minicourse_progress')
        .update({
          lessons: synced.lessons,
          progress_percent: synced.progressPercent,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        userId: data.user_id,
        progressPercent: data.progress_percent,
        lessons: data.lessons,
        updatedAt: data.updated_at
      };
    }
  }

  return progress;
}

export async function getAllStudentsWithProgress(): Promise<StudentWithProgress[]> {
  const defaultLessons = {
    1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' as HomeworkStatus },
    2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' as HomeworkStatus },
    3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' as HomeworkStatus }
  };

  if (IS_MOCK_MODE) {
    const users = getLocalUsers().filter(u => u.role === 'student');
    const progressList = getLocalProgress();
    return users.map(user => {
      const prog = progressList.find(p => p.userId === user.id);
      return {
        ...user,
        progress: prog 
          ? calculateSyncedProgress(user, prog) 
          : calculateSyncedProgress(user, {
              id: 'temp-' + user.id,
              userId: user.id,
              progressPercent: 0,
              lessons: defaultLessons,
              updatedAt: user.created_at
            })
      };
    });
  } else {
    const { data: users, error: uErr } = await supabase!
      .from('minicourse_users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (uErr) throw uErr;

    const { data: progress, error: pErr } = await supabase!
      .from('minicourse_progress')
      .select('*');

    if (pErr) throw pErr;

    return users.map(u => {
      const prog = progress.find(p => p.user_id === u.id);
      let appProgress: MinicourseProgress | undefined = undefined;
      if (prog) {
        appProgress = calculateSyncedProgress(u as MinicourseUser, {
          id: prog.id,
          userId: prog.user_id,
          progressPercent: prog.progress_percent,
          lessons: prog.lessons,
          updatedAt: prog.updated_at
        });
      } else {
        appProgress = calculateSyncedProgress(u as MinicourseUser, {
          id: 'temp-' + u.id,
          userId: u.id,
          progressPercent: 0,
          lessons: defaultLessons,
          updatedAt: u.created_at
        });
      }

      return {
        ...u,
        progress: appProgress
      };
    });
  }
}

export async function getAllStudents(): Promise<MinicourseUser[]> {
  if (IS_MOCK_MODE) {
    return getLocalUsers().filter(u => u.role === 'student');
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as MinicourseUser[];
  }
}

export async function toggleUserLockout(userId: string, shouldBlock: boolean): Promise<MinicourseUser> {
  const newStatus = shouldBlock ? 'under_investigation' : 'active';
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");

    users[idx].status = newStatus;
    if (!shouldBlock) {
      users[idx].device_uuids = []; // Reset device list when unblocking
    }
    saveLocalUsers(users);
    return users[idx];
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .update({
        status: newStatus,
        device_uuids: shouldBlock ? undefined : [] // Reset devices when unblocking
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as MinicourseUser;
  }
}

export async function uploadHomeworkFile(file: File, userId: string, lessonId: number): Promise<string> {
  if (IS_MOCK_MODE) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/lesson-${lessonId}-${Date.now()}.${fileExt}`;
  const bucketName = 'homeworks';

  try {
    await supabase!.storage.createBucket(bucketName, { public: true });
  } catch (err) {
    // Ignore error if already exists
  }

  const { data, error } = await supabase!.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Supabase upload error, falling back to base64:', error);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const { data: { publicUrl } } = supabase!.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return publicUrl;
}

export async function acceptTerms(userId: string): Promise<MinicourseUser> {
  const nowStr = new Date().toISOString();
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("User not found");
    users[idx].terms_accepted = true;
    users[idx].access_opened_at = nowStr;
    saveLocalUsers(users);
    return users[idx];
  } else {
    const { data, error } = await supabase!
      .from('minicourse_users')
      .update({
        terms_accepted: true,
        access_opened_at: nowStr
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as MinicourseUser;
  }
}

// ----------------------------------------------------
// Student Access Management & Extension
// ----------------------------------------------------

export async function extendStudentAccess(
  userId: string,
  lessonsOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  homeworkOption: 'none' | 'reset' | 'extend7' | 'unlimited' | 'custom',
  customLessonsDays?: number,
  customHomeworkDays?: number
): Promise<MinicourseUser> {
  const user = await getProfile(userId);
  if (!user) throw new Error("Користувача не знайдено");

  const now = new Date();
  let newAccessOpenedAt = user.access_opened_at || user.created_at;
  let newHwAccessOpenedAt = user.homework_access_opened_at || user.access_opened_at || user.created_at;

  // 1. Process Lessons Option
  if (lessonsOption === 'reset') {
    newAccessOpenedAt = now.toISOString();
  } else if (lessonsOption === 'extend7') {
    const currentStart = new Date(newAccessOpenedAt).getTime();
    const elapsed = Date.now() - currentStart;
    const elapsedDays = elapsed / (1000 * 60 * 60 * 24);
    if (elapsedDays > 14) {
      // Already expired, set access_opened_at to (now - 7 days) so they have exactly 7 days remaining out of 14
      const d = new Date();
      d.setDate(d.getDate() - 7);
      newAccessOpenedAt = d.toISOString();
    } else {
      // Not expired, add 7 days to their total time (shifting access start forward)
      const d = new Date(currentStart);
      d.setDate(d.getDate() + 7);
      newAccessOpenedAt = d.toISOString();
    }
  } else if (lessonsOption === 'unlimited') {
    newAccessOpenedAt = '3000-01-01T00:00:00.000Z';
  } else if (lessonsOption === 'custom' && customLessonsDays !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() - (14 - customLessonsDays));
    newAccessOpenedAt = d.toISOString();
  }

  // 2. Process Homework Option
  if (homeworkOption === 'reset') {
    newHwAccessOpenedAt = now.toISOString();
  } else if (homeworkOption === 'extend7') {
    const currentStart = new Date(newHwAccessOpenedAt).getTime();
    const elapsed = Date.now() - currentStart;
    const elapsedDays = elapsed / (1000 * 60 * 60 * 24);
    if (elapsedDays > 7) {
      // Already expired, reset start to now so they get exactly 7 days from now
      newHwAccessOpenedAt = now.toISOString();
    } else {
      // Not expired, add 7 days
      const d = new Date(currentStart);
      d.setDate(d.getDate() + 7);
      newHwAccessOpenedAt = d.toISOString();
    }
  } else if (homeworkOption === 'unlimited') {
    newHwAccessOpenedAt = '3000-01-01T00:00:00.000Z';
  } else if (homeworkOption === 'custom' && customHomeworkDays !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() - (7 - customHomeworkDays));
    newHwAccessOpenedAt = d.toISOString();
  }

  // 3. If homework access is extended, automatically reset "expired_not_submitted" statuses
  if (homeworkOption !== 'none') {
    const prog = await getProgress(userId);
    if (prog && prog.lessons) {
      let changed = false;
      const updatedLessons = { ...prog.lessons };
      for (const lessonId of [1, 2, 3]) {
        const lesson = updatedLessons[lessonId as 1 | 2 | 3];
        if (lesson && lesson.hwStatus === 'expired_not_submitted') {
          lesson.hwStatus = 'not_started';
          delete lesson.openedAt; // Allows fresh 24h timer on open
          changed = true;
        }
      }
      if (changed) {
        if (IS_MOCK_MODE) {
          const progressList = getLocalProgress();
          const pIdx = progressList.findIndex(p => p.userId === userId);
          if (pIdx !== -1) {
            progressList[pIdx].lessons = updatedLessons;
            saveLocalProgress(progressList);
          }
        } else {
          await supabase!
            .from('minicourse_progress')
            .update({ lessons: updatedLessons })
            .eq('user_id', userId);
        }
      }
    }
  }

  // 4. Save User Dates
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error("Користувача не знайдено");

    if (lessonsOption !== 'none') {
      users[idx].access_opened_at = newAccessOpenedAt;
    }
    if (homeworkOption !== 'none') {
      users[idx].homework_access_opened_at = newHwAccessOpenedAt;
    }
    saveLocalUsers(users);
    return users[idx];
  } else {
    const updates: any = {};
    if (lessonsOption !== 'none') {
      updates.access_opened_at = newAccessOpenedAt;
    }
    if (homeworkOption !== 'none') {
      updates.homework_access_opened_at = newHwAccessOpenedAt;
    }

    const { data, error } = await supabase!
      .from('minicourse_users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as MinicourseUser;
  }
}

// ----------------------------------------------------
// Prize Link Management (Contest Winners)
// ----------------------------------------------------

function getLocalPrizeCodes(): MinicoursePrizeCode[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('minicourse_prize_codes');
  if (!data) return [];
  try {
    return JSON.parse(data) as MinicoursePrizeCode[];
  } catch {
    return [];
  }
}

function saveLocalPrizeCodes(codes: MinicoursePrizeCode[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('minicourse_prize_codes', JSON.stringify(codes));
  }
}

export async function createPrizeCode(description: string, createdBy: string): Promise<MinicoursePrizeCode> {
  const code = 'prize-' + Math.random().toString(36).substr(2, 4) + '-' + Math.random().toString(36).substr(2, 4);
  const now = new Date().toISOString();

  const newCode: MinicoursePrizeCode = {
    code,
    description,
    created_by: createdBy,
    created_at: now,
    status: 'active'
  };

  if (IS_MOCK_MODE) {
    const list = getLocalPrizeCodes();
    list.push(newCode);
    saveLocalPrizeCodes(list);
    return newCode;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_prize_codes')
      .insert({
        code,
        description,
        created_by: createdBy
      })
      .select()
      .single();

    if (error) throw error;
    return data as MinicoursePrizeCode;
  }
}

export async function getPrizeCodes(): Promise<MinicoursePrizeCode[]> {
  if (IS_MOCK_MODE) {
    const codes = getLocalPrizeCodes();
    const users = getLocalUsers();
    return codes.map(c => {
      if (c.used_by_id) {
        const u = users.find(usr => usr.id === c.used_by_id);
        if (u) {
          return {
            ...c,
            used_by_name: u.name,
            used_by_telegram: u.telegram
          };
        }
      }
      return c;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  } else {
    // Join used_by details from minicourse_users
    const { data, error } = await supabase!
      .from('minicourse_prize_codes')
      .select(`
        *,
        minicourse_users(name, telegram)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(row => {
      const u = row.minicourse_users;
      return {
        code: row.code,
        description: row.description,
        created_by: row.created_by,
        created_at: row.created_at,
        used_at: row.used_at,
        used_by_id: row.used_by_id,
        status: row.status,
        used_by_name: u?.name || undefined,
        used_by_telegram: u?.telegram || undefined
      } as MinicoursePrizeCode;
    });
  }
}

export async function cancelPrizeCode(code: string): Promise<void> {
  if (IS_MOCK_MODE) {
    const list = getLocalPrizeCodes();
    const idx = list.findIndex(c => c.code === code);
    if (idx !== -1) {
      list[idx].status = 'cancelled';
      saveLocalPrizeCodes(list);
    }
  } else {
    const { error } = await supabase!
      .from('minicourse_prize_codes')
      .update({ status: 'cancelled' })
      .eq('code', code);

    if (error) throw error;
  }
}

export async function verifyPrizeCode(code: string): Promise<MinicoursePrizeCode> {
  if (IS_MOCK_MODE) {
    const list = getLocalPrizeCodes();
    const item = list.find(c => c.code === code);
    if (!item) throw new Error("Код виграшу не знайдено");
    if (item.status !== 'active') throw new Error("Код виграшу більше недійсний або вже використаний");
    return item;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_prize_codes')
      .select('*')
      .eq('code', code)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error("Код виграшу не знайдено");
    if (data.status !== 'active') throw new Error("Код виграшу більше недійсний або вже використаний");
    return data as MinicoursePrizeCode;
  }
}

export async function claimPrizeCode(
  code: string,
  name: string,
  telegram: string,
  phone?: string
): Promise<{ user: MinicourseUser; progress: MinicourseProgress }> {
  // 1. Verify prize code first
  const pCode = await verifyPrizeCode(code);

  const normInput = telegram.replace(/^@/, '').trim().toLowerCase();
  const digitsOnly = phone ? phone.replace(/\D/g, '') : '';
  const now = new Date();

  const defaultLessons: MinicourseProgress['lessons'] = {
    1: { unlocked: true, hwSubmitted: false, hwStatus: 'not_started' },
    2: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' },
    3: { unlocked: false, hwSubmitted: false, hwStatus: 'not_started' }
  };

  let targetUser: MinicourseUser | null = null;
  let targetProgress: MinicourseProgress | null = null;

  // 2. Check if user already exists
  if (IS_MOCK_MODE) {
    const users = getLocalUsers();
    let existingUser = users.find(u => 
      (u.telegram && u.telegram.toLowerCase() === normInput) ||
      (digitsOnly && u.phone && u.phone.replace(/\D/g, '') === digitsOnly)
    );

    if (existingUser) {
      // Update existing student access
      existingUser.is_paid = true;
      existingUser.payment_status = 'paid';
      existingUser.access_opened_at = now.toISOString();
      existingUser.homework_access_opened_at = now.toISOString();
      existingUser.name = name;
      if (phone) existingUser.phone = phone;
      targetUser = existingUser;

      // Update progress lessons
      const progressList = getLocalProgress();
      let prog = progressList.find(p => p.userId === existingUser.id);
      if (prog) {
        // Reset any expired status back to not_started
        const updatedLessons = { ...prog.lessons };
        for (const lId of [1, 2, 3]) {
          const l = updatedLessons[lId as 1 | 2 | 3];
          if (l && l.hwStatus === 'expired_not_submitted') {
            l.hwStatus = 'not_started';
            delete l.openedAt;
          }
        }
        prog.lessons = updatedLessons;
        prog.updatedAt = now.toISOString();
        targetProgress = prog;
      } else {
        // Create new progress if not found
        const newProg = {
          id: 'p-' + Math.random().toString(36).substr(2, 9),
          userId: existingUser.id,
          progressPercent: 0,
          lessons: defaultLessons,
          updatedAt: now.toISOString()
        };
        progressList.push(newProg);
        targetProgress = newProg;
      }
      saveLocalProgress(progressList);
    } else {
      // Register new user
      const newUser: MinicourseUser = {
        id: 'u-' + Math.random().toString(36).substr(2, 9),
        name,
        telegram: normInput,
        phone: phone || undefined,
        role: 'student',
        is_paid: true,
        payment_status: 'paid',
        device_uuids: [],
        status: 'active',
        created_at: now.toISOString(),
        access_opened_at: now.toISOString(),
        homework_access_opened_at: now.toISOString()
      };
      users.push(newUser);
      targetUser = newUser;

      const progressList = getLocalProgress();
      const newProg = {
        id: 'p-' + Math.random().toString(36).substr(2, 9),
        userId: newUser.id,
        progressPercent: 0,
        lessons: defaultLessons,
        updatedAt: now.toISOString()
      };
      progressList.push(newProg);
      targetProgress = newProg;

      saveLocalProgress(progressList);
    }
    saveLocalUsers(users);

    // Redeem prize code
    const codes = getLocalPrizeCodes();
    const cIdx = codes.findIndex(c => c.code === code);
    if (cIdx !== -1) {
      codes[cIdx].status = 'used';
      codes[cIdx].used_at = now.toISOString();
      codes[cIdx].used_by_id = targetUser.id;
      saveLocalPrizeCodes(codes);
    }
  } else {
    // live mode
    let queryFilter = `telegram.ilike.${normInput}`;
    if (digitsOnly) {
      queryFilter += `,phone.eq.${digitsOnly}`;
    }

    let { data: users, error: fetchErr } = await supabase!
      .from('minicourse_users')
      .select('*')
      .or(queryFilter);

    if (fetchErr) throw fetchErr;

    if (users && users.length > 0) {
      const existingUser = users[0];
      
      const { data: updatedUsr, error: updateUsrErr } = await supabase!
        .from('minicourse_users')
        .update({
          is_paid: true,
          payment_status: 'paid',
          access_opened_at: now.toISOString(),
          homework_access_opened_at: now.toISOString(),
          name,
          phone: phone || existingUser.phone
        })
        .eq('id', existingUser.id)
        .select()
        .single();

      if (updateUsrErr) throw updateUsrErr;
      targetUser = updatedUsr as MinicourseUser;

      // Update progress lessons
      let { data: prog, error: progErr } = await supabase!
        .from('minicourse_progress')
        .select('*')
        .eq('user_id', existingUser.id)
        .maybeSingle();

      if (progErr) throw progErr;

      if (prog) {
        const updatedLessons = { ...prog.lessons };
        for (const lId of [1, 2, 3]) {
          const l = updatedLessons[lId as 1 | 2 | 3];
          if (l && l.hwStatus === 'expired_not_submitted') {
            l.hwStatus = 'not_started';
            delete l.openedAt;
          }
        }

        const { data: newProg, error: updateProgErr } = await supabase!
          .from('minicourse_progress')
          .update({
            lessons: updatedLessons,
            updated_at: now.toISOString()
          })
          .eq('id', prog.id)
          .select()
          .single();

        if (updateProgErr) throw updateProgErr;
        targetProgress = {
          id: newProg.id,
          userId: newProg.user_id,
          progressPercent: newProg.progress_percent,
          lessons: newProg.lessons,
          updatedAt: newProg.updated_at
        };
      } else {
        const { data: newProg, error: createProgErr } = await supabase!
          .from('minicourse_progress')
          .insert({
            user_id: existingUser.id,
            progress_percent: 0,
            lessons: defaultLessons
          })
          .select()
          .single();

        if (createProgErr) throw createProgErr;
        targetProgress = {
          id: newProg.id,
          userId: newProg.user_id,
          progressPercent: newProg.progress_percent,
          lessons: newProg.lessons,
          updatedAt: newProg.updated_at
        };
      }
    } else {
      // Create user
      const { data: newUser, error: createUsrErr } = await supabase!
        .from('minicourse_users')
        .insert({
          name,
          telegram: normInput,
          phone: phone || null,
          role: 'student',
          is_paid: true,
          payment_status: 'paid',
          device_uuids: [],
          status: 'active',
          access_opened_at: now.toISOString(),
          homework_access_opened_at: now.toISOString()
        })
        .select()
        .single();

      if (createUsrErr) throw createUsrErr;
      targetUser = newUser as MinicourseUser;

      // Create progress
      const { data: newProg, error: createProgErr } = await supabase!
        .from('minicourse_progress')
        .insert({
          user_id: newUser.id,
          progress_percent: 0,
          lessons: defaultLessons
        })
        .select()
        .single();

      if (createProgErr) throw createProgErr;
      targetProgress = {
        id: newProg.id,
        userId: newProg.user_id,
        progressPercent: newProg.progress_percent,
        lessons: newProg.lessons,
        updatedAt: newProg.updated_at
      };
    }

    // Redeem prize code
    const { error: codeErr } = await supabase!
      .from('minicourse_prize_codes')
      .update({
        status: 'used',
        used_at: now.toISOString(),
        used_by_id: targetUser.id
      })
      .eq('code', code);

    if (codeErr) throw codeErr;
  }

  return {
    user: targetUser,
    progress: targetProgress!
  };
}

export interface GiftTokenItem {
  token: string;
  created_at: string;
  is_used: boolean;
  used_by_chat_id: number | null;
  used_at: string | null;
}

export async function getGiftTokens(): Promise<GiftTokenItem[]> {
  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('minicourse_gift_tokens') || '[]');
  } else {
    const { data, error } = await supabase!
      .from('minicourse_gift_tokens')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as GiftTokenItem[];
  }
}

export async function generateGiftToken(): Promise<GiftTokenItem> {
  const randPart = Math.random().toString(36).substring(2, 10).toUpperCase();
  const token = `GIFT-${randPart}`;
  
  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') {
      return { token, created_at: new Date().toISOString(), is_used: false, used_by_chat_id: null, used_at: null };
    }
    const tokens = JSON.parse(localStorage.getItem('minicourse_gift_tokens') || '[]');
    const newItem = { token, created_at: new Date().toISOString(), is_used: false, used_by_chat_id: null, used_at: null };
    tokens.unshift(newItem);
    localStorage.setItem('minicourse_gift_tokens', JSON.stringify(tokens));
    return newItem;
  } else {
    const { data, error } = await supabase!
      .from('minicourse_gift_tokens')
      .insert({ token })
      .select()
      .single();

    if (error) throw error;
    return data as GiftTokenItem;
  }
}

// ----------------------------------------------------
// BOT MESSAGE TEMPLATES & BROADCASTS
// ----------------------------------------------------

export function normalizeMessageText(text: string): string {
  if (!text) return '';
  return text.replace(/\\n/g, '\n');
}

export async function getBotTemplates(): Promise<BotMessageTemplate[]> {
  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') return [];
    const raw = JSON.parse(localStorage.getItem('minicourse_bot_templates') || '[]');
    return raw.map((t: any) => ({ ...t, message_text: normalizeMessageText(t.message_text) }));
  }

  // 1. Fetch saved templates from database
  const { data: dbTemplates, error } = await supabase!
    .from('minicourse_bot_templates')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Error loading bot templates:', error);
  }

  const list: BotMessageTemplate[] = (dbTemplates || []).map(t => ({
    id: t.id,
    event_key: t.event_key,
    lesson_id: t.lesson_id,
    title: t.title,
    description: t.description || '',
    message_text: normalizeMessageText(t.message_text),
    buttons: Array.isArray(t.buttons) ? t.buttons : [],
    is_enabled: t.is_enabled ?? true,
    sort_order: t.sort_order || 1,
    updated_at: t.updated_at
  }));

  // 2. Fetch lessons config to dynamically add lesson_unlocked events for all active lessons
  try {
    const lessons = await getLessonsConfig();
    lessons.forEach((l) => {
      const lessonTemplateId = `lesson_unlocked_${l.lesson_id}`;
      const exists = list.some(item => item.id === lessonTemplateId);
      if (!exists) {
        list.push({
          id: lessonTemplateId,
          event_key: 'lesson_unlocked',
          lesson_id: l.lesson_id,
          title: `Урок ${l.lesson_id}: Відкрито доступ до уроку`,
          description: `Надсилається учню, коли стає доступним Урок ${l.lesson_id}`,
          message_text: `🔓 *Відкрито новий урок!*\n\nВам став доступний новий навчальний модуль:\n*Урок ${l.lesson_id}: ${l.title || ''}*\n\nШвидше переглядайте відео та робіть практичні кроки! 🚀`,
          buttons: [
            { text: `👉 Відкрити Урок ${l.lesson_id}`, url_type: 'autologin_lesson', custom_url: '' }
          ],
          is_enabled: true,
          sort_order: 10 + l.lesson_id
        });
      }
    });
  } catch (err) {
    console.error('Error integrating lesson configs into bot templates:', err);
  }

  return list.sort((a, b) => a.sort_order - b.sort_order);
}

export async function saveBotTemplate(template: BotMessageTemplate): Promise<void> {
  const cleanText = normalizeMessageText(template.message_text);

  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') return;
    const templates = JSON.parse(localStorage.getItem('minicourse_bot_templates') || '[]');
    const idx = templates.findIndex((t: BotMessageTemplate) => t.id === template.id);
    const updated = { ...template, message_text: cleanText };
    if (idx >= 0) {
      templates[idx] = updated;
    } else {
      templates.push(updated);
    }
    localStorage.setItem('minicourse_bot_templates', JSON.stringify(templates));
    return;
  }

  const { error } = await supabase!
    .from('minicourse_bot_templates')
    .upsert({
      id: template.id,
      event_key: template.event_key,
      lesson_id: template.lesson_id || null,
      title: template.title,
      description: template.description || null,
      message_text: cleanText,
      buttons: template.buttons,
      is_enabled: template.is_enabled,
      sort_order: template.sort_order,
      updated_at: new Date().toISOString()
    });

  if (error) throw error;
}

export async function deleteBotTemplate(templateId: string): Promise<void> {
  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') return;
    const templates = JSON.parse(localStorage.getItem('minicourse_bot_templates') || '[]');
    const filtered = templates.filter((t: BotMessageTemplate) => t.id !== templateId);
    localStorage.setItem('minicourse_bot_templates', JSON.stringify(filtered));
    return;
  }

  const { error } = await supabase!
    .from('minicourse_bot_templates')
    .delete()
    .eq('id', templateId);

  if (error) throw error;
}

export async function getBroadcasts(): Promise<BotBroadcast[]> {
  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') return [];
    const raw = JSON.parse(localStorage.getItem('minicourse_broadcasts') || '[]');
    return raw.map((b: any) => ({ ...b, message_text: normalizeMessageText(b.message_text) }));
  }

  const { data, error } = await supabase!
    .from('minicourse_broadcasts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching broadcasts:', error);
    return [];
  }
  return (data || []).map(b => ({ ...b, message_text: normalizeMessageText(b.message_text) })) as BotBroadcast[];
}

export async function saveBroadcastRecord(broadcast: Omit<BotBroadcast, 'id' | 'created_at'>): Promise<BotBroadcast> {
  const cleanText = normalizeMessageText(broadcast.message_text);

  if (IS_MOCK_MODE) {
    const item: BotBroadcast = {
      id: Math.random().toString(36).substr(2, 9),
      created_at: new Date().toISOString(),
      ...broadcast,
      message_text: cleanText
    };
    if (typeof window !== 'undefined') {
      const items = JSON.parse(localStorage.getItem('minicourse_broadcasts') || '[]');
      items.unshift(item);
      localStorage.setItem('minicourse_broadcasts', JSON.stringify(items));
    }
    return item;
  }

  const { data, error } = await supabase!
    .from('minicourse_broadcasts')
    .insert({
      message_text: cleanText,
      button_text: broadcast.button_text || null,
      button_url: broadcast.button_url || null,
      target_audience: broadcast.target_audience || 'all',
      total_recipients: broadcast.total_recipients,
      sent_count: broadcast.sent_count,
      failed_count: broadcast.failed_count,
      status: broadcast.status,
      created_by: broadcast.created_by || 'admin'
    })
    .select()
    .single();

  if (error) throw error;
  return data as BotBroadcast;
}

// ----------------------------------------------------
// BOT CONFIGURATION & WEBHOOK INTEGRATION
// ----------------------------------------------------

export async function getBotConfig(): Promise<BotConfig> {
  const envToken = process.env.TELEGRAM_BOT_TOKEN || '';

  if (IS_MOCK_MODE) {
    if (typeof window === 'undefined') {
      return { id: 'default', is_connected: !!envToken, bot_token: envToken };
    }
    const saved = localStorage.getItem('minicourse_bot_config');
    if (saved) return JSON.parse(saved);
    return { id: 'default', is_connected: !!envToken, bot_token: envToken };
  }

  const { data, error } = await supabase!
    .from('minicourse_bot_config')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  if (error) {
    console.error('Error fetching bot config:', error);
  }

  if (data) {
    return {
      id: data.id,
      bot_token: data.bot_token || envToken,
      bot_username: data.bot_username,
      bot_name: data.bot_name,
      bot_photo_url: data.bot_photo_url,
      webhook_url: data.webhook_url,
      is_connected: data.is_connected ?? (!!data.bot_token || !!envToken),
      updated_at: data.updated_at
    };
  }

  // Fallback to environment token if present
  return {
    id: 'default',
    bot_token: envToken,
    is_connected: !!envToken
  };
}

export async function saveBotConfig(config: Partial<BotConfig>): Promise<BotConfig> {
  const current = await getBotConfig();
  const updated: BotConfig = {
    ...current,
    ...config,
    id: 'default',
    updated_at: new Date().toISOString()
  };

  if (IS_MOCK_MODE) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('minicourse_bot_config', JSON.stringify(updated));
    }
    return updated;
  }

  const { data, error } = await supabase!
    .from('minicourse_bot_config')
    .upsert({
      id: 'default',
      bot_token: updated.bot_token || null,
      bot_username: updated.bot_username || null,
      bot_name: updated.bot_name || null,
      bot_photo_url: updated.bot_photo_url || null,
      webhook_url: updated.webhook_url || null,
      is_connected: updated.is_connected,
      updated_at: updated.updated_at
    })
    .select()
    .single();

  if (error) throw error;
  return data as BotConfig;
}


