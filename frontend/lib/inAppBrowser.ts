/**
 * Utilities for detecting and handling in-app browsers (specifically Instagram and Meta WebViews).
 * Enables breaking out to the user's default external browser (without forcing or assuming Chrome).
 */

export type MobilePlatform = "android" | "ios" | "other";

/**
 * Checks if the current environment is running inside Instagram's in-app browser.
 * Supports URL param preview (e.g. ?test_inapp=instagram or ?test_inapp=ios / android).
 */
export function isInstagramBrowser(customUserAgent?: string): boolean {
  if (typeof window === "undefined" && !customUserAgent) return false;

  // Local/QA preview via URL parameter
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const testParam = params.get("test_inapp");
      if (testParam && ["instagram", "true", "1", "ios", "android"].includes(testParam.toLowerCase())) {
        return true;
      }
    } catch {
      // Ignored
    }
  }

  const ua =
    customUserAgent ||
    (typeof navigator !== "undefined" ? navigator.userAgent || navigator.vendor || "" : "");
  return /Instagram/i.test(ua);
}

/**
 * Checks if the current environment is running inside an in-app WebView (Instagram, Facebook, etc.).
 */
export function isInAppBrowser(customUserAgent?: string): boolean {
  if (typeof window === "undefined" && !customUserAgent) return false;
  const ua =
    customUserAgent ||
    (typeof navigator !== "undefined" ? navigator.userAgent || navigator.vendor || "" : "");
  return /Instagram|FBAN|FBAV|FB_IAB/i.test(ua);
}

/**
 * Detects the client platform: Android, iOS, or other/desktop.
 */
export function getMobilePlatform(customUserAgent?: string): MobilePlatform {
  if (typeof window === "undefined" && !customUserAgent) return "other";

  // Check URL parameter override for previewing specific OS
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const testParam = params.get("test_inapp")?.toLowerCase();
      if (testParam === "ios") return "ios";
      if (testParam === "android") return "android";
    } catch {
      // Ignored
    }
  }

  const ua =
    customUserAgent ||
    (typeof navigator !== "undefined" ? navigator.userAgent || navigator.vendor || "" : "");

  if (/android/i.test(ua)) {
    return "android";
  }

  if (
    /iPad|iPhone|iPod/.test(ua) ||
    (typeof navigator !== "undefined" &&
      navigator.platform === "MacIntel" &&
      navigator.maxTouchPoints > 1)
  ) {
    return "ios";
  }

  return "other";
}

/**
 * Strips development/testing parameters (like test_inapp) from the URL
 * so that when the external browser opens, it runs in normal mode.
 */
export function getCleanTargetUrl(rawUrl?: string): string {
  if (typeof window === "undefined" && !rawUrl) return "";
  const url = rawUrl || (typeof window !== "undefined" ? window.location.href : "");
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("test_inapp");
    return parsed.toString();
  } catch {
    return url.replace(/([?&])test_inapp=[^&]+(&|$)/i, "$1").replace(/\?$/, "").replace(/\?#/, "#");
  }
}

/**
 * Constructs a generic Android Intent URL to launch the user's default web browser.
 * NOTE: Intentionally avoids `package=com.android.chrome` so that the user's
 * configured default browser (Samsung Internet, Firefox, Chrome, Brave, Opera, etc.) is used.
 */
export function buildAndroidIntentUrl(url: string): string {
  const cleanDestination = getCleanTargetUrl(url);
  const scheme = cleanDestination.startsWith("http://") ? "http" : "https";
  // Strip protocol and encode '#' characters in the query/hash to avoid parsing collision with '#Intent;'
  const cleanUrl = cleanDestination.replace(/^https?:\/\//i, "").replace(/#/g, "%23");
  return `intent://${cleanUrl}#Intent;scheme=${scheme};action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;end;`;
}

/**
 * Attempts to launch the external/default browser.
 * - Android: Dispatches a generic Android Intent for default browser handling.
 * - iOS: Triggers window.open attempt (while UI provides native 3-dots guidance).
 * - Other: Opens the URL in a new window/tab.
 */
export function openInExternalBrowser(targetUrl?: string): {
  platform: MobilePlatform;
  success: boolean;
} {
  if (typeof window === "undefined") {
    return { platform: "other", success: false };
  }

  const url = getCleanTargetUrl(targetUrl || window.location.href);
  const platform = getMobilePlatform();

  if (platform === "android") {
    try {
      const intentUrl = buildAndroidIntentUrl(url);
      
      // Method A: Invisible link click (most reliable trigger in WebViews)
      const link = document.createElement("a");
      link.href = intentUrl;
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Method B: Fallback window.location assignment
      setTimeout(() => {
        try {
          window.location.href = intentUrl;
        } catch {
          // Ignored
        }
      }, 100);

      return { platform: "android", success: true };
    } catch (err) {
      console.error("Failed to trigger Android browser intent:", err);
      return { platform: "android", success: false };
    }
  }

  if (platform === "ios") {
    // iOS WKWebView blocks custom scheme breakout unless user taps native menu ("Open in Safari").
    // We attempt window.open just in case, while the UI displays exact 3-dots instructions.
    try {
      window.open(url, "_blank");
    } catch {
      // Ignored
    }
    return { platform: "ios", success: true };
  }

  // Desktop or unknown platform fallback
  try {
    window.open(url, "_blank");
    return { platform: "other", success: true };
  } catch {
    return { platform: "other", success: false };
  }
}

/**
 * Copies a URL or text to the clipboard with robust fallbacks for constrained WebViews.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === "undefined") return false;

  // Modern asynchronous Clipboard API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback for older WebViews without clipboard permission
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}
