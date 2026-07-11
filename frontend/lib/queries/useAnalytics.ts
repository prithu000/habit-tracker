import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";
import { useAuthStore } from "../stores/authStore";

export const ANALYTICS_QUERY_KEY = (userId: string) => ["analytics", userId];

export function useWeeklyAnalytics(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY(userId), "weekly"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/weekly/");
      return data.data || data;
    },
  });
}

export function useMonthlyAnalytics(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY(userId), "monthly"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/monthly/");
      return data.data || data;
    },
  });
}

export function useHeatmapAnalytics(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY(userId), "heatmap"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<any>("/analytics/heatmap/");
      return data.data || data;
    },
  });
}

export function useDisciplineScore(enabled = true) {
  const user = useAuthStore((state) => state.user);
  const userId = user?.id || "anonymous";

  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY(userId), "discipline-score"],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/discipline-score/");
      return data.data || data;
    },
  });
}
