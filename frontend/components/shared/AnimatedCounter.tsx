"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  direction?: "up" | "down";
  className?: string;
  duration?: number;
}

export function AnimatedCounter({ value, direction = "up", className = "", duration = 1000 }: AnimatedCounterProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
    duration,
  });
  
  const display = useTransform(spring, (current) => Math.round(current));

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (hasMounted) {
      spring.set(value);
    }
  }, [value, hasMounted, spring]);

  if (!hasMounted) return <span className={className}>{value}</span>;

  return <motion.span className={className}>{display}</motion.span>;
}
