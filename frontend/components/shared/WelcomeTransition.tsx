"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export function WelcomeTransition() {
  const router = useRouter();

  useEffect(() => {
    // Auto-redirect after 2.5 seconds
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      {/* Animated glow background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0.3, 0] }}
          transition={{ duration: 2.5, times: [0, 0.3, 0.7, 1] }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-forge-500/20 rounded-full blur-[120px]" />
        </motion.div>
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 text-center px-6 max-w-2xl"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Main title with glow */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-display font-bold mb-6 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="bg-gradient-to-r from-white via-forge-200 to-white bg-clip-text text-transparent">
            YOUR PERSONAL
          </span>
          <br />
          <span className="bg-gradient-to-r from-forge-400 via-forge-300 to-forge-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(98,84,248,0.5)]">
            OPERATING SYSTEM
          </span>
          <br />
          <span className="bg-gradient-to-r from-white via-forge-200 to-white bg-clip-text text-transparent">
            IS READY
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.div
          className="space-y-2 text-lg sm:text-xl text-muted-foreground leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <p className="text-white/90">
            Today you stop tracking habits.
          </p>
          <p className="text-forge-300 font-semibold">
            Today you begin engineering yourself.
          </p>
        </motion.div>

        {/* Animated progress indicator */}
        <motion.div
          className="mt-12 flex items-center justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-forge-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
