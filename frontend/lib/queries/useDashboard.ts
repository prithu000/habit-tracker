import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DashboardData, ApiResponse } from "../../types/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

export const DASHBOARD_QUERY_KEY = (userId: string) => ["dashboard", userId];

export function useDashboard() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: !!user,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard/");
      return data.data; // unwrapping the standard ApiResponse envelope
    },
  });
}

// Hook for completing a task with optimistic updates
export function useCompleteTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async ({ taskId, note, mood }: { taskId: string, note?: string, mood?: number }) => {
      const { data } = await api.post<ApiResponse<any>>("/today/complete/", {
        task_id: taskId,
        note,
        mood,
      });
      return data.data;
    },
    onMutate: async (variables) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });

      // Snapshot the previous value
      const previousDashboard = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY(userId));

      // Optimistically update to the new value
      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(DASHBOARD_QUERY_KEY(userId), (old) => {
          if (!old) return old;

          // Deep clone for optimistic update
          const newDashboard = JSON.parse(JSON.stringify(old)) as DashboardData;
          
          let taskFound = false;

          for (const routine of newDashboard.today.routines) {
            const task = routine.tasks.find(t => t.id === variables.taskId);
            if (task && !task.is_completed) {
              task.is_completed = true;
              task.completed_at = new Date().toISOString();
              routine.completed_count += 1;
              routine.completion_rate = Math.round((routine.completed_count / routine.task_count) * 100 * 10) / 10;
              routine.is_complete = routine.completed_count === routine.task_count;
              taskFound = true;
              break;
            }
          }

          if (taskFound) {
            newDashboard.today.stats.completed_tasks += 1;
            newDashboard.today.stats.completion_rate = Math.round((newDashboard.today.stats.completed_tasks / newDashboard.today.stats.total_tasks) * 100 * 10) / 10;
            if (newDashboard.today.stats.completed_tasks === newDashboard.today.stats.total_tasks) {
              newDashboard.today.stats.is_perfect_day = true;
            }
            // Optimistic XP increment
            if (newDashboard.widgets && newDashboard.widgets.xp) {
              newDashboard.widgets.xp.xp_earned_today += 10;
              newDashboard.widgets.xp.total_xp += 10;
            }
            if (newDashboard.today.stats) {
              newDashboard.today.stats.xp_earned_today += 10;
            }
          }

          return newDashboard;
        });
      }

      return { previousDashboard };
    },
    onSuccess: (data, variables, context) => {
      // Instantly apply accurate server-computed XP and level stats
      if (data) {
        queryClient.setQueryData<DashboardData>(DASHBOARD_QUERY_KEY(userId), (old) => {
          if (!old) return old;
          const updated = JSON.parse(JSON.stringify(old)) as DashboardData;
          if (updated.widgets && updated.widgets.xp) {
            if (typeof data.total_xp === "number") updated.widgets.xp.total_xp = data.total_xp;
            if (typeof data.current_level === "number") updated.widgets.xp.current_level = data.current_level;
            if (typeof data.level_progress === "number") updated.widgets.xp.level_progress = data.level_progress;
            if (typeof data.xp_earned_today === "number") updated.widgets.xp.xp_earned_today = data.xp_earned_today;
          }
          if (updated.today && updated.today.stats && typeof data.xp_earned_today === "number") {
            updated.today.stats.xp_earned_today = data.xp_earned_today;
          }
          return updated;
        });
      }

      const prevStats = context?.previousDashboard?.today?.stats;
      const prevStreak = context?.previousDashboard?.widgets?.streak?.current || 0;
      
      if (prevStats && prevStats.completed_tasks === 0) {
        toast.success("🔥 First task completed!\nMomentum has begun. Keep moving.", { duration: 4000 });
      }
      if (prevStreak === 0 && (data?.streak_updated || data?.current_streak === 1 || prevStats?.completed_tasks === 0)) {
        setTimeout(() => {
          toast("⚡ 1-Day Streak!\nEvery legend starts with Day One. Protect it.", { duration: 5000, icon: "🔥" });
        }, 1200);
      }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousDashboard) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), context.previousDashboard);
      }
      toast.error("Failed to complete task.");
    },
    onSettled: () => {
      // Invalidate to ensure sync with server (though optimistic update handles the immediate UI)
      // For a perfectly snappy UI, we might NOT invalidate immediately, or rely on the server response to update the cache.
      // But invalidating is safer to ensure consistency of XP/streaks which the server calculates.
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
    },
  });
}

// Hook for undoing a completion
export function useUndoCompletion() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (completionId: string) => {
      const { data } = await api.delete<ApiResponse<any>>(`/today/complete/${completionId}/`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
    },
    onError: () => {
      toast.error("Failed to undo task.");
    }
  });
}
