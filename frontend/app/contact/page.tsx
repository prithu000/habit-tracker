import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Contact | YOU VS YOU",
  description: "Contact information for YOU VS YOU.",
};

export default function ContactPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-white">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-8">
          Contact Us
        </h1>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Need help?
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Support Email
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          <a href="mailto:prithumaheshwari@gmail.com" className="text-forge-400 hover:text-forge-300 transition-colors">prithumaheshwari@gmail.com</a>
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Website
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          <a href="https://youvsyou.site" target="_blank" rel="noopener noreferrer" className="text-forge-400 hover:text-forge-300 transition-colors">https://youvsyou.site</a>
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Support Hours
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Monday – Saturday<br />
          10:00 AM – 6:00 PM IST
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed mt-4">
          Typical response time:<br />
          24–48 Hours
        </p>
      </div>
    </PageTransition>
  );
}
