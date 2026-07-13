"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { getSubscriptionCountdown } from "@/lib/utils/subscriptionCountdown";

export interface SubscriptionInfo {
  plan_type: string;
  plan_name: string;
  subscription_status: string;
  trial_used: boolean;
  trial_start: string | null;
  trial_end: string | null;
  trial_days_remaining: number;
  trial_hours_remaining?: number;
  is_premium_active: boolean;
  subscription_start: string | null;
  subscription_end: string | null;
  payment_id?: string;
  order_id?: string;
  invoice_id?: string;
  invoice_number?: string;
  renewal_date?: string | null;
  amount_paid?: number;
  currency?: string;
  payment_method?: string;
  payment_status?: string;
}

export function useSubscription() {
  const { user } = useAuthStore();
  
  // Base flags derived purely from the globally synced user object
  const isPremiumLocked = user ? !user.is_premium_active : false;
  const isPremiumActive = user ? user.is_premium_active : false;
  const isTrialActive = user?.subscription_status === "trial";
  const isPaidActive = user?.subscription_status === "active";
  const isFreeMode = user?.subscription_status === "expired" || user?.subscription_status === "cancelled" || !isPremiumActive;
  
  const countdown = getSubscriptionCountdown(user);
  const daysRemaining = countdown.daysRemaining;

  // Construct a synthetic subscription object matching the old signature
  // so components don't break if they read detailed dates directly.
  const subscription: SubscriptionInfo | null = user ? {
    plan_type: user.plan_type || "trial",
    plan_name: user.plan_name || (user.plan_type === "trial" ? "14-Day Free Trial" : "Free Trial"),
    subscription_status: user.subscription_status || "trial",
    trial_used: user.trial_used || false,
    trial_start: user.trial_start || null,
    trial_end: user.trial_end || null,
    trial_days_remaining: daysRemaining,
    trial_hours_remaining: countdown.hoursRemaining,
    is_premium_active: isPremiumActive || false,
    subscription_start: user.subscription_start || null,
    subscription_end: user.subscription_end || null,
  } : null;

  return {
    subscription,
    loading: false,
    error: null,
    isPremiumLocked,
    isPremiumActive,
    isTrialActive,
    isPaidActive,
    isFreeMode,
    daysRemaining,
    countdown,
    refreshSubscription: () => {}, // No-op now since AuthGuard handles global refresh
  };
}
