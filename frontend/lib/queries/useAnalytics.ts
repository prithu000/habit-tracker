import { useQuery } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";

export const ANALYTICS_QUERY_KEY = ["analytics"];

export function useWeeklyAnalytics() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "weekly"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/weekly/");
      return data.data;
    },
  });
}

export function useMonthlyAnalytics() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "monthly"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/monthly/");
      return data.data;
    },
  });
}

export function useHeatmapAnalytics() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "heatmap"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/heatmap/");
      return data.data;
    },
  });
}

export function useDisciplineScore() {
  return useQuery({
    queryKey: [...ANALYTICS_QUERY_KEY, "discipline-score"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/analytics/discipline-score/");
      return data.data;
    },
  });
}
