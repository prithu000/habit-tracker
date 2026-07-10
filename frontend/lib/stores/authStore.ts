import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "../../types/api";

interface AuthTokens {
  access: string;
  refresh: string;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (val: boolean) => void;
  setAuth: (user: User, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  updateUser: (user: Partial<User>) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      _hasHydrated: false,

      setHasHydrated: (val) => set({ _hasHydrated: val }),

      setAuth: (user, tokens) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...user } : user,
          tokens,
          isAuthenticated: true,
        })),

      setTokens: (tokens) =>
        set((state) => ({
          tokens: { ...state.tokens, ...tokens },
        })),

      updateUser: (updatedUser) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updatedUser } : (updatedUser as User),
        })),

      logout: () => set({ user: null, tokens: null, isAuthenticated: false }),
    }),
    {
      name: "forge-auth-storage",
      // Correct Zustand v5 way to detect hydration completion with error/fallback safety
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Zustand hydration error in authStore:", error);
        }
        if (state) {
          state.setHasHydrated(true);
        } else {
          useAuthStore.setState({ _hasHydrated: true });
        }
      },
      // Don't persist the hydration flag itself
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Guarantee synchronous hydration verification right when client script loads
if (typeof window !== "undefined") {
  try {
    if (useAuthStore.persist.hasHydrated()) {
      useAuthStore.setState({ _hasHydrated: true });
    } else {
      useAuthStore.persist.rehydrate();
      // Fast fallback to guarantee hydration completes within 50ms even across async storage or Next.js transitions
      setTimeout(() => {
        useAuthStore.setState({ _hasHydrated: true });
      }, 50);
    }
  } catch (err) {
    console.error("Client bootstrap rehydration fallback error:", err);
    useAuthStore.setState({ _hasHydrated: true });
  }
}


