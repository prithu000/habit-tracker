"use client";

import React, { useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRouter } from "next/navigation";
import { Check, Sparkles, Shield, Zap, ArrowRight, Loader2, Award } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { useLogout } from "@/lib/utils/logout";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "@/lib/queries/useUser";
import { useSubscription } from "@/lib/hooks/useSubscription";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface Plan {
  id: "monthly" | "6_month" | "12_month";
  name: string;
  price: number;
  originalPrice?: number;
  period: string;
  monthlyEquivalent?: string;
  savings?: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  popular?: boolean;
  bestValue?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: "12_month",
    name: "Premium Annual Plan (12 Months)",
    price: 699,
    originalPrice: 1188,
    period: "12 Months",
    monthlyEquivalent: "Only ₹58/month",
    savings: "Save ₹489",
    description: "The ultimate commitment to your life transformation. Best value for serious builders.",
    badge: "🔥 BEST VALUE",
    badgeColor: "bg-gradient-to-r from-amber-500/20 via-forge-500/20 to-purple-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-pulse",
    bestValue: true,
    features: [
      "Everything in 6 Month Plan",
      "VIP Priority Support & Feature Requests",
      "Early Access to Next-Gen AI Modules",
      "Lifetime Price Lock Guarantee",
      "Exclusive Founder Status & Badge",
    ],
  },
  {
    id: "6_month",
    name: "Premium 6 Month Plan",
    price: 399,
    originalPrice: 594,
    period: "6 Months",
    monthlyEquivalent: "Only ₹66/month",
    savings: "Save ₹195",
    description: "For dedicated builders committed to half-year discipline and focus.",
    badge: "⭐ MOST POPULAR",
    badgeColor: "bg-forge-500/20 text-forge-300 border-forge-500/40",
    popular: true,
    features: [
      "Everything in Monthly Plan",
      "Priority AI Performance Coaching & Diagnostics",
      "Advanced Custom Routine & Habit Templates",
      "Full Data Export (CSV & High-Res PDF A4)",
      "Dedicated half-year price lock",
    ],
  },
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 99,
    period: "month",
    description: "Flexible month-to-month access for immediate momentum.",
    features: [
      "All 8 Core OS Modules (Dashboard, Life Score, Focus)",
      "Daily & Weekly Executive PDF Reports",
      "Interactive Habit Analytics & Heatmaps",
      "Standard AI Insights & Score Breakdown",
      "Cancel anytime from account settings",
    ],
  },
];

