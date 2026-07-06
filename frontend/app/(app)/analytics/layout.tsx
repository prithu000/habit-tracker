"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils/cn";
import { PageTransition } from "@/components/layouts/PageTransition";

const tabs = [
  { name: "Weekly", href: "/analytics" },
  { name: "Monthly", href: "/analytics/monthly" },
  { name: "Heatmap", href: "/analytics/heatmap" },
];

export default function AnalyticsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <PageTransition>
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground mt-1">Track your consistency and measure your growth.</p>
      </div>

      <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link 
              key={tab.href} 
              href={tab.href}
              className={cn(
                "relative py-3 px-1 text-sm font-medium whitespace-nowrap transition-colors",
                isActive ? "text-forge-400" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.name}
              {isActive && (
                <motion.div
                  layoutId="analyticsTabIndicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-forge-500 rounded-t-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div>
        {children}
      </div>
    </PageTransition>
  );
}
