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
    if (!response || !response.credential) {
      toast.error("Unable to connect. Please try again.");
      return;
    }
    
    setIsLoading(true);
    
    // Premium onboarding flow
    const messages = [
      { text: "Welcome back 👋", delay: 0 },
      { text: "Preparing your Personal Operating System...", delay: 800 },
      { text: "Syncing your routines...", delay: 1600 },
      { text: "Loading your AI Coach...", delay: 2400 },
      { text: "Almost ready...", delay: 3200 },
    ];
    
    const toastId = toast.loading(messages[0].text);
    let currentIndex = 0;
    
    const messageInterval = setInterval(() => {
      currentIndex++;
      if (currentIndex < messages.length) {
        toast.loading(messages[currentIndex].text, { id: toastId });
      }
    }, 800);
    
    try {
      const { data: responseEnvelope } = await api.post<ApiResponse<AuthResponse>>("/auth/google/", {
        credential: response.credential,
      });

      clearInterval(messageInterval);
      const authData = responseEnvelope.data;
      setAuth(authData.user, { access: authData.access, refresh: authData.refresh });
      useAuthStore.getState().setHasHydrated(true);
      
      toast.success(`Welcome to YOU VS YOU.`, { id: toastId, duration: 3000 });

      const targetPath = authData.user.onboarding_completed ? "/dashboard" : "/onboarding";
      router.replace(targetPath);
    } catch (err: any) {
      clearInterval(messageInterval);
      console.error("Sign in error:", err);
      toast.error(err.userMessage || err.response?.data?.error?.message || err.response?.data?.detail || "Unable to sign in. Please try again.", { id: toastId });
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
      }
    }

    let scriptElement: HTMLScriptElement | null = null;

    const setupGoogle = () => {
      if (!window.google?.accounts?.id || !buttonDivRef.current) return;

      // Always initialize to update the callback reference and ensure GIS is ready for this specific component instance
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: handleGoogleResponse,
      });

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
          <span>Setting up your account...</span>
        </div>
      ) : (
        <div ref={buttonDivRef} className="w-full flex justify-center min-h-[40px]" />
      )}
    </div>
  );
}
