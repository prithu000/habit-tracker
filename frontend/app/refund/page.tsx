import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Refund Policy | YOU VS YOU",
  description: "Refund and Cancellation Policy for YOU VS YOU.",
};

export default function RefundPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="space-y-6">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight mb-8"
          style={{ color: "var(--fg)" }}
        >
          Refund &amp; Cancellation Policy
        </h1>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Effective Date: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          YOU VS YOU provides digital software and instant-access productivity infrastructure. Please review our refund terms before completing any transaction.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          1. Strict Non-Refundable Policy
        </h2>
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
            All Payments Are Final:
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Once a payment has been processed and funds are deducted or debited from your account, all fees are strictly and completely <strong>non-refundable</strong>.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Because premium capabilities and algorithmic telemetry are provisioned instantly upon transaction completion, we do not offer refunds, reversals, or chargebacks for change of mind, perceived lack of utility, accidental purchase, or unused days in a billing period.
          </p>
        </div>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          2. Platform Discontinuation &amp; Closure Policy
        </h2>
        <div
          className="p-5 rounded-2xl border space-y-3"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
            No Refunds Upon Service Closure:
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            The company retains the absolute and sole right to modify, suspend, or permanently terminate and shut down the website and services at any time, with or without prior notification.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Even if a user currently maintains an active, ongoing, or prepaid subscription at the time of site closure or service termination, <strong>no refunds, prorated balances, or monetary compensation</strong> will be issued or owed.
          </p>
        </div>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          3. Subscription Cancellation
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          You may cancel future renewals of your subscription at any time via your Account Settings. Upon cancellation, your access remains valid until the conclusion of the current prepaid billing period. Cancelling a subscription stops subsequent charges but does not grant a refund for any past or current charges.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          4. Rare Exceptions (Technical Errors)
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          The only circumstance under which a refund review may be entertained is in the event of an undisputed duplicate transaction caused by a payment gateway technical anomaly (i.e., multiple charges for the same invoice within minutes).
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Such claims must be reported within 48 hours of occurrence with payment transaction IDs.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          5. Billing Support
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          For any billing inquiries or concerns, please contact our support desk:{" "}
          <a
            href="mailto:rahul.business940@gmail.com"
            className="hover:underline transition-colors font-medium"
            style={{ color: "var(--accent)" }}
          >
            rahul.business940@gmail.com
          </a>
        </p>
      </div>
    </PageTransition>
  );
}
