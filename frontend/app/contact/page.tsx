import React from "react";
import type { Metadata } from "next";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Mail, Globe, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact | YOU VS YOU",
  description: "Contact information for YOU VS YOU.",
};

export default function ContactPage() {
  return (
    <PageTransition className="max-w-4xl mx-auto px-6 py-12 md:py-20">
      <div className="space-y-8">
        <div>
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-display font-black tracking-tight mb-3"
            style={{ color: "var(--fg)" }}
          >
            Contact Us
          </h1>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Need help or have questions regarding YOU VS YOU? We are here to help.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            className="p-5 rounded-2xl border space-y-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                Support Email
              </h2>
            </div>
            <p className="text-sm">
              <a
                href="mailto:rahul.business940@gmail.com"
                className="hover:underline font-medium transition-colors"
                style={{ color: "var(--accent)" }}
              >
                rahul.business940@gmail.com
              </a>
            </p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Typical response time: 24–48 hours
            </p>
          </div>

          <div
            className="p-5 rounded-2xl border space-y-2"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4" style={{ color: "var(--accent)" }} />
              <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
                Official Platform
              </h2>
            </div>
            <p className="text-sm">
              <a
                href="https://youvsyou.site"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline font-medium transition-colors"
                style={{ color: "var(--accent)" }}
              >
                https://youvsyou.site
              </a>
            </p>
            <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
              Access your dashboard from any browser
            </p>
          </div>
        </div>

        <div
          className="p-5 rounded-2xl border space-y-2"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: "var(--accent)" }} />
            <h2 className="text-sm font-semibold" style={{ color: "var(--fg)" }}>
              Operational Hours
            </h2>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            Monday – Saturday: 10:00 AM – 6:00 PM IST
          </p>
          <p className="text-xs" style={{ color: "var(--fg-muted)" }}>
            Direct all enterprise or critical requests to rahul.business940@gmail.com.
          </p>
        </div>
      </div>
    </PageTransition>
  );
}
