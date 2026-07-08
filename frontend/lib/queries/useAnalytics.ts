import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";

export const ANALYTICS_QUERY_KEY = ["analytics"];

export function useWeeklyAnalytics(enabled = true) {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "weekly"],
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
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "monthly"],
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
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "heatmap"],
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
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "discipline-score"],
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
