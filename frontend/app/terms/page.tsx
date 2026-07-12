import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Terms & Conditions | YOU VS YOU",
  description: "Terms and Conditions for YOU VS YOU.",
};

export default function TermsPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-white">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-8">
          Terms & Conditions
        </h1>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Welcome to YOU VS YOU.
        </p>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          By using this platform you agree to these terms.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Accounts
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Users are responsible for maintaining their own accounts.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Acceptable Use
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Do not:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Abuse the platform</li>
          <li>Attempt unauthorized access</li>
          <li>Upload malicious content</li>
          <li>Reverse engineer services</li>
        </ul>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Subscriptions
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Premium subscriptions unlock additional features.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Subscription duration begins immediately after successful payment.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Payments
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Payments are processed through Razorpay.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Intellectual Property
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          All branding, software, graphics and content belong to YOU VS YOU.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Limitation of Liability
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          YOU VS YOU is provided as-is.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We are not liable for indirect damages or data loss.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Changes
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          These terms may change over time.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Continued use indicates acceptance.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Contact
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          <a href="mailto:prithumaheshwari@gmail.com" className="text-forge-400 hover:text-forge-300 transition-colors">prithumaheshwari@gmail.com</a>
        </p>
      </div>
    </PageTransition>
  );
}
