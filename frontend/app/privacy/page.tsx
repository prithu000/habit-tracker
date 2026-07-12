import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Privacy Policy | YOU VS YOU",
  description: "Privacy Policy for YOU VS YOU.",
};

export default function PrivacyPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-white">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-8">
          Privacy Policy
        </h1>
        
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Effective Date: {new Date().toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Welcome to YOU VS YOU.
        </p>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We respect your privacy and are committed to protecting your personal information.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Information We Collect
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We may collect:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Name</li>
          <li>Email address</li>
          <li>Google account profile (when signing in with Google)</li>
          <li>Habit tracking data</li>
          <li>Productivity analytics</li>
          <li>Device/browser information</li>
          <li>Login timestamps</li>
          <li>Payment metadata</li>
        </ul>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We never store your card information.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Payments are processed securely by Razorpay.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Why We Collect Data
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We use your information to:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Create your account</li>
          <li>Authenticate users</li>
          <li>Synchronize habit data</li>
          <li>Calculate scores</li>
          <li>Generate reports</li>
          <li>Send reminders</li>
          <li>Improve the platform</li>
          <li>Provide customer support</li>
        </ul>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Google Sign-In
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          If you choose Google Sign-In:
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We only access basic profile information required for authentication.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We never access Gmail, Drive, Photos or any other Google services.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Payments
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Payments are securely processed using Razorpay.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          YOU VS YOU never stores:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Card Numbers</li>
          <li>CVV</li>
          <li>Bank Credentials</li>
          <li>UPI PIN</li>
        </ul>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Cookies
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          We may use cookies for:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Login sessions</li>
          <li>Security</li>
          <li>Performance</li>
          <li>Analytics</li>
        </ul>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Data Security
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Industry standard security practices are used to protect user information.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          User Rights
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Users may:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Update profile</li>
          <li>Delete account</li>
          <li>Request information</li>
          <li>Contact support</li>
        </ul>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Contact
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Email: <a href="mailto:prithumaheshwari@gmail.com" className="text-forge-400 hover:text-forge-300 transition-colors">prithumaheshwari@gmail.com</a>
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Website: <a href="https://youvsyou.site" target="_blank" rel="noopener noreferrer" className="text-forge-400 hover:text-forge-300 transition-colors">https://youvsyou.site</a>
        </p>
      </div>
    </PageTransition>
  );
}
