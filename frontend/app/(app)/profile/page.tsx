"use client";

import { useAuthStore } from "@/lib/stores/authStore";
import { useUserStats } from "@/lib/queries/useUser";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Skeleton } from "@/components/shared/Skeleton";
import { Flame, Star, CheckCircle2, Shield, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading } = useUserStats();

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8 text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-forge-500/10 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="w-32 h-32 rounded-full bg-forge-500/20 border-4 border-background flex items-center justify-center text-4xl font-bold text-forge-400 shrink-0 z-10 shadow-xl">
            {user?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          
          <div className="flex-1 z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-display font-bold">{user?.display_name}</h1>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <Link href="/settings" className="btn-ghost shrink-0">
                <Settings className="w-4 h-4" />
                Edit Profile
              </Link>
            </div>
            
            <div className="inline-block px-4 py-2 bg-forge-500/10 border border-forge-500/20 rounded-lg">
              <p className="text-sm italic text-forge-300">
                &quot;I am the type of person who {user?.identity_statement?.toLowerCase().replace(/^i am the type of person who /, '') || 'shows up every day.'}&quot;
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 className="text-lg font-semibold mb-4">Lifetime Statistics</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-forge-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-forge-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Total Experience</p>
                <p className="text-2xl font-bold font-mono">{stats?.total_xp || 0} <span className="text-sm text-muted-foreground font-sans">XP</span></p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                <Flame className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Longest Streak</p>
                <p className="text-2xl font-bold font-mono">{stats?.longest_streak || 0} <span className="text-sm text-muted-foreground font-sans">days</span></p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold font-mono">{stats?.total_completions || 0}</p>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-info/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">Perfect Days</p>
                <p className="text-2xl font-bold font-mono">{stats?.perfect_days || 0}</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
