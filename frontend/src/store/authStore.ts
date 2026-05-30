import { create } from "zustand";
import type { User } from "@/types";
import { api } from "@/lib/api";
import { storeToken, clearToken, initAuthFromStorage } from "@/lib/auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    initAuthFromStorage();
    try {
      const user = await api.getMe();
      set({ user, isInitialized: true });
    } catch {
      clearToken();
      set({ user: null, token: null, isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, password);
      storeToken(response.access_token);
      set({ user: response.user, token: response.access_token, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const response = await api.register(email, password, name);
      storeToken(response.access_token);
      set({ user: response.user, token: response.access_token, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    try {
      await api.logout();
    } catch {
      // ignore logout errors
    }
    clearToken();
    set({ user: null, token: null });
  },
}));
