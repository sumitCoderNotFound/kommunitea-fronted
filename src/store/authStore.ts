import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authService } from "@/services/authService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: async (email, password) => {
        set({ isLoading: true });
        try {
          await authService.login(email, password);
          const user = await authService.me();
          set({ user, isAuthenticated: true });
          return user;
        } finally {
          set({ isLoading: false });
        }
      },
      logout: () => {
        authService.logout();
        set({ user: null, isAuthenticated: false });
      },
      loginWithGoogle: async (idToken) => {
        set({ isLoading: true });
        try {
          await authService.googleLogin(idToken);
          const user = await authService.me();
          set({ user, isAuthenticated: true });
          return user;
        } finally {
          set({ isLoading: false });
        }
      },
      refreshUser: async () => {
        try {
          const user = await authService.me();
          set({ user, isAuthenticated: true });
        } catch {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    { name: "ujt-auth", partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) },
  ),
);
