"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types/api";
import { toast } from "react-hot-toast";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== passwordConfirm) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);

    try {
      const { data: responseEnvelope } = await api.post<ApiResponse<AuthResponse>>("/auth/register/", {
        email,
        display_name: displayName,
        password,
        password_confirm: passwordConfirm,
      });

      const authData = responseEnvelope.data;
      setAuth(authData.user, { access: authData.access, refresh: authData.refresh });
      useAuthStore.getState().setHasHydrated(true);
      toast.success("Account created successfully!");
      router.replace("/onboarding");
    } catch (err: any) {
      console.error("REGISTRATION ERROR DETAILS:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        configUrl: err.config?.url,
        configBaseUrl: err.config?.baseURL,
      });
      const errorData = err.response?.data?.error;
      let errorMsg = err.userMessage || errorData?.message || "Something went wrong. Please try again later.";
      
      if (errorData?.errors && Object.keys(errorData.errors).length > 0) {
        const firstField = Object.keys(errorData.errors)[0];
        const rawFieldMsg = String(errorData.errors[firstField][0] || "");
        if (rawFieldMsg.toLowerCase().includes("exists") || rawFieldMsg.toLowerCase().includes("already")) {
          errorMsg = "An account with this email already exists.";
        } else {
          errorMsg = rawFieldMsg;
        }
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="glass-card p-6 sm:p-8"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-display font-bold tracking-tight">Welcome to YOU VS YOU.</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Build the identity you&apos;re proud to become.<br />
          <span className="text-zinc-600 text-xs">Your future starts with today&apos;s first action.</span>
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="forge-input"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="displayName">Display Name (Optional)</label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="forge-input"
            placeholder="How should we call you?"
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="forge-input"
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="passwordConfirm">Confirm Password</label>
          <input
            id="passwordConfirm"
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            required
            minLength={8}
            className="forge-input"
            placeholder="••••••••"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn-forge w-full mt-6"
        >
          {isLoading ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Begin My Journey"
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-zinc-800" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-muted-foreground font-semibold">Or continue with</span>
        </div>
      </div>

      <GoogleSignInButton label="Sign up with Google" />

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-forge-400 hover:text-forge-300 font-medium transition-colors">
          Sign in
        </Link>
      </div>
    </motion.div>
  );
}
