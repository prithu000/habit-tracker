"use client";

import { useRoutines } from "@/lib/queries/useRoutines";
import { PageTransition } from "@/components/layouts/PageTransition";
import { Skeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ListTodo, Plus, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RoutinesPage() {
  const { data: routines, isLoading, isError } = useRoutines();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !routines) {
    return (
      <EmptyState
        icon={ListTodo}
        title="Failed to load routines"
        description="We couldn't fetch your routines. Please try again."
        action={<button onClick={() => window.location.reload()} className="btn-ghost">Retry</button>}
      />
    );
  }

  return (
    <PageTransition>
      <div className="flex items-center justify-between mb-5 md:mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Routines</h1>
          <p className="text-muted-foreground mt-1">Design the systems that build your identity.</p>
        </div>
        <Link href="/routines/new" className="btn-forge">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Routine</span>
        </Link>
      </div>

      {routines.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No routines yet"
          description="Create your first routine to start stacking wins."
          action={
            <Link href="/routines/new" className="btn-forge mt-4">
              <Plus className="w-4 h-4" />
              Create Routine
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routines.map((routine, i) => (
            <Link key={routine.id} href={`/routines/${routine.id}`}>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="glass-card p-5 group flex flex-col h-full hover:border-forge-500/30 hover:bg-white/[0.04] transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${routine.color}15`, color: routine.color }}
                    >
                      {routine.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-forge-300 transition-colors">{routine.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                          {routine.time_of_day}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {(routine.schedule?.recurrence_type || "daily").replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground group-hover:bg-forge-500/10 group-hover:text-forge-400 transition-colors">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground flex-1 line-clamp-2">
                  {routine.description || "No description provided."}
                </p>

                {!routine.is_active && (
                  <div className="mt-4 pt-3 border-t border-border/50">
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-muted text-muted-foreground">
                      Archived
                    </span>
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
