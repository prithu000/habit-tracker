"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { InstagramBrowserNotice } from "@/components/shared/InstagramBrowserNotice";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 30% 20%, var(--accent-subtle) 0%, transparent 50%), radial-gradient(circle at 70% 80%, var(--accent-subtle) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6 py-12">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link href="/" className="inline-flex items-center gap-3 group mb-6">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "var(--accent)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white">
                <path
                  d="M12 2L2 7L12 12L22 7L12 2Z"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 17L12 22L22 17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M2 12L12 17L22 12"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-left">
              <p
                className="text-sm font-bold tracking-tight"
                style={{ color: "var(--fg)" }}
              >
                YOU VS YOU
              </p>
              <p
                className="text-[10px] font-medium tracking-widest uppercase"
                style={{ color: "var(--fg-faint)" }}
              >
                Personal OS
              </p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow-hover)",
          }}
        >
          <InstagramBrowserNotice variant="banner" className="mb-6" />
          {children}
        </div>

        {/* Footer */}
        <p
          className="text-center text-xs mt-6"
          style={{ color: "var(--fg-faint)" }}
        >
          Discipline equals freedom.
        </p>
      </div>
    </div>
  );
}
