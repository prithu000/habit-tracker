"use client";

import React from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { PaymentHistoryItem } from "@/types/api";
import { useRouter } from "next/navigation";
import {
  Award,
  Sparkles,
  Calendar,
  CreditCard,
  Download,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { toast } from "react-hot-toast";
import { getSubscriptionCountdown } from "@/lib/utils/subscriptionCountdown";

export const SubscriptionTab: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: history = [], isLoading: historyLoading } = useQuery<PaymentHistoryItem[]>({
    queryKey: ["paymentHistory"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/history/");
      return res.data?.data || res.data || [];
    },
  });

  const countdown = getSubscriptionCountdown(user?.trial_end, user?.subscription_status);
  const subStatus = countdown.status;
  const planType = user?.plan_type || "trial";
  const trialDaysLeft = countdown.daysRemaining;

  const getPlanTitle = () => {
    if (planType === "monthly") return "Monthly Pro Plan (₹99)";
    if (planType === "6_month") return "6-Month Pro Plan (₹399)";
    if (planType === "12_month") return "12-Month VIP Plan (₹699)";
    return "7-Day Full Featured Trial";
  };

  const handleDownloadInvoice = (item: PaymentHistoryItem) => {
    toast.success(`Downloading Invoice #${item.invoice_number}...`);
    // Create text summary or trigger browser print/download for the invoice
    const content = `
===================================================
              YOU VS YOU OPERATING SYSTEM
               OFFICIAL BILLING INVOICE
===================================================
Invoice Number:   ${item.invoice_number}
Order Reference:  ${item.order_id}
Transaction ID:   ${item.payment_id}
Payment Status:   ${item.status.toUpperCase()}
Amount Paid:      ₹${item.amount} INR
Plan Enrolled:    ${getPlanTitle()}
Billing Start:    ${new Date(item.billing_period_start).toLocaleDateString()}
Billing End:      ${new Date(item.billing_period_end).toLocaleDateString()}
Date Issued:      ${new Date(item.paid_at).toLocaleString()}
===================================================
Thank you for investing in yourself. Keep showing up.
`;
    const blob = new Blob([content.trim()], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.invoice_number}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Current Plan Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#14141a] via-[#161324] to-[#121216] border border-forge-500/30 p-6 sm:p-8 shadow-[0_10px_40px_rgba(139,92,246,0.15)] overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-forge-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                subStatus === "active"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                  : subStatus === "expired"
                  ? "bg-red-500/15 border-red-500/30 text-red-400"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-300"
              )}>
                {subStatus === "active" && "PRO ACTIVE"}
                {subStatus === "trial" && "TRIAL ACTIVE"}
                {subStatus === "expired" && "EXPIRED"}
              </span>

              {subStatus === "trial" && (
                <span className="text-xs text-muted-foreground font-medium">
                  {countdown.label}
                </span>
              )}
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {getPlanTitle()}
            </h3>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {user?.renewal_date ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-forge-400" />
                  <span>
                    {subStatus === "active" ? "Renews / Expires on:" : "Trial ends on:"}{" "}
                    <strong className="text-white">
                      {new Date(user.renewal_date).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              ) : user?.trial_end ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Trial concludes on:{" "}
                    <strong className="text-white">
                      {new Date(user.trial_end).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => router.push("/pricing")}
              className="px-5 py-3.5 rounded-2xl bg-gradient-to-r from-forge-500 to-purple-600 hover:from-forge-600 hover:to-purple-700 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              <span>{subStatus === "active" ? "Change / Upgrade Plan" : "Upgrade to Pro"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Checkmarks inline */}
        <div className="mt-6 pt-6 border-t border-white/[0.08] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-white/90">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Printable A4 PDF Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Unlimited Habit Heatmaps</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Deep Focus & Discipline Engine</span>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-forge-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">Billing & Payment History</h3>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {history.length} {history.length === 1 ? "invoice" : "invoices"}
          </span>
        </div>

        <div className="bg-[#111116] border border-white/10 rounded-3xl overflow-hidden shadow-xl">
          {historyLoading ? (
            <div className="p-12 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-forge-400" />
              <span className="text-xs">Loading transaction history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground space-y-2">
              <CreditCard className="w-8 h-8 mx-auto text-white/20 mb-2" />
              <p className="text-sm font-medium text-white/80">No payments recorded yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Once you subscribe to a paid plan, all your verified invoices will be stored safely here for tax and record purposes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Invoice</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Plan</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                    <th className="py-3.5 px-6 text-right text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-xs">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-6 font-mono font-medium text-white">{item.invoice_number}</td>
                      <td className="py-4 px-4 text-white font-medium">
                        {item.metadata?.plan_title || item.plan_type.toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">₹{item.amount}</td>
                      <td className="py-4 px-4 text-muted-foreground">
                        {new Date(item.paid_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          item.status === "success"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-medium transition-all text-xs"
                          title="Download Invoice"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
