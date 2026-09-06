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
import { useSubscription } from "@/lib/hooks/useSubscription";

export const SubscriptionTab: React.FC = () => {
  const { user } = useAuthStore();
  const router = useRouter();

  const { data: history = [], isLoading: historyLoading } = useQuery<PaymentHistoryItem[]>({
    queryKey: ["paymentHistory"],
    queryFn: async () => {
      const res = await api.get("/subscriptions/history/");
      // Handle paginated response or direct array
      const data = res.data?.results || res.data?.data || res.data;
      return Array.isArray(data) ? data : [];
    },
  });

  const { subscription } = useSubscription();
  const subStatus = subscription?.subscription_status || "free";
  const planType = subscription?.plan_type || user?.plan_type || "free";

  const getPlanTitle = () => {
    if (planType === "monthly") return "Monthly Pro Plan (₹49)";
    if (planType === "6_month") return "6-Month Pro Plan (₹265)";
    if (planType === "12_month") return "12-Month VIP Plan (₹499)";
    return "Free Plan";
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
      <div 
        className="relative rounded-3xl border p-6 sm:p-8 overflow-hidden"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "var(--card-shadow)",
          color: "var(--fg)",
        }}
      >
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[var(--accent)]/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border",
                subStatus === "active"
                  ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-500"
                  : subStatus === "expired" || subStatus === "cancelled"
                  ? "bg-red-500/15 border-red-500/30 text-red-500"
                  : "bg-amber-500/15 border-amber-500/30 text-amber-500"
              )}>
                {subStatus === "active" && "PRO ACTIVE"}
                {subStatus === "expired" && "EXPIRED"}
                {subStatus === "cancelled" && "CANCELLED"}
                {(subStatus === "free" || !subStatus) && "FREE PLAN"}
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: "var(--fg)" }}>
              {getPlanTitle()}
            </h3>

            <div className="flex items-center gap-4 text-xs" style={{ color: "var(--fg-muted)" }}>
              {user?.renewal_date && subStatus === "active" ? (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" style={{ color: "var(--accent)" }} />
                  <span>
                    Renews on:{" "}
                    <strong style={{ color: "var(--fg)" }}>
                      {new Date(user.renewal_date).toLocaleDateString()}
                    </strong>
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => router.push("/pricing")}
              className="px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>{subStatus === "active" ? "Change / Upgrade Plan" : "Upgrade to Pro"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Feature Checkmarks inline */}
        <div className="mt-6 pt-6 border-t grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs" style={{ borderColor: "var(--border)", color: "var(--fg)" }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Printable A4 PDF Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Unlimited Habit Heatmaps</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Deep Focus & Discipline Engine</span>
          </div>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: "var(--accent)" }} />
            <h3 className="text-lg font-bold tracking-tight" style={{ color: "var(--fg)" }}>Billing & Payment History</h3>
          </div>
          <span className="text-xs font-mono" style={{ color: "var(--fg-muted)" }}>
            {history.length} {history.length === 1 ? "invoice" : "invoices"}
          </span>
        </div>

        <div 
          className="border rounded-3xl overflow-hidden shadow-xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
        >
          {historyLoading ? (
            <div className="p-12 flex flex-col items-center justify-center gap-3" style={{ color: "var(--fg-muted)" }}>
              <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent)" }} />
              <span className="text-xs">Loading transaction history...</span>
            </div>
          ) : history.length === 0 ? (
            <div className="p-12 text-center space-y-2" style={{ color: "var(--fg-muted)" }}>
              <CreditCard className="w-8 h-8 mx-auto opacity-30 mb-2" />
              <p className="text-sm font-medium" style={{ color: "var(--fg)" }}>No payments recorded yet</p>
              <p className="text-xs max-w-sm mx-auto">
                Once you subscribe to a paid plan, all your verified invoices will be stored safely here for tax and record purposes.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="border-b" style={{ background: "var(--surface-raised)", borderColor: "var(--border)" }}>
                    <th className="py-3.5 px-6 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Invoice</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Plan</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Amount</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Date</th>
                    <th className="py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Status</th>
                    <th className="py-3.5 px-6 text-right text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--fg-muted)" }}>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-xs" style={{ borderColor: "var(--border)" }}>
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--surface-hover)] transition-colors">
                      <td className="py-4 px-6 font-mono font-medium" style={{ color: "var(--fg)" }}>{item.invoice_number}</td>
                      <td className="py-4 px-4 font-medium" style={{ color: "var(--fg)" }}>
                        {item.metadata?.plan_title || item.plan_type.toUpperCase()}
                      </td>
                      <td className="py-4 px-4 font-bold" style={{ color: "var(--fg)" }}>₹{item.amount}</td>
                      <td className="py-4 px-4" style={{ color: "var(--fg-muted)" }}>
                        {new Date(item.paid_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          item.status === "success"
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-500 border border-red-500/30"
                        )}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-medium transition-all text-xs hover:bg-[var(--surface-hover)]"
                          style={{
                            background: "var(--surface-raised)",
                            borderColor: "var(--border)",
                            color: "var(--fg)",
                          }}
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
