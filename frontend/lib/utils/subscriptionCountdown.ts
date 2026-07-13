export interface SubscriptionCountdown {
  isExpired: boolean;
  isTrial: boolean;
  isActivePaid: boolean;
  status: string;
  label: string;             // Primary formatted countdown string matching exact user requirements
  shortLabel: string;        // Compact version for badges/mobile
  daysRemaining: number;     // Exact full days remaining (diffSec // 86400)
  hoursRemaining: number;    // Exact full hours remaining (diffSec // 3600)
  minutesRemaining: number;  // Exact full minutes remaining (diffSec // 60)
  totalSecondsRemaining: number;
  endsToday: boolean;        // True if < 24 hours remaining
  badgeClass: string;        // Tailwind styling classes
}

/**
 * Calculates real-time subscription & trial countdown from the server UTC expiry timestamp.
 * 
 * Rules & Requirements:
 * - Single source of truth: `trialEnd` exact UTC ISO timestamp from server.
 * - Never cached static integers; computed dynamically against local `Date.now()`.
 * - > 48 hours remaining: "2 Days Left", "3 Days Left", etc.
 * - 24 to 48 hours remaining: "1 Day Left"
 * - < 24 hours remaining: "Ends Today" / "Ends in X Hours" (e.g. "Ends in 19 Hours", "Ends in 8 Hours", "Ends in 2 Hours")
 * - < 1 hour remaining: "Ends in X Minutes" (e.g. "Ends in 30 Minutes")
 * - Expired (totalSeconds <= 0): "Trial Expired"
 */
import { User } from "@/types/api";

export function getSubscriptionCountdown(
  user: Partial<User> | null | undefined
): SubscriptionCountdown {
  const currentStatus = (user?.subscription_status || "trial").toLowerCase();
  const isPremiumActive = user?.is_premium_active;

  // PRIORITY 1: Handle active paid subscriptions by status (or if plan is not trial)
  // If premium is active, NEVER show trial countdown
  if (currentStatus === "active" || currentStatus === "pro" || (isPremiumActive && currentStatus !== "trial" && currentStatus !== "expired")) {
    return {
      isExpired: false,
      isTrial: false,
      isActivePaid: true,
      status: "active",
      label: "Premium Active",
      shortLabel: "Premium",
      daysRemaining: 999,
      hoursRemaining: 9999,
      minutesRemaining: 999999,
      totalSecondsRemaining: 99999999,
      endsToday: false,
      badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25",
    };
  }

  // Handle missing end date or explicitly expired status
  if (!user?.trial_end || currentStatus === "expired" || currentStatus === "cancelled") {
    return {
      isExpired: true,
      isTrial: currentStatus === "trial",
      isActivePaid: false,
      status: "expired",
      label: "Trial Expired",
      shortLabel: "Expired",
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      totalSecondsRemaining: 0,
      endsToday: false,
      badgeClass: "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25 animate-pulse",
    };
  }

  // Use the backend as the single source of truth
  const totalDays = user.trial_days_remaining || 0;
  const totalHours = user.trial_hours_remaining || 0;

  // Expired dynamically via remaining values
  if (totalDays <= 0 && totalHours <= 0) {
    return {
      isExpired: true,
      isTrial: true,
      isActivePaid: false,
      status: "expired",
      label: "Trial Expired",
      shortLabel: "Expired",
      daysRemaining: 0,
      hoursRemaining: 0,
      minutesRemaining: 0,
      totalSecondsRemaining: 0,
      endsToday: false,
      badgeClass: "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25 animate-pulse",
    };
  }

  const endsToday = totalHours < 24 && totalHours > 0;

  let label = "";
  let shortLabel = "";
  let badgeClass = "bg-gradient-to-r from-amber-500/15 via-forge-500/15 to-purple-500/15 border-amber-500/30 text-amber-200 hover:border-amber-400/50";

  if (totalDays >= 2) {
    // 2 or more days left
    label = `${totalDays} Days Left`;
    shortLabel = `${totalDays} Days Left`;
  } else if (totalDays === 1) {
    // 1 day left
    label = "1 Day Left";
    shortLabel = "1 Day Left";
    badgeClass = "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse";
  } else if (totalHours >= 1 && totalHours < 24) {
    // Less than 24 hours remaining: "Ends in X Hours" / "Ends Today"
    label = `Ends in ${totalHours} ${totalHours === 1 ? "Hour" : "Hours"}`;
    shortLabel = totalHours < 12 ? `Ends in ${totalHours}h` : "Ends Today";
    badgeClass = "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse font-semibold";
  } else {
    // Less than 1 hour remaining (< 60 minutes)
    // The backend only provides hours right now, so if hours == 0 but it's not expired, just show < 1 hour
    label = `Ends in < 1 Hour`;
    shortLabel = `< 1h`;
    badgeClass = "bg-red-500/20 border-red-500/50 text-red-300 hover:bg-red-500/30 animate-pulse font-bold";
  }

  return {
    isExpired: false,
    isTrial: true,
    isActivePaid: false,
    status: "trial",
    label,
    shortLabel,
    daysRemaining: totalDays,
    hoursRemaining: totalHours,
    minutesRemaining: totalHours * 60, // Approximate
    totalSecondsRemaining: totalHours * 3600, // Approximate
    endsToday,
    badgeClass,
  };
}
