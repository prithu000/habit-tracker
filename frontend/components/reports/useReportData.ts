import { format, parseISO, startOfWeek, endOfWeek } from "date-fns";

export interface ReportDataProps {
  data?: any;
  dashboard?: any;
  lifeScore?: any;
  disciplineScore?: any;
  weeklyAnalytics?: any;
  monthlyAnalytics?: any;
  timeframe: "daily" | "weekly" | "monthly";
}

export function useReportData({
  data,
  dashboard,
  lifeScore,
  disciplineScore,
  weeklyAnalytics,
  monthlyAnalytics,
  timeframe,
}: ReportDataProps) {
  // Safely parse dates with exact weekly calendar range fallback
  const rawEndStr = weeklyAnalytics?.period?.end || data?.week_end || data?.period?.end || data?.end_date || new Date().toISOString();
  const rawStartStr = weeklyAnalytics?.period?.start || data?.week_start || data?.period?.start || data?.start_date || new Date().toISOString();
  let endDateObj = new Date();
  let startDateObj = new Date();
  try {
    endDateObj = parseISO(rawEndStr);
    startDateObj = parseISO(rawStartStr);
  } catch {
    endDateObj = new Date();
    startDateObj = new Date();
  }

  // If timeframe is weekly and both start and end point to the same date (e.g. Jul 9 - Jul 9 on initial query),
  // compute exact ISO/calendar week bounds (Monday to Sunday)
  if (timeframe === "weekly" && format(startDateObj, "yyyy-MM-dd") === format(endDateObj, "yyyy-MM-dd")) {
    startDateObj = startOfWeek(endDateObj, { weekStartsOn: 1 });
    endDateObj = endOfWeek(endDateObj, { weekStartsOn: 1 });
  }

  // Format header titles and dates
  const reportTitle =
    timeframe === "daily"
      ? "DAILY REPORT"
      : timeframe === "weekly"
      ? "WEEKLY REPORT"
      : "MONTHLY REPORT";

  const dateDisplay =
    timeframe === "daily"
      ? format(endDateObj, "MMMM d, yyyy")
      : timeframe === "weekly"
      ? `${format(startDateObj, "MMM d")} – ${format(endDateObj, "MMM d, yyyy")}`
      : format(endDateObj, "MMMM yyyy");

  // Top Metrics Calculation (Exact API binding: Life Score, Dashboard, Analytics)
  const activeDaysWeek = weeklyAnalytics?.summary?.active_days ?? (Array.isArray(data?.charts?.weekly_calendar_heatmap) ? data.charts.weekly_calendar_heatmap.filter((d: any) => (d.rate || d.completion_rate || 0) > 0).length : 0);
  
  let monthlyDaysSource: any[] = [];
  if (monthlyAnalytics?.calendar_grid?.weeks && Array.isArray(monthlyAnalytics.calendar_grid.weeks)) {
    monthlyDaysSource = monthlyAnalytics.calendar_grid.weeks.flat().filter(Boolean);
  } else if (Array.isArray(monthlyAnalytics?.calendar_grid)) {
    monthlyDaysSource = monthlyAnalytics.calendar_grid;
  } else if (Array.isArray(data?.charts?.heatmap_365) && data.charts.heatmap_365.length > 0) {
    monthlyDaysSource = data.charts.heatmap_365;
  } else if (Array.isArray(dashboard?.widgets?.github_history)) {
    monthlyDaysSource = dashboard.widgets.github_history;
  }
  const last30Days = Array.isArray(monthlyDaysSource) ? monthlyDaysSource.slice(-30) : [];
  const activeDaysMonth = monthlyAnalytics?.summary?.active_days ?? last30Days.filter((d: any) => (d.level || 0) > 0 || (d.rate || d.completion_rate || 0) > 0 || (d.tasks || d.tasks_completed || 0) > 0).length ?? 0;

  const overallScore =
    timeframe === "daily"
      ? Math.round(dashboard?.today?.stats?.completion_rate ?? data?.summary?.life_score ?? lifeScore?.overall_score ?? 0)
      : timeframe === "weekly"
      ? Math.round(data?.smart_statistics?.week_score ?? weeklyAnalytics?.summary?.avg_completion_rate ?? (activeDaysWeek > 0 ? Math.round((activeDaysWeek * (lifeScore?.overall_score || 100)) / 7.0) : 0))
      : Math.round(data?.smart_statistics?.month_score ?? monthlyAnalytics?.summary?.avg_completion_rate ?? (activeDaysMonth > 0 ? Math.round((activeDaysMonth * (lifeScore?.overall_score || 100)) / Math.max(1, last30Days.length || 30)) : 0));

  const statusSubtext =
    overallScore >= 85
      ? "Amazing Work!"
      : overallScore >= 70
      ? "Keep Going!"
      : "Keep Consistent!";

  // Completed metrics
  const completedTasks = dashboard?.today?.stats?.completed_tasks ?? data?.summary?.total_tasks_completed ?? 0;
  const executionVelocity = Array.isArray(data?.charts?.execution_velocity) ? data.charts.execution_velocity : [];
  const latestLog = executionVelocity.length > 0 ? executionVelocity[executionVelocity.length - 1] : null;
  const totalTasks = dashboard?.today?.stats?.total_tasks ?? latestLog?.scheduled_tasks ?? Math.max(1, completedTasks);

  // Active days & heatmaps calculation
  const heatmap365 = Array.isArray(data?.charts?.heatmap_365) ? data.charts.heatmap_365 : [];
  const githubHistory = Array.isArray(dashboard?.widgets?.github_history) ? dashboard.widgets.github_history : heatmap365;
  const recent14Days = Array.isArray(githubHistory) ? githubHistory.slice(-14) : [];

  const rightMetricVal =
    timeframe === "daily"
      ? `${completedTasks}/${totalTasks}`
      : timeframe === "weekly"
      ? `${activeDaysWeek}/7`
      : `${activeDaysMonth}/${last30Days.length || 30}`;

  const rightMetricLabel =
    timeframe === "daily" ? "Tasks" : "Days";

  // Strict 5 Habits Breakdown in exact requested order:
  const waterMl = dashboard?.widgets?.os_metrics?.water_ml ?? 0;
  const waterGoal = dashboard?.widgets?.os_goals?.water_goal_ml || 3000;
  const waterRate = Math.min(100, Math.round((waterMl / waterGoal) * 100) || Math.round(data?.executive_summary?.water_consistency ?? 0));

  const studyMins = dashboard?.widgets?.os_metrics?.study_mins ?? 0;
  const studyGoal = dashboard?.widgets?.os_goals?.study_goal_mins || 120;
  const readingRate = Math.min(100, Math.round((studyMins / studyGoal) * 100) || Math.round(data?.executive_summary?.study_consistency ?? 0));

  const workoutEx = dashboard?.widgets?.os_metrics?.workout_exercises ?? 0;
  const workoutGoal = dashboard?.widgets?.os_goals?.workout_goal_exercises || 8;
  const hypertrophyRate = Math.min(100, Math.round((workoutEx / workoutGoal) * 100) || Math.round(data?.executive_summary?.workout_consistency ?? 0));

  const pomoSessions = dashboard?.widgets?.os_metrics?.pomodoro_sessions ?? 0;
  const pomodoroRate = Math.min(100, Math.round((pomoSessions / 4) * 100) || Math.round(data?.executive_summary?.pomodoro_consistency ?? 0));

  const consistencyRate = Math.min(
    100,
    Math.round(dashboard?.today?.stats?.completion_rate ?? dashboard?.widgets?.day_progress?.completion_rate ?? data?.summary?.avg_completion_rate ?? data?.executive_summary?.completion_percentage ?? 0)
  );

  const habitsList = [
    { name: "Water Intake", val: waterRate, color: "#06b6d4" },
    { name: "Deep Study", val: readingRate, color: "#3b82f6" },
    { name: "Workout Progress", val: hypertrophyRate, color: "#8b5cf6" },
    { name: "Pomodoro Consistency", val: pomodoroRate, color: "#f97316" },
    { name: "Overall Consistency", val: consistencyRate, color: "#10b981" },
  ];

  // Weekly Line Chart Data
  const weeklyDaysSource = Array.isArray(dashboard?.widgets?.week_mini)
    ? dashboard.widgets.week_mini
    : Array.isArray(weeklyAnalytics?.days)
    ? weeklyAnalytics.days
    : Array.isArray(data?.charts?.weekly_calendar_heatmap)
    ? data.charts.weekly_calendar_heatmap
    : [];
  const weeklyChartData = (Array.isArray(weeklyDaysSource) ? weeklyDaysSource : []).map((item: any, idx: number) => {
    let dayLabel = item.day || item.day_name || "";
    if (!dayLabel && item.date) {
      try {
        dayLabel = format(new Date(item.date), "EEE");
      } catch {}
    }
    if (!dayLabel) dayLabel = `D${idx + 1}`;
    const val = Math.round(item.completion_rate ?? item.rate ?? item.value ?? 0);
    return { day: dayLabel, value: val };
  });

  // Monthly Bar Chart Data
  const monthlyBarData = [];
  const chunkSize = Math.ceil(last30Days.length / 4) || 7;
  for (let i = 0; i < 4; i++) {
    const chunk = last30Days.slice(i * chunkSize, (i + 1) * chunkSize);
    const avg = chunk.length > 0
      ? Math.round(chunk.reduce((acc: number, cur: any) => acc + (cur.completion_rate ?? cur.rate ?? 0), 0) / chunk.length)
      : 0;
    monthlyBarData.push({
      week: `Week ${i + 1}`,
      value: avg,
    });
  }

  const QUOTES = [
    "Discipline is choosing between what you want now and what you want most.",
    "Small daily improvements over time lead to stunning results.",
    "You don't rise to the level of your goals. You fall to the level of your systems.",
    "Success is neither magical nor mysterious. Success is the natural consequence of consistently applying basic fundamentals.",
    "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
  ];

  const quoteIdx = (overallScore + completedTasks) % QUOTES.length;
  const activeQuote = QUOTES[quoteIdx] || QUOTES[0];

  // Stable reportId and generatedTimestamp
  const hashSeed = `${timeframe}-${dateDisplay}-${overallScore}`;
  let hashVal = 0;
  for (let i = 0; i < hashSeed.length; i++) {
    hashVal = ((hashVal << 5) - hashVal + hashSeed.charCodeAt(i)) | 0;
  }
  const reportId = `YVY-${Math.abs(hashVal).toString(16).toUpperCase().padStart(8, "0")}`;
  const generatedTimestamp = format(new Date(), "MMMM d, yyyy • h:mm a");

  return {
    reportId,
    generatedTimestamp,
    reportTitle,
    dateDisplay,
    overallScore,
    statusSubtext,
    rightMetricVal,
    rightMetricLabel,
    habitsList,
    recent14Days,
    weeklyChartData,
    monthlyBarData,
    last30Days,
    activeQuote,
  };
}
