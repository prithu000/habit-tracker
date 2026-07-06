"use client";

import React, { useState, useEffect } from "react";
import { useMotivation } from "@/lib/queries/useOS";
import {
  Sparkles,
  Flame,
  Volume2,
  VolumeX,
  Heart,
  Zap,
  ArrowRight,
  BrainCircuit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils/cn";

export function DontGiveUpBanner() {
  const { data, isLoading, isError } = useMotivation();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (isLoading || isError || !data || dismissed) return null;

  const { quote, author, ai_message, streak_at_risk, current_streak } = data;

  const handleSpeak = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      toast.error("Audio synthesis is not supported on this device.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak = `${ai_message}. Remember what ${author} said: ${quote}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Select a natural English voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    toast.success("🎧 Playing AI Neural Motivation Audio");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className={cn(
        "relative overflow-hidden rounded-3xl p-6 md:p-8 border backdrop-blur-xl shadow-2xl transition-all",
        streak_at_risk
          ? "bg-gradient-to-r from-rose-950/60 via-purple-950/60 to-zinc-900/80 border-rose-500/40 shadow-rose-500/10"
          : "bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-zinc-900/80 border-purple-500/40 shadow-purple-500/10"
      )}
    >
      {/* Background glow & watermark */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <BrainCircuit className="absolute -bottom-8 -right-8 w-48 h-48 opacity-5 text-purple-400 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border flex items-center gap-1",
              streak_at_risk ? "bg-rose-500/20 text-rose-300 border-rose-500/30 animate-pulse" : "bg-purple-500/20 text-purple-300 border-purple-500/30"
            )}>
              <Flame className="w-3 h-3 fill-current" />
              <span>{streak_at_risk ? `⚠️ ${current_streak}-DAY STREAK AT RISK!` : "NEURAL MOTIVATION PROTOCOL"}</span>
            </span>

            <span className="text-xs text-zinc-400 font-medium">
              Daily Telemetry Checkpoint
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-black text-white tracking-tight">
            &ldquo;{ai_message}&rdquo;
          </h3>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-spin-slow" />
            <div className="text-xs sm:text-sm text-zinc-300 italic">
              &ldquo;{quote}&rdquo; — <strong className="text-amber-300 not-italic font-bold">{author}</strong>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <button
            onClick={handleSpeak}
            className={cn(
              "px-5 py-3 rounded-2xl font-black text-xs transition-all flex items-center gap-2 shadow-lg border",
              isSpeaking
                ? "bg-amber-500 text-zinc-950 border-amber-400 shadow-amber-500/20 animate-pulse"
                : "bg-purple-600/30 hover:bg-purple-600 border-purple-500/50 text-white shadow-purple-500/20"
            )}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4 animate-bounce" /> : <Volume2 className="w-4 h-4" />}
            <span>{isSpeaking ? "SPEAKING..." : "LISTEN"}</span>
          </button>

          <button
            onClick={() => setDismissed(true)}
            className="p-3 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all text-xs font-bold border border-zinc-700/50"
            title="Dismiss Banner"
          >
            ✕
          </button>
        </div>
      </div>
    </motion.div>
  );
}
