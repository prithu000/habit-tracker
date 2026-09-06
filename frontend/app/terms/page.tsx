import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Terms & Conditions | YOU VS YOU",
  description: "Terms and Conditions for YOU VS YOU.",
};

export default function TermsPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="space-y-6">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight mb-8"
          style={{ color: "var(--fg)" }}
        >
          Terms &amp; Conditions
        </h1>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Effective Date: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Welcome to YOU VS YOU (&ldquo;Platform&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;).
          By accessing or using our platform, services, and software applications, you acknowledge that you have read, understood, and agreed to be bound by the following Terms &amp; Conditions.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          1. Accounts &amp; Security
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Users are responsible for maintaining the confidentiality of their login credentials and account security. You agree to notify us immediately of any unauthorized access or breach of security. YOU VS YOU is not liable for any losses caused by unauthorized use of your account.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          2. Acceptable Use
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          You agree not to:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Abuse, overload, or disrupt the platform infrastructure</li>
          <li>Attempt unauthorized access to our servers, user accounts, or APIs</li>
          <li>Upload malicious code, automated bots, scrapers, or exploits</li>
          <li>Reverse engineer, decompile, or copy the platform architecture or intellectual property</li>
        </ul>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          3. Subscriptions &amp; Strict Non-Refundable Payments
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Premium access is billed on a recurring or term basis through authorized payment processors (including Razorpay).
        </p>
        <div
          className="p-4 rounded-xl border space-y-2"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
            Strict No-Refund Policy:
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            All payments are final. Once funds are deducted or debited for any subscription, service tier, or upgrade, they are completely non-refundable under any circumstances. We do not provide prorated refunds, partial credits, or compensation for unused time, cancellation, or account inactivity.
          </p>
        </div>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          4. Platform Modification, Suspension &amp; Right of Closure
        </h2>
        <div
          className="p-4 rounded-xl border space-y-2"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
            Company Discretion and Service Termination:
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            YOU VS YOU reserves the sole, absolute, and unilateral right to modify, suspend, temporarily disable, or permanently shut down and close the website and all associated services at any time, with or without prior notice, for any reason whatsoever.
          </p>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            In the event that the platform is closed, retired, or discontinued—regardless of whether you currently have an active, ongoing, or prepaid subscription—no refunds, monetary reimbursements, or prorated compensations will be issued or provided. By purchasing a subscription or using the platform, you explicitly acknowledge and agree to this risk and condition.
          </p>
        </div>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          5. Intellectual Property
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          All branding, system architecture, trademarks, graphics, UI assets, algorithmic metrics (including Life Score algorithms), and software code are the exclusive property of YOU VS YOU.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          6. Limitation of Liability
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          YOU VS YOU is provided strictly on an &ldquo;as-is&rdquo; and &ldquo;as-available&rdquo; basis without warranties of any kind. Under no circumstances shall the company, founders, or affiliates be liable for any indirect, incidental, punitive, or consequential damages resulting from platform downtime, service discontinuation, or data loss.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          7. Policy Modifications
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We reserve the right to revise these Terms &amp; Conditions at our discretion. Your continued use of the platform constitutes active acceptance of the updated terms.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          8. Contact
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          If you have questions regarding these Terms &amp; Conditions, contact us at:{" "}
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