export function PricingCards() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const performLogout = useLogout();
  const queryClient = useQueryClient();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) {
      toast("Please sign in or create an account first", { icon: "👋" });
      router.push(`/login?redirect=/pricing`);
      return;
    }

    setLoadingPlan(plan.id);
    try {
      // 1. Create Order on Backend
      const res = await api.post("/subscriptions/create-order/", {
        plan_type: plan.id,
      });
      
      // Handle both wrapped and unwrapped responses
      const orderData = res.data?.data || res.data;

      // Validate response
      if (!orderData.order_id) {
        console.error("Invalid response from create-order:", orderData);
        console.error("Full response structure:", res);
        toast.error("Invalid response from server. Please try again.");
        setLoadingPlan(null);
        return;
      }

      // 2. Load Razorpay SDK regardless of mock/real (checkout.js always works)
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load secure payment window. Please check your network or pop-up blocker.");
        setLoadingPlan(null);
        return;
      }

      // Check if mock order (API keys invalid / dev mode)
      const isMock = orderData.is_mock || orderData.order_id?.startsWith("order_mock_");

      if (isMock) {
        // In dev/test mode with invalid API keys — open a custom confirmation modal
        // instead of silently auto-succeeding or requiring real Razorpay order ID
        const confirmed = window.confirm(
          `[DEV MODE — Razorpay test keys expired]\n\nSimulate payment for:\n• Plan: ${plan.name}\n• Amount: ₹${plan.price}\n\nClick OK to simulate a successful payment.`
        );
        if (!confirmed) {
          setLoadingPlan(null);
          return;
        }

        toast.loading("Simulating payment verification...", { duration: 1500 });
        const verifyRes = await api.post("/subscriptions/verify-payment/", {
          razorpay_order_id: orderData.order_id,
          razorpay_payment_id: `pay_mock_${Date.now()}`,
          razorpay_signature: "mock_signature",
          plan_type: plan.id,
        });

        if (updateUser) {
          updateUser({ subscription_status: "active", plan_type: plan.id });
        }
        queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
        queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] });
        toast.success(`🎉 ${plan.name} activated! Invoice #${verifyRes.data.invoice_number}`);
        router.push("/settings?tab=subscription");
        return;
      }

      // 4. Open Razorpay Checkout Modal
      const options = {
        key: orderData.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YOU VS YOU",
        description: `${plan.name} Subscription`,
        order_id: orderData.order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post("/subscriptions/verify-payment/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_type: plan.id,
            });
            if (updateUser) {
              updateUser({
                subscription_status: "active",
                plan_type: plan.id,
              });
            }
            queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: ["subscription", user.id] });
            queryClient.invalidateQueries({ queryKey: ["dashboard", user.id] });
            
            toast.success(`🎉 Subscription activated! Invoice #${verifyRes.data.invoice_number}`);
            router.push("/settings?tab=subscription");
          } catch (err: any) {
            toast.error(err.response?.data?.detail || err.response?.data?.message || "Payment verification failed.");
          }
        },
        prefill: {
          name: orderData.user_info?.name || user.display_name,
          email: orderData.user_info?.email || user.email,
        },
        theme: {
          color: "#8b5cf6",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (resp: any) {
        toast.error(`Payment failed: ${resp.error?.description || "Payment was not completed."}`);
      });
      rzp.open();
    } catch (error: any) {
      console.error("Order creation failed:", error);
      
      if (error.response?.status === 401) {
        toast.error("Your session expired. Please log out and log back in.");
        setTimeout(async () => {
          await performLogout();
          router.push("/login?redirect=/pricing");
        }, 2000);
      } else {
        const errorMsg = error.response?.data?.detail || error.response?.data?.message || "Could not initiate checkout. Please try again.";
        toast.error(errorMsg);
      }
    } finally {
      setLoadingPlan(null);
    }
  };

  const { isPaidActive: isSubscriber, subscription } = useSubscription();
  const currentPlanType = subscription?.plan_type || user?.plan_type;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
      {PLANS.map((plan) => {
        const isCurrent = isSubscriber && currentPlanType === plan.id;
        const isLoading = loadingPlan === plan.id;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300",
              plan.bestValue
                ? "bg-gradient-to-b from-[#1d1633] via-[#151324] to-[#111116] border-2 border-forge-500 shadow-[0_0_50px_rgba(139,92,246,0.35)] lg:-translate-y-3 ring-1 ring-forge-400/50"
                : plan.popular
                ? "bg-[#14141a] border border-forge-500/50 shadow-[0_10px_35px_rgba(0,0,0,0.5)]"
                : "bg-[#111116] border border-white/10 hover:border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
            )}
          >
            {/* Top Badge */}
            {plan.badge && (
              <div className="absolute -top-3.5 right-6 z-10">
                <span
                  className={cn(
                    "px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border shadow-md",
                    plan.badgeColor
                  )}
                >
                  {plan.badge}
                </span>
              </div>
            )}

            <div>
              {/* Plan Title & Savings */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <h3 className="text-xl font-bold text-white tracking-tight">{plan.name}</h3>
                {plan.savings && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-extrabold shadow-sm">
                    {plan.savings}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground min-h-[32px] mb-5">{plan.description}</p>

              {/* Price Display */}
              <div className="mb-6">
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                      Original Price
                    </span>
                    <span className="text-sm font-bold text-red-400/90 line-through decoration-red-500/70">
                      ₹{plan.originalPrice}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    {plan.originalPrice ? `Now ₹${plan.price}` : `₹${plan.price}`}
                  </span>
                  <span className="text-xs font-medium text-muted-foreground">/ {plan.period}</span>
                </div>
                {plan.monthlyEquivalent ? (
                  <div className="text-xs font-bold text-forge-400 tracking-wide">
                    {plan.monthlyEquivalent} · Billed upfront
                  </div>
                ) : (
                  <div className="text-xs font-semibold text-muted-foreground">
                    Billed monthly · Cancel anytime
                  </div>
                )}
              </div>

              <div className="w-full h-px bg-white/[0.08] mb-6" />

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Included Features:
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-white/90">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Button */}
            <div>
              {isCurrent ? (
                <div className="w-full py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Current Active Plan</span>
                </div>
              ) : (
                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={isLoading}
                  className={cn(
                    "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group",
                    plan.bestValue
                      ? "bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-600 hover:to-purple-700 text-white shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)]"
                      : plan.popular
                      ? "bg-white text-black hover:bg-white/90 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                      : "bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/10"
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Initiating Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span>Upgrade to {plan.name}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
