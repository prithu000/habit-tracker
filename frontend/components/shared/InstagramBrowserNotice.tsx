"use client";

import React, { useState, useEffect } from "react";
import { ExternalLink, Copy, Check, Info, Compass, Smartphone, X } from "lucide-react";
import { toast } from "react-hot-toast";
import {
  isInstagramBrowser,
  getMobilePlatform,
  openInExternalBrowser,
  copyToClipboard,
  MobilePlatform,
} from "@/lib/inAppBrowser";

interface InstagramBrowserNoticeProps {
  variant?: "card" | "banner";
  className?: string;
  onOpenAttempt?: () => void;
  dismissible?: boolean;
}

export function InstagramBrowserNotice({
  variant = "card",
  className = "",
  onOpenAttempt,
  dismissible = true,
}: InstagramBrowserNoticeProps) {
  const [isInstagram, setIsInstagram] = useState(false);
  const [platform, setPlatform] = useState<MobilePlatform>("other");
  const [hasCopied, setHasCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Run client-side to prevent SSR hydration mismatches
    setIsInstagram(isInstagramBrowser());
    setPlatform(getMobilePlatform());
  }, []);

  if (!isInstagram || isDismissed) {
    return null;
  }

  const handleOpenBrowser = () => {
    onOpenAttempt?.();
    setShowInstructions(true);

    const result = openInExternalBrowser();

    if (result.platform === "android") {
      toast.success("Attempting to open in your default browser...", { duration: 3500 });
    } else if (result.platform === "ios") {
      toast("Please tap ••• in the top right to Open in Safari", {
        icon: "↗️",
        duration: 4000,
      });
    } else {
      toast.success("Opening in browser...", { duration: 3000 });
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setHasCopied(true);
      toast.success("Link copied! Paste it into your browser.", { duration: 3000 });
      setTimeout(() => setHasCopied(false), 3000);
    } else {
      toast.error("Unable to copy automatically. Please copy the URL from Instagram menu.");
    }
  };

  // Compact Banner Variant (e.g. for top of Auth Layout)
  if (variant === "banner") {
    return (
      <div
        className={`w-full p-3.5 rounded-xl border text-left transition-all ${className}`}
        style={{
          background: "var(--surface-raised, rgba(0,0,0,0.03))",
          borderColor: "var(--border, rgba(0,0,0,0.1))",
        }}
      >
        <div className="flex items-start gap-2.5">
          <Info
            className="w-4 h-4 shrink-0 mt-0.5"
            style={{ color: "var(--accent, #2C5F2A)" }}
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold" style={{ color: "var(--fg)" }}>
              Instagram in-app browser detected
            </p>
            <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
              For Google Sign-In, please open this page in your browser.
            </p>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleOpenBrowser}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-opacity hover:opacity-90 active:scale-95"
                style={{
                  background: "var(--accent, #2C5F2A)",
                  color: "var(--accent-fg, #ffffff)",
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Browser</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                style={{
                  borderColor: "var(--border)",
                  color: "var(--fg-muted)",
                }}
              >
                {hasCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {dismissible && (
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss notice"
              className="shrink-0 p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Full Card Variant (e.g. for Google Sign-In button replacement inside form)
  return (
    <div
      className={`w-full p-4 rounded-2xl border text-left flex flex-col gap-3.5 ${className}`}
      style={{
        background: "var(--surface-raised, rgba(0,0,0,0.03))",
        borderColor: "var(--border, rgba(0,0,0,0.1))",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
          style={{
            background: "var(--accent-subtle, rgba(44,95,42,0.1))",
            color: "var(--accent, #2C5F2A)",
          }}
        >
          <Compass className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--fg)" }}>
            For Smooth Experience
          </h4>
          <p className="text-sm font-medium mt-1 leading-snug" style={{ color: "var(--fg)" }}>
            Please open this page in your browser.
          </p>
          <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--fg-muted)" }}>
            To Enable All Features
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <button
          type="button"
          onClick={handleOpenBrowser}
          className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: "var(--accent, #2C5F2A)",
            color: "var(--accent-fg, #ffffff)",
          }}
        >
          <ExternalLink className="w-4 h-4 shrink-0" />
          <span>Open in Browser</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{
            borderColor: "var(--border)",
            color: "var(--fg)",
          }}
        >
          {hasCopied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy Link</span>
            </>
          )}
        </button>
      </div>

      {/* Clear platform-specific fallback instructions */}
      <div
        className="mt-1 p-3 rounded-xl border text-xs leading-relaxed"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-subtle, var(--border))",
          color: "var(--fg-muted)",
        }}
      >
        <div className="flex items-center gap-1.5 font-semibold mb-1" style={{ color: "var(--fg)" }}>
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
          <span>Manual Step-by-Step Instructions:</span>
        </div>

        {platform === "ios" ? (
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              Tap the <strong>•••</strong> (three dots) in the <strong>top-right corner</strong> of
              Instagram.
            </li>
            <li>
              Select <strong>&quot;Open in Safari&quot;</strong> or <strong>&quot;Open in external browser&quot;</strong>.
            </li>
            <li>Your Google Sign-In will load and authenticate normally.</li>
          </ol>
        ) : platform === "android" ? (
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              Tap the <strong>&quot;Open in Browser&quot;</strong> button above to launch your default
              browser.
            </li>
            <li>
              If it does not open automatically, tap the <strong>⋮</strong> (three vertical dots) in the{" "}
              <strong>top-right corner</strong> of Instagram.
            </li>
            <li>
              Select <strong>&quot;Open in external browser&quot;</strong> (or your default browser).
            </li>
          </ol>
        ) : (
          <ol className="list-decimal list-inside space-y-1 pl-1">
            <li>
              Tap <strong>&quot;Copy Link&quot;</strong> above.
            </li>
            <li>Open your preferred browser (Safari, Chrome, Firefox, Edge).</li>
            <li>Paste the URL into the address bar to continue with Google Sign-In.</li>
          </ol>
        )}
      </div>
    </div>
  );
}
