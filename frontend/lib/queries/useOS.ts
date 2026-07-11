import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";
import { toast } from "react-hot-toast";
import { useAuthStore } from "../stores/authStore";

export function useLifeScore(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["lifeScore", userId],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/life-score/");
      return data.data || data;
    },
  });
}

export function useMotivation(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["motivation", userId],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/motivation/");
      return data.data || data;
    },
  });
}

export function useSmartReports(timeframe = "weekly", enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["smartReports", userId, timeframe],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/analytics/reports/?timeframe=${timeframe}&format=json`);
      return data.data || data;
    },
  });
}

export function useLeagues(scope = "global") {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["leagues", userId, scope],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/rewards/leagues/?scope=${scope}`);
      return data.data;
    },
  });
}

export function useHardcoreAchievements() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["hardcoreAchievements", userId],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/achievements-list/");
      return data.data;
    },
  });
}

export function useStreakFreeze() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["streakFreeze", userId],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/streaks/freeze/");
      return data.data;
    },
  });
}

export function useSupportReport() {
  return useMutation({
    mutationFn: async (payload: { issue_type: string; title: string; description: string; browser: string; version: string; logs: string }) => {
      const { data } = await api.post<ApiResponse<any>>("/notifications/support/", payload);
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Report submitted successfully!");
    },
    onError: () => {
      toast.error("Failed to submit report. Please check your network.");
    },
  });
}

export function usePomodoroEmail() {
  return useMutation({
    mutationFn: async (payload: any) => {
      const { data } = await api.post<ApiResponse<any>>("/notifications/pomodoro-email/", payload);
      return data.data;
    },
  });
}

export function useEmailReminders() {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: ["emailReminders", userId],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/notifications/reminders/");
      return data.data;
    },
  });
}

export function useCreateEmailReminder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (payload: { task_name: string; deadline: string; priority: string; frequency: string; timezone?: string }) => {
      const { data } = await api.post<ApiResponse<any>>("/notifications/reminders/", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Scheduled email reminder set!");
      queryClient.invalidateQueries({ queryKey: ["emailReminders", userId] });
    },
    onError: () => {
      toast.error("Failed to set reminder.");
    },
  });
}

export function useDeleteEmailReminder() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<any>>(`/notifications/reminders/?id=${id}`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Reminder deleted.");
      queryClient.invalidateQueries({ queryKey: ["emailReminders", userId] });
    },
    onError: () => {
      toast.error("Failed to delete reminder.");
    },
  });
}
