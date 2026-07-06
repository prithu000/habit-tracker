"use client";

import { motion } from "framer-motion";

interface GreetingHeaderProps {
  displayName: string;
  identityStatement: string;
}

export function GreetingHeader({ displayName, identityStatement }: GreetingHeaderProps) {
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
}
