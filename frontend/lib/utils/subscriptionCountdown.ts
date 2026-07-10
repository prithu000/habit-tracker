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
export function getSubscriptionCountdown(
  trialEnd: string | Date | null | undefined,
  status: string | null | undefined = "trial",
  nowTs?: number
): SubscriptionCountdown {
  const currentStatus = (status || "trial").toLowerCase();
  const now = nowTs ?? Date.now();

  // Handle active paid subscriptions
  if (currentStatus === "active" || currentStatus === "pro") {
    return {
      isExpired: false,
      isTrial: false,
      isActivePaid: true,
      status: "active",
      label: "PRO Active",
      shortLabel: "PRO Active",
      daysRemaining: 999,
      hoursRemaining: 9999,
      minutesRemaining: 999999,
      totalSecondsRemaining: 99999999,
      endsToday: false,
      badgeClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25",
    };
  }

  // Handle missing end date or explicitly expired status
  if (!trialEnd || currentStatus === "expired" || currentStatus === "cancelled") {
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

  // Calculate exact difference from single source of truth server timestamp
  const endMs = typeof trialEnd === "string" ? new Date(trialEnd).getTime() : trialEnd.getTime();
  const diffSec = Math.floor((endMs - now) / 1000);

  // Expired
  if (diffSec <= 0 || isNaN(diffSec)) {
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

  const totalDays = Math.floor(diffSec / 86400);
  const totalHours = Math.floor(diffSec / 3600);
  const totalMinutes = Math.floor(diffSec / 60);
  const endsToday = totalHours < 24;

  let label = "";
  let shortLabel = "";
  let badgeClass = "bg-gradient-to-r from-amber-500/15 via-forge-500/15 to-purple-500/15 border-amber-500/30 text-amber-200 hover:border-amber-400/50";

  if (totalHours >= 48) {
    // If more than 48 hours remain: "2 Days Left", "3 Days Left", etc.
    label = `${totalDays} Days Left`;
    shortLabel = `${totalDays} Days Left`;
  } else if (totalHours >= 24 && totalHours < 48) {
    // 24 to 48 hours remaining: exactly 1 Day Left
    label = "1 Day Left";
    shortLabel = "1 Day Left";
    badgeClass = "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 animate-pulse";
  } else if (totalHours >= 1 && totalHours < 24) {
    // Less than 24 hours remaining: "Ends in X Hours" / "Ends Today"
    // Matches: 19 hours left -> Ends in 19 Hours, 8 hours left -> Ends in 8 Hours, 2 hours left -> Ends in 2 Hours
    label = `Ends in ${totalHours} ${totalHours === 1 ? "Hour" : "Hours"}`;
    shortLabel = totalHours < 12 ? `Ends in ${totalHours}h` : "Ends Today";
    badgeClass = "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30 animate-pulse font-semibold";
  } else {
    // Less than 1 hour remaining (< 60 minutes): "Ends in X Minutes"
    // Matches: 30 minutes left -> Ends in 30 Minutes
    const m = Math.max(1, totalMinutes);
    label = `Ends in ${m} ${m === 1 ? "Minute" : "Minutes"}`;
    shortLabel = `Ends in ${m}m`;
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
    minutesRemaining: totalMinutes,
    totalSecondsRemaining: diffSec,
    endsToday,
    badgeClass,
  };
}
