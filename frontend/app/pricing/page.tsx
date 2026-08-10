"use client";

import React from "react";
import { PricingCards } from "./PricingCards";
import { Topbar } from "@/components/layouts/Topbar";
import { Footer } from "@/components/layouts/Footer";
import { Sparkles, ShieldCheck, Zap, HelpCircle, Check, X } from "lucide-react";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-foreground flex flex-col selection:bg-forge-500 selection:text-white relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-forge-500/15 via-purple-600/10 to-transparent rounded-full blur-[160px] pointer-events-none" />

      {/* Topbar */}
      <Topbar />

      <main className="flex-1 py-12 md:py-20 px-4 sm:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Investment In Self-Mastery</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
              Your future self doesn&apos;t need <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">motivation.</span><br className="hidden sm:inline" />
              It needs <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-indigo-500">consistency.</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Stop restarting every Monday. You&apos;re investing in a system that helps you keep the promises you make to yourself. Choose the plan that matches your ambition.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Secure Razorpay Checkout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Premium Activation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-forge-400" />
                <span>No Hidden Charges · Cancel Anytime</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Component */}
          <PricingCards />

          {/* Value Stack */}
          <div className="mt-24 md:mt-32 max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight mb-3">
              Everything you need to stop restarting.
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-10">
              Unlock the complete operating system to engineer your best self.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                { name: "Advanced Analytics", desc: "Deep insights into your habits." },
                { name: "Progress & Heatmaps", desc: "Visualize your daily consistency." },
                { name: "Life Score", desc: "Quantify your overall discipline." },
                { name: "Executive Reports", desc: "Daily & Weekly PDF breakdowns." },
                { name: "Focus Mode", desc: "Deep work sessions without distraction." },
                { name: "Advanced Routines", desc: "Stack habits seamlessly." },
                { name: "Leagues", desc: "Compete with other builders." },
                { name: "AI Coaching", desc: "Personalized performance feedback." }
              ].map((feature, i) => (
                <div key={i} className="bg-[#111116] border border-white/10 rounded-2xl p-5 flex flex-col items-center text-center hover:border-forge-500/30 hover:bg-forge-500/5 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
                    <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                  </div>
                  <h3 className="text-sm font-bold text-white mb-1">{feature.name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div className="mt-20 md:mt-28 max-w-4xl mx-auto mb-16">
            <div className="flex items-center justify-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-forge-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-10">
              Everything you need to know about subscriptions and billing.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">Can I use YOU VS YOU without a subscription?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Yes — you can add and complete tasks for free to manage your daily workflow. Premium features, analytics, and reports require an active subscription.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">Do I get a free trial?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No. YOU VS YOU currently does not offer a free trial. You can start using the free features immediately or upgrade directly to unlock the full system.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">Is payment processing secure?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All transactions are encrypted and processed securely by Razorpay. We never store your credit card or bank details on our servers.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">What happens when my subscription expires?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your account, tasks, and historical data remain completely safe. Premium features simply become locked until you renew your subscription.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
