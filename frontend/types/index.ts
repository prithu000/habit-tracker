/**
 * FORGE TypeScript Type Definitions
 * Single source of truth for all API response types
 */

// ─────────────── User ───────────────
export interface User {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  timezone: string;
  onboarding_completed: boolean;
  identity_statement: string;
  time_preference: "morning" | "night" | "flexible";
  current_level: number;
  total_xp: number;
  level_progress: number; // 0-100
  date_joined: string;
}

export interface UserStats {
  total_xp: number;
  current_level: number;
  level_progress: number;
  current_streak: number;
  longest_streak: number;
  total_badges: number;
}

// ─────────────── Routines ───────────────
export type TimeOfDay = "morning" | "afternoon" | "evening" | "anytime";

export interface Task {
  id: string;
  name: string;
  description: string;
  duration_minutes: number | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  // Today view only
  is_completed?: boolean;
  completed_at?: string | null;
  note?: string;
  mood?: number | null;
}

export interface RoutineSchedule {
  recurrence_type: "daily" | "weekly" | "custom";
  days_of_week: number[];
  start_date: string;
  end_date: string | null;
}

export interface Routine {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  time_of_day: TimeOfDay;
  is_active: boolean;
  sort_order: number;
  tasks: Task[];
  schedule: RoutineSchedule | null;
  task_count: number;
  created_at: string;
  // Today view only
  is_complete?: boolean;
}

// ─────────────── Today ───────────────
export interface TodayStats {
  total_tasks: number;
  completed_tasks: number;
  completion_rate: number;
  is_perfect_day: boolean;
}

export interface TodayResponse {
  date: string;
  stats: TodayStats;
  routines: Routine[];
}

export interface CompleteTaskResponse {
  completion_id: string;
  xp_earned: number;
  total_xp: number;
  leveled_up: boolean;
  streak_milestone: number | null;
}

// ─────────────── Streaks ───────────────
export interface StreakRecord {
  routine_id: string | null;
  routine_name: string;
  current_streak: number;
  longest_streak: number;
  last_completed_date: string | null;
  grace_period_used: boolean;
}

// ─────────────── Analytics ───────────────
export interface HeatmapDay {
  date: string;
  completion_rate: number;
  tasks_completed: number;
  tasks_scheduled: number;
}

export interface AnalyticsSummaryPeriod {
  avg_completion_rate: number;
  total_xp: number;
  total_tasks_completed: number;
  days_logged: number;
}

export interface AnalyticsSummary {
  weekly: AnalyticsSummaryPeriod;
  monthly: AnalyticsSummaryPeriod;
}

export interface WeeklyInsight {
  id: string;
  week_start: string;
  completion_trend: "improving" | "stable" | "declining";
  highlight_text: string;
  avg_completion_rate: number;
  total_xp_earned: number;
  best_routine: string | null;
}

// ─────────────── Rewards ───────────────
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

export interface Badge {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: BadgeRarity;
  unlocked_at: string;
  seen: boolean;
}

export interface XPEntry {
  amount: number;
  reason: string;
  created_at: string;
}

export interface XPData {
  total_xp: number;
  current_level: number;
  level_progress: number;
  next_level_xp: number;
  history: XPEntry[];
}

// ─────────────── Notifications ───────────────
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: "streak" | "badge" | "milestone" | "reminder" | "system";
  is_read: boolean;
  action_url: string;
  created_at: string;
}

// ─────────────── API Envelope ───────────────
export interface APIResponse<T> {
  data: T;
  meta: { status: number };
  error: null | Record<string, unknown>;
}
