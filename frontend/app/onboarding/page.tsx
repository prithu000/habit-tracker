"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [identityStatement, setIdentityStatement] = useState("");
  const [timePreference, setTimePreference] = useState("morning");
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch (e) {
      setTimezone("UTC");
    }
    
    // Redirect if already onboarded
    if (user?.onboarding_completed) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleComplete = async () => {
    if (!identityStatement.trim()) {
      toast.error("Identity statement is required.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/users/me/onboarding/complete/", {
        identity_statement: identityStatement,
        time_preference: timePreference,
        timezone: timezone,
      });

      updateUser({ onboarding_completed: true, identity_statement: identityStatement });
      toast.success("Welcome to YOU VS YOU.");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || "Failed to complete onboarding.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-10"
          >
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 rounded-full bg-forge-500/10 text-forge-400 text-xs font-semibold mb-4 tracking-widest uppercase">
                Step 1 of 2
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">Who are you becoming?</h1>
              <p className="text-muted-foreground">
                YOU VS YOU is not a habit tracker. It is an operating system for your identity.
                Every task you complete is proof that you are this person.
              </p>
            </div>

            <div className="space-y-4 mb-10">
              <label className="block text-sm font-medium text-foreground mb-2">
                I am the type of person who...
              </label>
              <textarea
                value={identityStatement}
                onChange={(e) => setIdentityStatement(e.target.value)}
                placeholder="e.g. shows up every day, no matter what."
                className="forge-input h-32 resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50"
              />
            </div>

            <button
              onClick={() => {
                if (!identityStatement.trim()) {
                  toast.error("Please set an identity statement.");
                  return;
                }
                setStep(2);
              }}
              className="btn-forge w-full py-3 text-lg"
            >
              Continue
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-10"
          >
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 rounded-full bg-forge-500/10 text-forge-400 text-xs font-semibold mb-4 tracking-widest uppercase">
                Step 2 of 2
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">When do you work best?</h1>
              <p className="text-muted-foreground">
                We&apos;ll use this to optimize your routines and reminders.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-10">
              {[
                { id: "morning", label: "Morning", icon: "🌅" },
                { id: "evening", label: "Evening", icon: "🌙" },
              ].map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => setTimePreference(pref.id)}
                  className={`p-6 rounded-xl border flex flex-col items-center gap-3 transition-all ${
                    timePreference === pref.id
                      ? "border-forge-500 bg-forge-500/10 shadow-[0_0_15px_rgba(98,84,248,0.2)]"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <span className="text-3xl">{pref.icon}</span>
                  <span className="font-medium">{pref.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="btn-ghost flex-1 py-3"
              >
                Back
              </button>
              <button
                onClick={handleComplete}
                disabled={isLoading}
                className="btn-forge flex-[2] py-3 text-lg"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  "Enter YOU VS YOU"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
