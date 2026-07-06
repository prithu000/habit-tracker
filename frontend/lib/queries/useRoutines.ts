import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DASHBOARD_QUERY_KEY } from "./useDashboard";
import { ApiResponse, Task } from "../../types/api";
import { toast } from "react-hot-toast";

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

export const ROUTINES_QUERY_KEY = ["routines"];

export function useRoutines() {
  return useQuery({
    queryKey: ROUTINES_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Routine[]>>("/routines/");
      return data.data;
    },
  });
}

export function useRoutine(id: string) {
  return useQuery({
    queryKey: [...ROUTINES_QUERY_KEY, id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Routine>>(`/routines/${id}/`);
      return data.data;
    },
    enabled: !!id && id !== "new",
  });
}

export function useCreateRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (routineData: Partial<Routine>) => {
      const { data } = await api.post<ApiResponse<Routine>>("/routines/", routineData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast.success("Routine created successfully.");
    },
    onError: () => {
      toast.error("Failed to create routine.");
    }
  });
}

export function useUpdateRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string, data: Partial<Routine> }) => {
      const response = await api.patch<ApiResponse<Routine>>(`/routines/${id}/`, data);
      return response.data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY, variables.id] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast.success("Routine updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update routine.");
    }
  });
}

export function useDeleteRoutine() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/routines/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROUTINES_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast.success("Routine deleted.");
    },
    onError: () => {
      toast.error("Failed to delete routine.");
    }
  });
}

// ---- Tasks nested under Routines ----

export function useRoutineTasks(routineId: string) {
  return useQuery({
    queryKey: [...ROUTINES_QUERY_KEY, routineId, "tasks"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>(`/routines/${routineId}/tasks/`);
      return data.data || []; 
    },
    enabled: !!routineId && routineId !== "new",
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ routineId, taskData }: { routineId: string, taskData: Partial<Task> }) => {
      const { data } = await api.post<ApiResponse<Task>>(`/routines/${routineId}/tasks/`, taskData);
      return data.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY, variables.routineId] });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY, variables.routineId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast.success("Task added.");
    },
    onError: () => {
      toast.error("Failed to add task.");
    }
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ routineId, taskId }: { routineId: string, taskId: string }) => {
      await api.delete(`/routines/${routineId}/tasks/${taskId}/`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY, variables.routineId] });
      queryClient.invalidateQueries({ queryKey: [...ROUTINES_QUERY_KEY, variables.routineId, "tasks"] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
      toast.success("Task deleted.");
    },
    onError: () => {
      toast.error("Failed to delete task.");
    }
  });
}
