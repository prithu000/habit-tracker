"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types/api";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: responseEnvelope } = await api.post<ApiResponse<AuthResponse>>("/auth/login/", {
        email,
        password,
      });

      const authData = responseEnvelope.data;
      setAuth(authData.user, { access: authData.access, refresh: authData.refresh });
      
      toast.success("Welcome back to YOU VS YOU.");
      
      if (!authData.user.onboarding_completed) {
        router.push("/onboarding");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("LOGIN ERROR DETAILS:", {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        configUrl: err.config?.url,
        configBaseUrl: err.config?.baseURL,
      });
      const errorMsg = err.response?.data?.error?.message || "Invalid credentials.";
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
      className="glass-card p-8"
    >
      <div className="mb-6 text-center">
        <h2 className="text-xl font-semibold">Sign in</h2>
        <p className="text-sm text-muted-foreground mt-1">Enter your details to continue.</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
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
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
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
            "Sign In"
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-forge-400 hover:text-forge-300 font-medium transition-colors">
          Create one
        </Link>
      </div>
    </motion.div>
  );
}
