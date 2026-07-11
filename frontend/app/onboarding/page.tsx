"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/lib/stores/authStore";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { WelcomeTransition } from "@/components/shared/WelcomeTransition";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [identityStatement, setIdentityStatement] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [timePreference, setTimePreference] = useState("morning");
  const [timezone, setTimezone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  
  // Step-specific validation errors
  const [step1Errors, setStep1Errors] = useState<{name?: string; identity?: string}>({});
  const [step2Errors, setStep2Errors] = useState<{time?: string}>({});

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
    
    // Set display name from user if available
    if (user?.display_name) {
      setDisplayName(user.display_name);
    }
  }, [user, router]);

  // Validate Step 1 fields only
  const validateStep1 = (): boolean => {
    const errors: {name?: string; identity?: string} = {};
    
    if (!displayName.trim()) {
      errors.name = "Name is required";
    } else if (displayName.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }
    
    if (!identityStatement.trim()) {
      errors.identity = "Identity statement is required";
    } else if (identityStatement.trim().length < 10) {
      errors.identity = "Identity statement must be at least 10 characters";
    }
    
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  // Validate Step 2 fields only
  const validateStep2 = (): boolean => {
    const errors: {time?: string} = {};
    
    if (!timePreference) {
      errors.time = "Please select your preferred work time";
    }
    
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Next = () => {
    if (validateStep1()) {
      // Clear step 1 errors and move to step 2
      setStep1Errors({});
      setStep(2);
    }
  };

  const handleStep2Back = () => {
    // Clear step 2 errors when going back
    setStep2Errors({});
    setStep(1);
  };

  const handleComplete = async () => {
    // Validate step 2 before submission
    if (!validateStep2()) {
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/users/me/onboarding/complete/", {
        display_name: displayName,
        identity_statement: identityStatement,
        time_preference: timePreference,
        timezone: timezone,
      });

      updateUser({ 
        onboarding_completed: true, 
        identity_statement: identityStatement,
        display_name: displayName
      });
      
      // Show welcome transition screen instead of immediate redirect
      setShowTransition(true);
    } catch (error: any) {
      toast.error(error.userMessage || error.response?.data?.error?.message || "Failed to complete onboarding. Please try again.");
      setIsLoading(false);
    }
  };

  // Show transition screen if onboarding completed
  if (showTransition) {
    return <WelcomeTransition />;
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="glass-card p-6 sm:p-8 md:p-10"
          >
            <div className="text-center mb-10">
              <div className="inline-block px-3 py-1 rounded-full bg-forge-500/10 text-forge-400 text-xs font-semibold mb-4 tracking-widest uppercase">
                Step 1 of 2
              </div>
              <h1 className="text-3xl font-display font-bold mb-4">Welcome to YOU VS YOU.</h1>
              <p className="text-muted-foreground leading-relaxed text-sm">
                You don&apos;t compete against anyone.<br />
                <span className="text-white font-semibold">You compete against the person you were yesterday.</span><br /><br />
                Every completed habit... Every workout... Every study session... Every focused minute...<br />
                <span className="text-forge-400 font-bold">becomes part of your identity.</span><br /><br />
                Let&apos;s begin engineering your best self.
              </p>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  What should we call you?
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="forge-input text-lg"
                />
                {step1Errors.name && (
                  <p className="text-red-400 text-sm mt-2">{step1Errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  I am the type of person who...
                </label>
                <textarea
                  value={identityStatement}
                  onChange={(e) => setIdentityStatement(e.target.value)}
                  placeholder="e.g. shows up every day, no matter what."
                  className="forge-input h-32 resize-none text-lg leading-relaxed placeholder:text-muted-foreground/50"
                />
                {step1Errors.identity && (
                  <p className="text-red-400 text-sm mt-2">{step1Errors.identity}</p>
                )}
              </div>
            </div>

            <button
              onClick={handleStep1Next}
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
            className="glass-card p-6 sm:p-8 md:p-10"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-8 sm:mb-10">
              {[
                { id: "morning", label: "Morning", icon: "🌅" },
                { id: "afternoon", label: "Afternoon", icon: "☀️" },
                { id: "evening", label: "Evening", icon: "🌆" },
                { id: "night", label: "Night", icon: "🌙" },
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

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                onClick={handleStep2Back}
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
                  "Begin Journey"
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
