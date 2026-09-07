"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Copy, Check, Smartphone, X, Compass } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  getMobilePlatform,
  openInExternalBrowser,
  copyToClipboard,
  getCleanTargetUrl,
  MobilePlatform,
} from "@/lib/inAppBrowser";

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

interface InstagramBrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramBrowserModal({ isOpen, onClose }: InstagramBrowserModalProps) {
  const [platform, setPlatform] = useState<MobilePlatform>("other");
  const [activePlatform, setActivePlatform] = useState<"ios" | "android">("ios");
  const [hasCopied, setHasCopied] = useState(false);

  useEffect(() => {
    const detectedPlatform = getMobilePlatform();
    setPlatform(detectedPlatform);
    if (detectedPlatform === "android") {
      setActivePlatform("android");
    } else {
      setActivePlatform("ios");
    }
  }, []);

  if (!isOpen) return null;

  const handleOpenBrowser = () => {
    const result = openInExternalBrowser();

    if (result.platform === "android") {
      toast.success("Opening in default browser...", { duration: 3500 });
    } else if (result.platform === "ios") {
      toast("Tap ••• at top-right to Open in Safari", {
        icon: "↗️",
        duration: 4000,
      });
    } else {
      toast.success("Opening clean login page in external browser...", { duration: 3000 });
    }
  };

  const handleCopyLink = async () => {
    const cleanUrl = getCleanTargetUrl();
    const success = await copyToClipboard(cleanUrl);
    if (success) {
      setHasCopied(true);
      toast.success("Link copied! Paste it into your browser.", { duration: 3000 });
      setTimeout(() => setHasCopied(false), 3000);
    } else {
      toast.error("Please copy the URL from Instagram menu.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-sm rounded-2xl p-5 border text-left shadow-2xl animate-in zoom-in-95 duration-200"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--fg)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Google Logo */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
            style={{
              background: "var(--surface-raised)",
              borderColor: "var(--border)",
            }}
          >
            <GoogleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold tracking-tight leading-tight" style={{ color: "var(--fg)" }}>
              Open in External Browser
            </h3>
            <p className="text-[11px] font-medium mt-0.5" style={{ color: "var(--fg-faint)" }}>
              Required for Google Sign-In
            </p>
          </div>
        </div>

        {/* Explanation Message */}
        <p className="text-xs leading-relaxed mb-4" style={{ color: "var(--fg-muted)" }}>
          Google restricts authentication inside Instagram&apos;s embedded screen for your security.
          Please open this page in your normal browser to sign in.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mb-4">
          <button
            type="button"
            onClick={handleOpenBrowser}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              background: "var(--accent)",
              color: "var(--accent-fg, #ffffff)",
            }}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span>Open in Browser</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2 px-3.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            style={{
              borderColor: "var(--border)",
              color: "var(--fg)",
            }}
          >
            {hasCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Page Link</span>
              </>
            )}
          </button>
        </div>

        {/* Step-by-Step Fallback Instructions */}
        <div
          className="p-3 rounded-xl border text-[11px] leading-relaxed"
          style={{
            background: "var(--surface-raised)",
            borderColor: "var(--border)",
          }}
        >
          <div className="flex items-center justify-between font-semibold mb-2" style={{ color: "var(--fg)" }}>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 shrink-0" />
              <span>How to open ({activePlatform === "ios" ? "iPhone" : "Android"}):</span>
            </div>
            <div className="flex items-center gap-1 bg-black/5 dark:bg-white/10 p-0.5 rounded-lg text-[10px]">
              <button
                type="button"
                onClick={() => setActivePlatform("ios")}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  activePlatform === "ios"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                iOS
              </button>
              <button
                type="button"
                onClick={() => setActivePlatform("android")}
                className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                  activePlatform === "android"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                Android
              </button>
            </div>
          </div>

          {activePlatform === "ios" ? (
            <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                Tap the <strong>•••</strong> (three dots) in the <strong>top-right corner</strong> of
                Instagram.
              </li>
              <li>
                Tap <strong>&quot;Open in Safari&quot;</strong> (or &quot;Open in external browser&quot;).
              </li>
              <li>Google Sign-In will load and authenticate normally.</li>
            </ol>
          ) : (
            <ol className="list-decimal list-inside space-y-1 text-zinc-600 dark:text-zinc-400">
              <li>
                Tap <strong>&quot;Open in Browser&quot;</strong> above to launch your default browser.
              </li>
              <li>
                Or tap the <strong>⋮</strong> (three vertical dots) in the{" "}
                <strong>top-right corner</strong> of Instagram.
              </li>
              <li>
                Tap <strong>&quot;Open in external browser&quot;</strong>.
              </li>
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Standard In-App Notice presentation inside GoogleSignInButton.
 */
interface InstagramGoogleSignInProps {
  label?: string;
  onOpenModal?: () => void;
}

export function InstagramGoogleSignIn({
  label = "Continue with Google",
  onOpenModal,
}: InstagramGoogleSignInProps) {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    // On Android, attempt to trigger default browser intent directly on tap
    openInExternalBrowser();
    setShowModal(true);
    onOpenModal?.();
  };

  return (
    <div className="w-full flex flex-col items-center">
      <button
        type="button"
        onClick={handleClick}
        className="w-full h-11 px-4 rounded-full border flex items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:border-zinc-400 active:scale-[0.99] group cursor-pointer"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--fg)",
        }}
      >
        <GoogleIcon className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium tracking-tight" style={{ color: "var(--fg)" }}>
          {label}
        </span>
        <span
          className="ml-auto text-[11px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 transition-opacity group-hover:opacity-100 opacity-80"
          style={{
            background: "var(--accent-subtle)",
            color: "var(--accent)",
          }}
        >
          <ExternalLink className="w-3 h-3" />
          <span>Browser</span>
        </span>
      </button>

      <p
        className="text-[11px] text-center mt-2 leading-relaxed"
        style={{ color: "var(--fg-faint)" }}
      >
        For Google Sign-In, please open this page in your browser.
      </p>

      <InstagramBrowserModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
