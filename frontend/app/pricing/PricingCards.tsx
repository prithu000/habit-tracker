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
import { useCurrentOffer } from "@/lib/hooks/useCurrentOffer";

function CountdownTimer({ expiresAt, serverTime }: { expiresAt: string, serverTime: string }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  React.useEffect(() => {
    const expiry = new Date(expiresAt).getTime();
    const server = new Date(serverTime).getTime();
    const clientNow = Date.now();
    const offset = server - clientNow;

    const updateTimer = () => {
      const now = Date.now() + offset;
      const remaining = Math.max(0, expiry - now);
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt, serverTime]);

  if (timeLeft <= 0) return null;

  const h = Math.floor(timeLeft / (1000 * 60 * 60));
  const m = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div
      className="flex flex-col items-center justify-center p-4 mb-8 rounded-2xl max-w-md mx-auto relative overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--accent-border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      <div className="absolute top-0 left-0 w-full h-1" style={{ background: "var(--accent)" }} />
      <span className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--accent)" }}>Special Launch Offer Ends In</span>
      <div className="flex items-center gap-3 text-3xl font-black tracking-widest" style={{ color: "var(--fg)" }}>
        <div className="flex flex-col items-center">
          <span className="px-3 py-1.5 rounded-lg border shadow-inner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>{pad(h)}</span>
          <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>HRS</span>
        </div>
        <span className="pb-4 opacity-50" style={{ color: "var(--accent)" }}>:</span>
        <div className="flex flex-col items-center">
          <span className="px-3 py-1.5 rounded-lg border shadow-inner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>{pad(m)}</span>
          <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>MIN</span>
        </div>
        <span className="pb-4 opacity-50" style={{ color: "var(--accent)" }}>:</span>
        <div className="flex flex-col items-center">
          <span className="px-3 py-1.5 rounded-lg border shadow-inner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>{pad(s)}</span>
          <span className="text-[10px] mt-1 uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>SEC</span>
        </div>
      </div>
    </div>
  );
}

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
  ctaText?: string;
}

const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Monthly Plan",
    price: 49,
    period: "month",
    description: "Start building your consistency today.",
    badge: "👑 BEST VALUE",
    badgeColor: "bg-gradient-to-r from-yellow-500 to-orange-500 text-black border-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.5)]",
    popular: true, 
    ctaText: "Start Your Transformation Now →",
    features: [
      "All 8 Core OS Modules (Dashboard, Life Score, Focus)",
      "Daily & Weekly Executive PDF Reports",
      "Interactive Habit Analytics & Heatmaps",
      "Standard AI Insights & Score Breakdown",
      "Cancel anytime from account settings",
    ],
  },
  {
    id: "6_month",
    name: "Premium 6 Month Plan",
    price: 265,
    originalPrice: 294,
    period: "6 months",
    monthlyEquivalent: "≈ ₹44/month",
    savings: "SAVE ₹29",
    description: "Enough time to turn consistency into a habit.",
    badge: "POPULAR",
    badgeColor: "bg-forge-500/20 text-forge-300 border-forge-500/40",
    ctaText: "Commit for 6 Months →",
    features: [
      "Everything in Monthly Plan",
      "Priority AI Performance Coaching & Diagnostics",
      "Advanced Custom Routine & Habit Templates",
      "Full Data Export (CSV & High-Res PDF A4)",
      "Dedicated half-year price lock",
    ],
  },
  {
    id: "12_month",
    name: "Premium Annual Plan (12 Months)",
    price: 499,
    originalPrice: 588,
    period: "year",
    monthlyEquivalent: "≈ ₹42/month",
    savings: "SAVE ₹89",
    description: "One year. One commitment. Build the version of yourself you keep promising to become.",
    badge: "🔥 BEST VALUE",
    badgeColor: "bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent text-amber-400 border-amber-500/30",
    bestValue: true,
    ctaText: "Build Your Year →",
    features: [
      "Everything in 6 Month Plan",
      "VIP Priority Support & Feature Requests",
      "Early Access to Next-Gen AI Modules",
      "Lifetime Price Lock Guarantee",
      "Exclusive Founder Status & Badge",
    ],
  },
];

