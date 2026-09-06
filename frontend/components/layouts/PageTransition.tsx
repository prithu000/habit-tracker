"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageTransition({ 
  children, 
  className,
  style,
}: { 
  children: ReactNode; 
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn("flex-1 w-full flex flex-col", className)}
      style={style}
    >
      {children}
    </motion.div>
  );
}
