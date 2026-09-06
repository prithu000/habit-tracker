import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { DASHBOARD_QUERY_KEY } from "./useDashboard";
import { ApiResponse, Task, TaskCategory, TaskFrequency } from "../../types/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

export interface TaskFilters {
  category?: TaskCategory | string;
  frequency?: TaskFrequency | string;
  is_active?: boolean;
}

export interface CreateTaskPayload {
  name: string;
  description?: string;
  category?: TaskCategory | string;
  frequency?: TaskFrequency | string;
  due_date?: string | null;
  duration_minutes?: number;
  sort_order?: number;
}

export interface UpdateTaskPayload {
  name?: string;
  description?: string;
  category?: TaskCategory | string;
  frequency?: TaskFrequency | string;
  due_date?: string | null;
  duration_minutes?: number;
  sort_order?: number;
  is_active?: boolean;
}

export const TASKS_QUERY_KEY = (userId: string, filters?: TaskFilters) => [
  "tasks",
  userId,
  filters ? JSON.stringify(filters) : "all",
];

export function useTasks(filters?: TaskFilters) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: TASKS_QUERY_KEY(userId, filters),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task[]>>("/tasks/", {
        params: filters,
      });
      return data.data || [];
    },
  });
}

export function useTask(id: string) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["tasks", userId, id],
    staleTime: 5 * 60 * 1000,
    enabled: !!id && id !== "new",
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Task>>(`/tasks/${id}/`);
      return data.data;
    },
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (taskData: CreateTaskPayload) => {
      const { data } = await api.post<ApiResponse<Task>>("/tasks/", taskData);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Task created.");
    },
    onError: () => {
      toast.error("Failed to create task.");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateTaskPayload }) => {
      const response = await api.patch<ApiResponse<Task>>(`/tasks/${id}/`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      queryClient.invalidateQueries({ queryKey: ["tasks", userId, variables.id] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Task updated.");
    },
    onError: () => {
      toast.error("Failed to update task.");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
      toast.success("Task deleted.");
    },
    onError: () => {
      toast.error("Failed to delete task.");
    },
  });
}

export function useReorderTasks() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (order: { id: string; sort_order: number }[]) => {
      const { data } = await api.patch<ApiResponse<{ status: string }>>("/tasks/reorder/", { order });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", userId] });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY(userId) });
    },
  });
}
