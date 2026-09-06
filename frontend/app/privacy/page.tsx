import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Privacy Policy | YOU VS YOU",
  description: "Privacy Policy for YOU VS YOU.",
};

export default function PrivacyPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="space-y-6">
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight mb-8"
          style={{ color: "var(--fg)" }}
        >
          Privacy Policy
        </h1>
        
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Effective Date: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Welcome to YOU VS YOU.
        </p>

        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We respect your privacy and are committed to protecting your personal information.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Information We Collect
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We may collect:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Name</li>
          <li>Email address</li>
          <li>Google account profile (when signing in with Google)</li>
          <li>Habit tracking data</li>
          <li>Productivity analytics</li>
          <li>Device/browser information</li>
          <li>Login timestamps</li>
          <li>Payment metadata</li>
        </ul>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We never store your card information.
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Payments are processed securely by Razorpay.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Why We Collect Data
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We use your information to:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Create your account</li>
          <li>Authenticate users</li>
          <li>Synchronize habit data</li>
          <li>Calculate scores</li>
          <li>Generate reports</li>
          <li>Send reminders</li>
          <li>Improve the platform</li>
          <li>Provide customer support</li>
        </ul>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Google Sign-In
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          If you choose Google Sign-In:
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We only access basic profile information required for authentication.
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We never access Gmail, Drive, Photos or any other Google services.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Payments
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Payments are securely processed using Razorpay.
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          YOU VS YOU never stores:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Card Numbers</li>
          <li>CVV</li>
          <li>Bank Credentials</li>
          <li>UPI PIN</li>
        </ul>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Cookies
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          We may use cookies for:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Login sessions</li>
          <li>Security</li>
          <li>Performance</li>
          <li>Analytics</li>
        </ul>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Data Security
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Industry standard security practices are used to protect user information.
        </p>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          User Rights
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Users may:
        </p>
        <ul className="list-disc list-inside text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4" style={{ color: "var(--fg-muted)" }}>
          <li>Update profile</li>
          <li>Delete account</li>
          <li>Request information</li>
          <li>Contact support</li>
        </ul>

        <h2
          className="text-xl sm:text-2xl font-display font-bold mt-8 mb-4"
          style={{ color: "var(--fg)" }}
        >
          Contact
        </h2>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Email:{" "}
          <a
            href="mailto:rahul.business940@gmail.com"
            className="hover:underline transition-colors font-medium"
            style={{ color: "var(--accent)" }}
          >
            rahul.business940@gmail.com
          </a>
        </p>
        <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
          Website:{" "}
          <a
            href="https://youvsyou.site"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors font-medium"
            style={{ color: "var(--accent)" }}
          >
            https://youvsyou.site
          </a>
        </p>
      </div>
    </PageTransition>
  );
}
