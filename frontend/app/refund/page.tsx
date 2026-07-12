import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";

export const metadata: Metadata = {
  title: "Refund Policy | YOU VS YOU",
  description: "Refund and Cancellation Policy for YOU VS YOU.",
};

export default function RefundPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20 text-white">
      <div className="space-y-6">
        <h1 className="text-4xl sm:text-5xl font-display font-black tracking-tight text-white mb-8">
          Refund & Cancellation Policy
        </h1>

        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          YOU VS YOU provides digital subscription services.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Free Trial
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Where applicable, users may use the free trial before purchasing.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Cancellation
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Users may cancel future renewals at any time.
        </p>

        <h2 className="text-2xl font-display font-bold text-white mt-8 mb-4">
          Refund Policy
        </h2>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Since digital premium access is delivered instantly after purchase, completed subscription purchases are generally non-refundable.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Refunds may only be considered for:
        </p>
        <ul className="list-disc list-inside text-zinc-300 text-sm md:text-base leading-relaxed space-y-2 mb-4 ml-4">
          <li>Duplicate payment</li>
          <li>Technical billing errors</li>
          <li>Successful payment without subscription activation</li>
        </ul>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Requests should be submitted within 7 days.
        </p>
        <p className="text-zinc-300 text-sm md:text-base leading-relaxed">
          Approved refunds will be processed through Razorpay.
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
