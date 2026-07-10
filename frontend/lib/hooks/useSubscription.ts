"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
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
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionInfo = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get("/subscriptions/info/");
      setSubscription(res.data?.data || res.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch subscription info:", err);
      if (user) {
        const cd = getSubscriptionCountdown(user.trial_end, user.subscription_status);
        setSubscription({
          plan_type: user.plan_type || "trial",
          plan_name: user.plan_type === "trial" ? "7-Day Free Trial" : user.plan_type || "Free Trial",
          subscription_status: user.subscription_status || "trial",
          trial_used: false,
          trial_start: user.trial_start || null,
          trial_end: user.trial_end || null,
          trial_days_remaining: cd.daysRemaining,
          trial_hours_remaining: cd.hoursRemaining,
          is_premium_active: user.subscription_status === "active" || user.subscription_status === "trial",
          subscription_start: null,
          subscription_end: null,
        });
      }
      setError(err?.response?.data?.detail || "Could not load subscription details.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscriptionInfo();
  }, [fetchSubscriptionInfo]);

  // Premium Locking logic
  const isPremiumLocked = !loading && subscription ? !subscription.is_premium_active : false;
  const isTrialActive = subscription?.subscription_status === "trial";
  const isPaidActive = subscription?.subscription_status === "active";
  
  const countdown = getSubscriptionCountdown(
    subscription?.trial_end || user?.trial_end,
    subscription?.subscription_status || user?.subscription_status
  );
  const daysRemaining = countdown.daysRemaining;

  return {
    subscription,
    loading,
    error,
    isPremiumLocked,
    isTrialActive,
    isPaidActive,
    daysRemaining,
    countdown,
    refreshSubscription: fetchSubscriptionInfo,
  };
}