export function PricingCards() {
  const { user, updateUser } = useAuthStore();
  const router = useRouter();
  const performLogout = useLogout();
  const queryClient = useQueryClient();
  const { data: activeOffer } = useCurrentOffer();
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
        offer_code: activeOffer?.code,
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

  const getButtonState = (planId: string, planName: string) => {
    if (!user) return { text: "Upgrade to Premium", disabled: false };

    const hasActivePaidSub = isSubscriber;
    const isCurrentPlan = planId === currentPlanType;

    if (hasActivePaidSub) {
      if (isCurrentPlan) return { text: "Current Plan ✓", disabled: true, isCurrent: true };
      if (planId === "12_month") return { text: "Upgrade to 12 Months", disabled: false };
      if (planId === "6_month") return { text: "Upgrade to 6 Months", disabled: false };
      return { text: "Switch Plan", disabled: false };
    }

    const defaultCta = PLANS.find(p => p.id === planId)?.ctaText || `Upgrade to ${planName}`;
    return { text: defaultCta, disabled: false };
  };

  return (
    <>
      {activeOffer && activeOffer.expires_at && activeOffer.server_time && (
        <CountdownTimer expiresAt={activeOffer.expires_at} serverTime={activeOffer.server_time} />
      )}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
        {PLANS.map((plan) => {
          const buttonState = getButtonState(plan.id, plan.name);
          const isLoading = loadingPlan === plan.id;

        return (
          <div
            key={plan.id}
            className={cn(
              "relative rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-300",
              plan.popular ? "lg:-translate-y-3" : ""
            )}
            style={{
              background: "var(--surface)",
              border: plan.popular ? "2px solid var(--accent)" : "1px solid var(--border)",
              boxShadow: plan.popular ? "var(--card-shadow-hover)" : "var(--card-shadow)",
            }}
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
                <h3 className="text-xl font-bold tracking-tight" style={{ color: "var(--fg)" }}>{plan.name}</h3>
                {plan.savings && (
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-extrabold shadow-sm">
                    {plan.savings}
                  </span>
                )}
              </div>

              <p className="text-xs min-h-[32px] mb-5" style={{ color: "var(--fg-muted)" }}>{plan.description}</p>

              {/* Price Display */}
              <div className="mb-6 relative">
                {plan.id === "monthly" && (
                  <div className="absolute -left-12 top-4 opacity-80 hidden sm:block animate-pulse">
                    {/* Hand-drawn arrow SVG */}
                    <svg width="40" height="40" viewBox="0 0 100 100" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="rotate-[15deg]">
                      <path d="M10,80 Q30,20 90,50 M70,30 L90,50 L60,70" />
                    </svg>
                  </div>
                )}
                {plan.id === "monthly" && (
                  <div className="inline-block bg-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 tracking-wider">
                    NOW AT
                  </div>
                )}
                {plan.originalPrice && (
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
                      Original Price
                    </span>
                    <span className="text-sm font-bold text-red-500 line-through">
                      ₹{plan.originalPrice}
                    </span>
                  </div>
                )}
                <div className="flex items-baseline gap-2 mb-1.5">
                  <span
                    className={cn(
                      "font-black tracking-tight",
                      plan.id === "monthly" ? "text-6xl sm:text-7xl" : "text-4xl sm:text-5xl"
                    )}
                    style={{ color: "var(--fg)" }}
                  >
                    {activeOffer ? `₹${Math.max(0, plan.price - activeOffer.discount_value_inr)}` : `₹${plan.price}`}
                  </span>
                  <span className="font-medium text-xs" style={{ color: "var(--fg-muted)" }}>
                    / {plan.period}
                  </span>
                </div>
                {activeOffer && (
                   <div className="text-xs font-bold text-green-500 mb-1.5 bg-green-500/10 px-2 py-1 rounded inline-block">
                     🎉 Special Offer Applied: {activeOffer.name}
                   </div>
                )}
                {plan.monthlyEquivalent ? (
                  <div className="text-xs font-bold tracking-wide" style={{ color: "var(--accent)" }}>
                    {plan.monthlyEquivalent} · Billed upfront
                  </div>
                ) : (
                  <div className="text-xs font-semibold" style={{ color: "var(--fg-muted)" }}>
                    Billed monthly · Cancel anytime
                  </div>
                )}
              </div>

              <div className="w-full h-px mb-6" style={{ background: "var(--border)" }} />

              {/* Feature List */}
              <div className="space-y-3.5 mb-8">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-faint)" }}>
                  Included Features:
                </div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs" style={{ color: "var(--fg)" }}>
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-500 stroke-[3]" />
                    </div>
                    <span className="leading-snug">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Button */}
            <div>
              {buttonState.isCurrent ? (
                <div className="w-full py-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 font-bold text-xs flex items-center justify-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>{buttonState.text}</span>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isLoading || buttonState.disabled}
                    className={cn(
                      "w-full py-4 px-6 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group shadow-sm",
                      (isLoading || buttonState.disabled) && "opacity-70 cursor-not-allowed"
                    )}
                    style={
                      plan.popular
                        ? {
                            background: "var(--accent)",
                            color: "var(--accent-fg)",
                            boxShadow: "var(--card-shadow-hover)",
                          }
                        : {
                            background: "var(--surface-raised)",
                            color: "var(--fg)",
                            border: "1px solid var(--border)",
                          }
                    }
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Initiating Checkout...</span>
                      </>
                    ) : (
                      <>
                        <span>{buttonState.text}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                  {plan.id === "monthly" && (
                    <p className="text-center text-[11px] mt-3 font-medium" style={{ color: "var(--fg-faint)" }}>
                      Secure Razorpay checkout &bull; Cancel anytime
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
