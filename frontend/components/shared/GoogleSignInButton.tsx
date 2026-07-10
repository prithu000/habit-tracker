"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types/api";
import { toast } from "react-hot-toast";
import { AlertTriangle } from "lucide-react";

declare global {
  interface Window {
    google?: any;
    __google_gis_initialized?: boolean;
    __google_gis_init_count?: number;
    __google_gis_render_count?: number;
  }
}

export function GoogleSignInButton({ label = "Continue with Google" }: { label?: string }) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);
  const [originError, setOriginError] = useState<string | null>(null);
  
  const isInitializedRef = useRef(false);
  const isRenderedRef = useRef(false);
  const buttonDivRef = useRef<HTMLDivElement>(null);

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  const handleGoogleResponse = async (response: any) => {
    const isDev = process.env.NODE_ENV === "development";
    if (isDev) {
      console.log("🔍 [GIS Diagnostics] Credential Callback Executed! Token length:", response?.credential?.length);
    }

    if (!response || !response.credential) {
      toast.error("Failed to receive Google credentials.");
      return;
    }
    setIsLoading(true);
    try {
      if (isDev) {
        console.log("🔍 [GIS Diagnostics] Sending POST /api/v1/auth/google/...");
      }
      const { data: responseEnvelope } = await api.post<ApiResponse<AuthResponse>>("/auth/google/", {
        credential: response.credential,
      });

      const authData = responseEnvelope.data;
      if (isDev) {
        console.log("✅ [GIS Diagnostics] Backend Verification Success! User:", authData.user.email);
        console.log("✅ [GIS Diagnostics] JWT Access Token Issued:", authData.access ? "YES (Valid)" : "NO");
      }
      setAuth(authData.user, { access: authData.access, refresh: authData.refresh });
      useAuthStore.getState().setHasHydrated(true);
      toast.success(`🌐 Google OAuth Verified! Welcome, ${authData.user.display_name || "User"}.`);

      const targetPath = authData.user.onboarding_completed ? "/dashboard" : "/onboarding";
      router.replace(targetPath);
    } catch (err: any) {
      console.error("GOOGLE OAUTH ERROR:", err);
      toast.error(err.userMessage || err.response?.data?.error?.message || err.response?.data?.detail || "Unable to sign in with Google. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const isDev = process.env.NODE_ENV === "development";
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const AUTHORIZED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"];

    // Requirement 3: Verify Google Cloud compatibility & report mismatch
    if (isDev && currentOrigin) {
      const isAuthorized = AUTHORIZED_ORIGINS.includes(currentOrigin);
      if (!isAuthorized) {
        const msg = `Origin Mismatch: ${currentOrigin} is NOT in Authorized JavaScript Origins (${AUTHORIZED_ORIGINS.join(", ")}).`;
        setOriginError(msg);
        console.error("🚨 [GIS Diagnostics] " + msg);
      } else {
        console.log("✅ [GIS Diagnostics] Runtime Origin Authorized:", currentOrigin);
      }
      console.log("🔍 [GIS Diagnostics] Client ID:", CLIENT_ID);
      console.log("🔍 [GIS Diagnostics] Already Initialized:", window.__google_gis_initialized || isInitializedRef.current);
    }

    let scriptElement: HTMLScriptElement | null = null;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id || !buttonDivRef.current) return;

      // Requirement 1: Ensure initialize() executes exactly once using useRef guard & global state
      if (!window.__google_gis_initialized && !isInitializedRef.current) {
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.__google_gis_initialized = true;
        isInitializedRef.current = true;
        window.__google_gis_init_count = (window.__google_gis_init_count || 0) + 1;
        if (isDev) {
          console.log(`✅ [GIS Diagnostics] google.accounts.id.initialize() executed. Total calls: ${window.__google_gis_init_count}`);
        }
      } else if (isDev) {
        console.log("⏭️ [GIS Diagnostics] Skipping duplicate initialize() call.");
      }

      // Requirement 1: Ensure renderButton() executes exactly once per DOM node & prevent duplicate rendering
      if (!isRenderedRef.current && buttonDivRef.current) {
        buttonDivRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(buttonDivRef.current, {
          theme: "filled_black",
          size: "large",
          shape: "pill",
          width: buttonDivRef.current.clientWidth || 360,
          text: "continue_with",
        });
        isRenderedRef.current = true;
        window.__google_gis_render_count = (window.__google_gis_render_count || 0) + 1;
        if (isDev) {
          console.log(`✅ [GIS Diagnostics] google.accounts.id.renderButton() executed. Total calls: ${window.__google_gis_render_count}`);
        }
      }
    };

    if (window.google?.accounts?.id) {
      setupGoogle();
    } else {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]') as HTMLScriptElement;
      if (existingScript) {
        existingScript.addEventListener("load", setupGoogle);
      } else {
        scriptElement = document.createElement("script");
        scriptElement.src = "https://accounts.google.com/gsi/client";
        scriptElement.async = true;
        scriptElement.defer = true;
        scriptElement.onload = setupGoogle;
        document.head.appendChild(scriptElement);
      }
    }

    // Requirement 1: Proper cleanup for dynamically injected scripts and refs
    return () => {
      isRenderedRef.current = false;
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-3">
      {originError && (
        <div className="w-full p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2 text-left">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <div>
            <div className="font-bold">Developer Error: Origin Mismatch</div>
            <div className="text-[11px] text-red-300/80 mt-0.5">{originError}</div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-full bg-zinc-900 border border-zinc-700 text-white text-xs font-semibold">
          <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Verifying with Google Identity...</span>
        </div>
      ) : (
        <div ref={buttonDivRef} className="w-full flex justify-center min-h-[40px]" />
      )}
    </div>
  );
}
