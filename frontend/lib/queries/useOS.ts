import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";
import { toast } from "react-hot-toast";

export function useLifeScore() {
  return useQuery({
    queryKey: ["lifeScore"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/life-score/");
      return data.data;
    },
  });
}

export function useMotivation() {
  return useQuery({
    queryKey: ["motivation"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/motivation/");
      return data.data;
    },
  });
}

export function useSmartReports(timeframe = "weekly") {
  return useQuery({
    queryKey: ["smartReports", timeframe],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/analytics/reports/?timeframe=${timeframe}&format=json`);
      return data.data;
    },
  });
}

export function useTimeline() {
  return useQuery({
    queryKey: ["timeline"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/timeline/");
      return data.data;
    },
  });
}

export function useCoins() {
  return useQuery({
    queryKey: ["coins"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/coins/");
      return data.data;
    },
  });
}

export function useStore() {
  return useQuery({
    queryKey: ["store"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/store/");
      return data.data;
    },
  });
}

export function usePurchaseStoreItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await api.post<ApiResponse<any>>("/rewards/store/", { item_id: itemId });
      return data.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Item purchased successfully!");
      queryClient.invalidateQueries({ queryKey: ["store"] });
      queryClient.invalidateQueries({ queryKey: ["coins"] });
      queryClient.invalidateQueries({ queryKey: ["streakFreeze"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.error?.message || "Failed to purchase item.";
      toast.error(msg);
    },
  });
}

export function useLeagues(scope = "global") {
  return useQuery({
    queryKey: ["leagues", scope],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>(`/rewards/leagues/?scope=${scope}`);
      return data.data;
    },
  });
}

export function useHardcoreAchievements() {
  return useQuery({
    queryKey: ["hardcoreAchievements"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/achievements-list/");
      return data.data;
    },
  });
}

export function useStreakFreeze() {
  return useQuery({
    queryKey: ["streakFreeze"],
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
  return useQuery({
    queryKey: ["emailReminders"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/notifications/reminders/");
      return data.data;
    },
  });
}

export function useCreateEmailReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { task_name: string; deadline: string; priority: string; frequency: string }) => {
      const { data } = await api.post<ApiResponse<any>>("/notifications/reminders/", payload);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Scheduled email reminder set!");
      queryClient.invalidateQueries({ queryKey: ["emailReminders"] });
    },
    onError: () => {
      toast.error("Failed to set reminder.");
    },
  });
}

export function useDeleteEmailReminder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete<ApiResponse<any>>(`/notifications/reminders/?id=${id}`);
      return data.data;
    },
    onSuccess: () => {
      toast.success("Reminder deleted.");
      queryClient.invalidateQueries({ queryKey: ["emailReminders"] });
    },
    onError: () => {
      toast.error("Failed to delete reminder.");
    },
  });
}
