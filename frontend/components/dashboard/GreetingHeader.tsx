"use client";

import { motion } from "framer-motion";
import { memo } from "react";

interface GreetingHeaderProps {
  displayName: string;
  identityStatement: string;
}

export const GreetingHeader = memo(function GreetingHeader({ displayName, identityStatement }: GreetingHeaderProps) {
  const hour = new Date().getHours();
  let greeting = "Good evening";
  if (hour < 12) greeting = "Good morning";
  else if (hour < 17) greeting = "Good afternoon";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forge-500/10 border border-forge-500/20 text-forge-300 text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        <span>Daily Reset • A new day has begun. Yesterday is now data. Today is another opportunity.</span>
      </div>
      <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
        {greeting}, {displayName.split(" ")[0]}
      </h1>
      {identityStatement && (
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl border-l-2 border-forge-500/50 pl-4 py-1 italic">
          &quot;I am the type of person who {identityStatement.toLowerCase().replace(/^i am the type of person who /, '')}&quot;
        </p>
      )}
    </motion.div>
  );
});
