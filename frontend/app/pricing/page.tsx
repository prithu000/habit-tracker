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
              Invest in the Person You <br className="hidden sm:inline" />
              Are Committed to Becoming.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Choose the plan that matches your ambition. All plans include 100% full access to the Executive PDF Reports, Habit Heatmaps, and AI Coaching Chamber.
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>14-Day Free Trial Included</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Instant Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-forge-400" />
                <span>Secure Razorpay Checkout</span>
              </div>
            </div>
          </div>

          {/* Pricing Cards Component */}
          <PricingCards />

          {/* Feature Comparison Matrix */}
          <div className="mt-24 md:mt-32 max-w-5xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-white text-center tracking-tight mb-3">
              Comprehensive Feature Comparison
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground text-center mb-10">
              See how our subscription tiers compare to help you build relentless discipline.
            </p>

            <div className="bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02]">
                      <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-muted-foreground w-2/5">
                        Feature / Capability
                      </th>
                      <th className="py-4 px-4 text-center text-xs font-bold text-white w-1/5">
                        Monthly
                      </th>
                      <th className="py-4 px-4 text-center text-xs font-bold text-forge-300 w-1/5 bg-forge-500/5">
                        6-Month (Popular)
                      </th>
                      <th className="py-4 px-4 text-center text-xs font-bold text-amber-300 w-1/5 bg-purple-500/5">
                        12-Month (VIP)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs">
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">All 8 Core OS Modules</td>
                      <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Daily & Weekly PDF Executive Reports</td>
                      <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Interactive Heatmap & Analytics Engine</td>
                      <td className="py-4 px-4 text-center"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Advanced AI Performance Diagnostics</td>
                      <td className="py-4 px-4 text-center"><span className="text-muted-foreground">Standard</span></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><span className="text-forge-400 font-bold">Priority Engine</span></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><span className="text-amber-400 font-bold">VIP Deep Engine</span></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Data Export (CSV & A4 PDF)</td>
                      <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-muted-foreground/40 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-emerald-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Lifetime Price Lock Guarantee</td>
                      <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-muted-foreground/40 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><span className="text-muted-foreground">6 Months</span></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-6 font-medium text-white">Early Access to New Features</td>
                      <td className="py-4 px-4 text-center"><X className="w-4 h-4 text-muted-foreground/40 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-forge-500/5"><X className="w-4 h-4 text-muted-foreground/40 mx-auto" /></td>
                      <td className="py-4 px-4 text-center bg-purple-500/5"><Check className="w-4 h-4 text-amber-400 mx-auto" /></td>
                    </tr>
                  </tbody>
                </table>
              </div>
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
              Everything you need to know about subscriptions, billing, and the 14-day trial.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">How does the 14-Day Free Trial work?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Every new user receives 14 full days of unrestricted access to every feature in the YOU VS YOU operating system. No credit card is required upfront to start your trial.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">Can I change or upgrade my plan later?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Yes! You can switch from Monthly to the 6-Month or 12-Month plan at any time directly from your Account Settings. Your billing cycle will adjust automatically.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">Is payment processing secure?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  All transactions are encrypted and processed securely by Razorpay. We never store your credit card or bank details on our servers.
                </p>
              </div>

              <div className="bg-[#111116] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-2">
                <h3 className="text-sm font-bold text-white">What happens if my trial expires?</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  When your trial ends, your data and streaks remain safely stored in the database. You will simply be prompted to select a subscription plan to resume accessing your dashboard.
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
