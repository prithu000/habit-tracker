/**
 * Centralized logout hook with proper cache clearing
 * to prevent data leakage between users
 */

import { useAuthStore } from "../stores/authStore";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api";

/**
 * Hook that provides a logout function with proper cleanup:
 * 1. Calls backend logout endpoint
 * 2. Clears Zustand auth store
 * 3. Clears React Query cache to prevent data leakage
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((state) => state.logout);

  return async () => {
    try {
      const refresh = useAuthStore.getState().tokens?.refresh;
      if (refresh) {
        await api.post("/auth/logout/", { refresh });
      }
    } catch (e) {
      console.error("Logout API error:", e);
      // Continue with local logout even if API fails
    } finally {
      // Clear auth store
      logout();
      // Clear ALL React Query cache to prevent data leakage between users
      queryClient.clear();
    }
  };
}

