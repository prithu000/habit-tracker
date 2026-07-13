import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DASHBOARD_QUERY_KEY } from "./useDashboard";
import { ApiResponse, Task } from "../../types/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

export interface Routine {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  time_of_day: "morning" | "afternoon" | "evening" | "anytime";
  schedule_type: "daily" | "specific_days";
  specific_days: number[];
  schedule?: {
    recurrence_type: "daily" | "weekly";
    days_of_week: number[];
  };
  is_active: boolean;
  sort_order: number;
  tasks?: Task[]; // Returned in detail view
}

export const ROUTINES_QUERY_KEY = (userId: string) => ["routines", userId];

export function useRoutines() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ROUTINES_QUERY_KEY(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Routine[]>>("/routines/");
      return data.data;
    },
  });
}

export function useRoutine(id: string) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ROUTINES_QUERY_KEY(userId), id],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Routine>>(`/routines/${id}/`);
      return data.data;
    },
    enabled: !!id && id !== "new",
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async (routineData: Partial<Routine>) => {
      const { data } = await api.post<ApiResponse<Routine>>("/routines/", routineData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Routine created successfully.");
    },
    onError: () => {
      toast.error("Failed to create routine.");
    }
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Routine> }) => {
      const response = await api.patch<ApiResponse<Routine>>(`/routines/${id}/`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), variables.id] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Routine updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update routine.");
    }
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/routines/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Routine deleted.");
    },
    onError: () => {
      toast.error("Failed to delete routine.");
    }
  });
}

export function useArchiveRoutine() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/routines/${id}/archive/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Routine archived.");
    },
    onError: () => {
      toast.error("Failed to archive routine.");
    }
  });
}

export function useDuplicateRoutine() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post<ApiResponse<Routine>>(`/routines/${id}/duplicate/`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY(userId) });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Routine duplicated successfully.");
    },
    onError: () => {
      toast.error("Failed to duplicate routine.");
    }
  });
}

// ---- Tasks nested under Routines ----

export function useRoutineTasks(routineId: string) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ROUTINES_QUERY_KEY(userId), routineId, "tasks"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>(`/routines/${routineId}/tasks/`);
      return data.data || []; 
    },
    enabled: !!routineId && routineId !== "new",
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async ({ routineId, taskData }: { routineId: string, taskData: Partial<Task> }) => {
      const { data } = await api.post<ApiResponse<Task>>(`/routines/${routineId}/tasks/`, taskData);
      return data.data;
    },
    onMutate: async ({ routineId, taskData }) => {
      await queryClient.cancelQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), routineId] });
      await queryClient.cancelQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), routineId, "tasks"] });
      await queryClient.cancelQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });

      const previousRoutine = queryClient.getQueryData([...ROUTINES_QUERY_KEY(userId), routineId]);
      const previousTasks = queryClient.getQueryData([...ROUTINES_QUERY_KEY(userId), routineId, "tasks"]);
      const previousDashboard = queryClient.getQueryData(DASHBOARD_QUERY_KEY(userId));

      const tempId = `temp-${Date.now()}`;
      const optimisticTask: Task = {
        id: tempId,
        name: taskData.name || "",
        description: taskData.description || "",
        duration_minutes: taskData.duration_minutes || 0,
        sort_order: 999,
        is_completed: false,
        completed_at: null,
        note: "",
        mood: null,
        completion_id: null,
      };

      if (previousTasks) {
        queryClient.setQueryData([...ROUTINES_QUERY_KEY(userId), routineId, "tasks"], (old: any) => {
          return old ? [...old, optimisticTask] : [optimisticTask];
        });
      }

      if (previousRoutine) {
        queryClient.setQueryData([...ROUTINES_QUERY_KEY(userId), routineId], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            tasks: old.tasks ? [...old.tasks, optimisticTask] : [optimisticTask],
            task_count: (old.task_count || 0) + 1,
          };
        });
      }

      if (previousDashboard) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), (old: any) => {
          if (!old || !old.today || !old.today.routines) return old;
          return {
            ...old,
            today: {
              ...old.today,
              routines: old.today.routines.map((r: any) => {
                if (r.id === routineId) {
                  const newTasks = r.tasks ? [...r.tasks, optimisticTask] : [optimisticTask];
                  const newCount = (r.task_count || 0) + 1;
                  const newRate = Math.round(((r.completed_count || 0) / newCount) * 100) || 0;
                  return {
                    ...r,
                    tasks: newTasks,
                    task_count: newCount,
                    completion_rate: newRate,
                    is_complete: newRate === 100 && newCount > 0
                  };
                }
                return r;
              })
            }
          };
        });
      }

      return { previousRoutine, previousTasks, previousDashboard, routineId };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousRoutine) {
        queryClient.setQueryData([...ROUTINES_QUERY_KEY(userId), context.routineId], context.previousRoutine);
      }
      if (context?.previousTasks) {
        queryClient.setQueryData([...ROUTINES_QUERY_KEY(userId), context.routineId, "tasks"], context.previousTasks);
      }
      if (context?.previousDashboard) {
        queryClient.setQueryData(DASHBOARD_QUERY_KEY(userId), context.previousDashboard);
      }
      toast.error("Failed to add task.");
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), variables.routineId] });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), variables.routineId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
    },
    onSuccess: () => {
      toast.success("Task added.");
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";
  
  return useMutation({
    mutationFn: async ({ routineId, taskId }: { routineId: string, taskId: string }) => {
      await api.delete(`/routines/${routineId}/tasks/${taskId}/`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), variables.routineId] });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY(userId), variables.routineId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Task deleted.");
    },
    onError: () => {
      toast.error("Failed to delete task.");
    }
  });
}
