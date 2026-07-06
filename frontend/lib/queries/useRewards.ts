import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse } from "../../types/api";

export const REWARDS_QUERY_KEY = ["rewards"];

export interface Badge {
  slug: string;
  name: string;
  description: string;
  icon: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_reward: number;
  is_earned: boolean;
  earned_at: string | null;
  seen: boolean | null;
}

export function useBadges() {
  return useQuery({
    queryKey: [...REWARDS_QUERY_KEY, "badges"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ badges: Badge[], earned_count: number, total_badges: number }>>("/rewards/badges/");
      return data.data;
    },
  });
}

export function useMarkBadgesSeen() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await api.post("/rewards/badges/mark-seen/");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...REWARDS_QUERY_KEY, "badges"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] }); // update notification count
    }
  });
}

export function useLeague() {
  return useQuery({
    queryKey: [...REWARDS_QUERY_KEY, "league"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/league/");
      return data.data;
    },
  });
}

export function useXpHistory() {
  return useQuery({
    queryKey: [...REWARDS_QUERY_KEY, "xp-history"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/rewards/xp/");
      return data.data; // Assuming paginated response
    },
  });
}
