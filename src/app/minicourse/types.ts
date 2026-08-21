export type UserRole = 'student' | 'admin';

export type HomeworkStatus = 'not_started' | 'pending' | 'accepted' | 'needs_improvement' | 'expired_not_submitted';

export interface MinicourseUser {
  id: string;
  name: string;
  email?: string;
  telegram: string;
  telegram_chat_id?: number | null;
  phone?: string;
  role: UserRole;
  created_at: string;
  is_paid?: boolean;
  payment_status?: string;
  device_uuids?: string[];
  status?: 'active' | 'under_investigation';
  access_opened_at?: string;
  homework_access_opened_at?: string;
  terms_accepted?: boolean;
}

export interface MinicoursePrizeCode {
  code: string;
  description?: string;
  created_by?: string;
  created_at: string;
  used_at?: string;
  used_by_id?: string;
  status: 'active' | 'used' | 'cancelled';
  used_by_name?: string;
  used_by_telegram?: string;
}

export interface LessonMaterialLink {
  id: string;
  title: string;
  url: string;
}

export interface LessonProgress {
  unlocked: boolean;
  openedAt?: string; // ISO string
  hwSubmitted: boolean;
  hwUrl?: string;
  hwStatus: HomeworkStatus;
  hwComment?: string;
  hwSubmittedAt?: string; // ISO string
  reminderSent?: boolean;
  videoWatchedSec?: number;
  videoDurationSec?: number;
  videoCompleted?: boolean;
  videoCompletedAt?: string;
  qstashMsgId?: string | null;
  notificationStatus?: 'pending' | 'sent' | 'cancelled' | null;
}

export interface MinicourseProgress {
  id: string;
  userId: string;
  progressPercent: number; // 0 to 100
  lessons: Record<number, LessonProgress>;
  updatedAt: string;
}

export interface MinicourseLessonConfig {
  lesson_id: number; // 1, 2, 3, 4...
  title: string;
  description: string;
  youtube_id: string;
  youtube_url?: string;
  youtube_id_new?: string;
  links?: LessonMaterialLink[];
  description_under_video?: string;
  hw_instructions?: string;
  sort_order?: number;
  mindmap_url?: string;
  hw_spreadsheet_url?: string;
  notion_url?: string;
  bonus_video_title?: string;
  bonus_video_youtube_id?: string;
  bonus_video_youtube_id_new?: string;
  updated_at: string;
}

export interface StudentWithProgress extends MinicourseUser {
  progress?: MinicourseProgress;
}

export interface BotMessageButton {
  text: string;
  url_type: 'autologin_lesson' | 'autologin_dashboard' | 'custom_url';
  custom_url?: string;
}

export interface BotMessageTemplate {
  id: string;
  event_key: string;
  lesson_id?: number | null;
  title: string;
  description?: string;
  message_text: string;
  buttons: BotMessageButton[];
  is_enabled: boolean;
  sort_order: number;
  updated_at?: string;
}

export interface BotBroadcast {
  id: string;
  created_at: string;
  message_text: string;
  button_text?: string | null;
  button_url?: string | null;
  target_audience: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  created_by?: string | null;
}

export interface BotConfig {
  id: string;
  bot_token?: string;
  bot_username?: string;
  bot_name?: string;
  bot_photo_url?: string;
  webhook_url?: string;
  is_connected: boolean;
  updated_at?: string;
}
