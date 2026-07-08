import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api";
import { ApiResponse, User } from "../../types/api";
import { useAuthStore } from "../stores/authStore";
import { toast } from "react-hot-toast";

export const USER_QUERY_KEY = ["user"];

export function useUserProfile() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const tokens = useAuthStore((s) => s.tokens);

  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<User>>("/users/me/");
      if (data.data && tokens) {
        setAuth(data.data, tokens);
      }
      return data.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserStats() {
  return useQuery({
    queryKey: [...USER_QUERY_KEY, "stats"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<any>>("/users/me/stats/");
      return data.data;
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const updateUserStore = useAuthStore(state => state.updateUser);
  
  return useMutation({
    mutationFn: async (userData: Partial<User> & { identity_statement?: string, time_preference?: string, timezone?: string }) => {
      const { data } = await api.patch<ApiResponse<User>>("/users/me/", userData);
      return data.data;
    },
    onSuccess: (updatedUser) => {
      queryClient.invalidateQueries({ queryKey: USER_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      updateUserStore(updatedUser);
      toast.success("Profile updated successfully.");
    },
    onError: () => {
      toast.error("Failed to update profile.");
    }
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: any) => {
      await api.post("/users/me/password/", passwordData);
    },
    onSuccess: () => {
      toast.success("Password changed successfully.");
    },
    onError: (err: any) => {
      const msg = err.response?.data?.error?.message || "Failed to change password.";
      toast.error(msg);
    }
  });
}
