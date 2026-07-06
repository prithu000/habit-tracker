export interface User {
  id: string;
  email?: string;
  display_name: string;
  username?: string;
  onboarding_completed: boolean;
  current_level: number;
  total_xp: number;
  avatar_url?: string;
  identity_statement?: string;
  level_title?: string;
  time_preference?: string;
  timezone?: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    status: number;
    request_id?: string;
  };
  error: {
    code: string;
    message: string;
    errors?: Record<string, string[]>;
  } | null;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  sort_order: number;
  is_completed: boolean;
  completed_at: string | null;
  note: string;
  mood: number | null;
  completion_id: string | null;
}

export interface RoutineBlock {
  id: string;
  name: string;
  icon: string;
  color: string;
  time_of_day: string;
  sort_order: number;
  is_complete: boolean;
  task_count: number;
  completed_count: number;
  completion_rate: number;
  tasks: Task[];
}

export interface DashboardData {
  today: {
    date: string;
    stats: {
      total_tasks: number;
      completed_tasks: number;
      completion_rate: number;
      is_perfect_day: boolean;
      xp_earned_today: number;
      current_streak: number;
    };
    routines: RoutineBlock[];
  };
  widgets: {
    streak: {
      current: number;
      longest: number;
      level: string;
      last_completed: string | null;
      grace_period_used: boolean;
    };
    xp: {
      total_xp: number;
      current_level: number;
      level_title: string;
      level_progress: number;
      xp_to_next_level: number;
      xp_earned_today: number;
    };
    day_progress: {
      tasks_completed: number;
      tasks_scheduled: number;
      completion_rate: number;
      is_perfect_day: boolean;
    };
    week_mini: {
      date: string;
      day: string;
      completion_rate: number;
      tasks_completed: number;
      is_today: boolean;
    }[];
    os_goals?: {
      water_goal_ml: number;
      workout_goal_exercises: number;
      study_goal_mins: number;
    };
    os_metrics?: {
      water_ml: number;
      workout_exercises: number;
      study_mins: number;
      pomodoro_sessions: number;
      focus_mins: number;
      daily_xp: number;
    };
    github_history?: {
      date: string;
      level: number;
      active: boolean;
      tasks_completed: number;
    }[];
  };
  user: {
    id: string;
    display_name: string;
    avatar_url: string;
    identity_statement: string;
    current_level: number;
    total_xp: number;
    level_title: string;
    onboarding_completed: boolean;
  };
  notifications: {
    unread_count: number;
    unseen_badges: number;
  };
}

export interface ExecutiveSummary {
  overall_life_score: number;
  discipline_grade: string;
  current_streak: number;
  longest_streak: number;
  xp_earned: number;
  habits_completed: number;
  completion_percentage: number;
  monthly_growth_percentage: number;
  focus_hours: number;
  workout_hours: number;
  study_hours: number;
  water_consistency: number;
  sleep_consistency: number;
  productivity_rating: string;
  ai_summary: string;
}

export interface SmartReportsData {
  timeframe: string;
  start_date: string;
  end_date: string;
  executive_summary: ExecutiveSummary;
  charts: {
    life_score_timeline: {
      days_30: { date: string; score: number }[];
      days_90: { date: string; score: number }[];
      days_365: { date: string; score: number }[];
    };
    xp_growth: {
      daily: { date: string; xp: number }[];
      weekly: { week: string; xp: number }[];
      monthly: { month: string; xp: number }[];
    };
    execution_velocity: { date: string; planned: number; completed: number; speed: number }[];
    execution_volume: {
      daily: { date: string; tasks: number; workouts: number; study: number; pomodoro: number }[];
      weekly: { period: string; tasks: number; workouts: number; study: number; pomodoro: number }[];
      monthly: { period: string; tasks: number; workouts: number; study: number; pomodoro: number }[];
    };
    consistency_trajectory: { date: string; discipline_trend: number; momentum: number; consistency: number }[];
    radar_balance: { subject: string; val: number }[];
    heatmap_365: { date: string; level: number; tasks: number; rate: number }[];
    weekly_calendar_heatmap: { date: string; day: string; rate: number; tier: string }[];
    focus_analytics: { date: string; pomodoro_sessions: number; focus_time: number; deep_work: number; interruptions: number }[];
    study_analytics: { date: string; daily_study: number; weekly_avg: number; monthly_avg: number; goal_line: number }[];
    workout_analytics: { date: string; exercises_completed: number; goal: number; intensity: number }[];
    hydration_analytics: { date: string; water_intake: number; goal: number; daily_avg: number; monthly_avg: number }[];
    streak_milestones: { milestone: string; target: number; current: number; status: string }[];
    achievements_timeline: { id: string; title: string; description: string; xp_earned: number; date_achieved: string; icon: string }[];
    habit_distribution: { name: string; value: number; count: number; color: string }[];
    productive_hours: { hour: string; tasks_completed: number; intensity: number }[];
    weekly_comparison: { day: string; current_week: number; previous_week: number }[];
    monthly_comparison: { week: string; current_month: number; previous_month: number }[];
    quarterly_growth: { quarter: string; xp_growth: number; avg_rate: number }[];
    yearly_growth: { month: string; xp_generated: number; tasks_completed: number }[];
    success_ratio: { name: string; value: number; color: string }[];
    life_score_prediction: { day: string; predicted_score: number }[];
    discipline_momentum: { date: string; momentum_curve: number; status: string }[];
    completion_funnel: { stage: string; count: number; percentage: number }[];
    performance_matrix: { name: string; difficulty: number; completion_rate: number; xp_earned: number }[];
    personal_records: Record<string, { val: string; sub: string }>;
    ai_coach_report: {
      strengths: string[];
      weaknesses: string[];
      suggestions: string[];
      top_improvement_areas: { area: string; current: string; target: string }[];
      next_month_target: string;
    };
  };
  summary: any;
  chart_data: any[];
  kpis: any[];
  radar_data: any[];
  heatmap_data: any[];
  recommendations: string[];
  smart_statistics: any;
}

