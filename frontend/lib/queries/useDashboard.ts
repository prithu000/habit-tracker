import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DashboardData, ApiResponse } from "../../types/api";
import { toast } from "react-hot-toast";

export const DASHBOARD_QUERY_KEY = ["dashboard"];

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<DashboardData>>("/dashboard/");
      return data.data; // unwrapping the standard ApiResponse envelope
    },
  });
}

// Hook for completing a task with optimistic updates
export function useCompleteTask() {
  const queryClient = useQueryClient();

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
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY });

      // Snapshot the previous value
      const previousDashboard = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY);

      // Optimistically update to the new value
      if (previousDashboard) {
        queryClient.setQueryData<DashboardData>(DASHBOARD_QUERY_KEY, (old) => {
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
          }

          return newDashboard;
        });
      }

      return { previousDashboard };
    },
    onSuccess: (data, variables, context) => {
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
        queryClient.setQueryData(DASHBOARD_QUERY_KEY, context.previousDashboard);
      }
      toast.error("Failed to complete task.");
    },
    onSettled: () => {
      // Invalidate to ensure sync with server (though optimistic update handles the immediate UI)
      // For a perfectly snappy UI, we might NOT invalidate immediately, or rely on the server response to update the cache.
      // But invalidating is safer to ensure consistency of XP/streaks which the server calculates.
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });
}

// Hook for undoing a completion
export function useUndoCompletion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (completionId: string) => {
      const { data } = await api.delete<ApiResponse<any>>(`/today/complete/${completionId}/`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
    onError: () => {
      toast.error("Failed to undo task.");
    }
  });
}
