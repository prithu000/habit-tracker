"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { AuthResponse, ApiResponse } from "@/types/api";
import { toast } from "react-hot-toast";
import { GoogleSignInButton } from "@/components/shared/GoogleSignInButton";

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
      useAuthStore.getState().setHasHydrated(true);

      toast.success("Welcome back to YOU VS YOU.");

      const targetPath = authData.user.onboarding_completed ? "/dashboard" : "/onboarding";
      router.replace(targetPath);
    } catch (err: any) {
      const errorMsg =
        err.userMessage || err.response?.data?.error?.message || "Incorrect password.";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-7">
        <h2
          className="text-2xl font-bold tracking-tight"
          style={{ color: "var(--fg)" }}
        >
          Welcome back.
        </h2>
        <p
          className="text-sm mt-1.5 leading-relaxed"
          style={{ color: "var(--fg-muted)" }}
        >
          Continue engineering your best self.
        </p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            htmlFor="email"
            style={{ color: "var(--fg-faint)" }}
          >
            Email
          </label>
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

        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wider"
            htmlFor="password"
            style={{ color: "var(--fg-faint)" }}
          >
            Password
          </label>
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
          className="btn-forge w-full mt-5 py-2.5 text-sm"
        >
          {isLoading ? (
            <div
              className="h-4 w-4 border-2 rounded-full animate-spin"
              style={{
                borderColor: "rgba(255,255,255,0.3)",
                borderTopColor: "white",
              }}
            />
          ) : (
            "Continue"
          )}
        </button>
      </form>

      <div className="relative my-6">
        <div
          className="absolute inset-0 flex items-center"
        >
          <span
            className="w-full border-t"
            style={{ borderColor: "var(--border)" }}
          />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span
            className="px-2 text-xs font-medium"
            style={{
              background: "var(--surface)",
              color: "var(--fg-faint)",
            }}
          >
            Or continue with
          </span>
        </div>
      </div>

      <GoogleSignInButton label="Sign in with Google" />

      <div
        className="mt-6 text-center text-sm"
        style={{ color: "var(--fg-muted)" }}
      >
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="font-semibold transition-colors"
          style={{ color: "var(--accent)" }}
        >
          Create one
        </Link>
      </div>
    </div>
  );
}
