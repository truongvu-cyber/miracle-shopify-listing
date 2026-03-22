import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

export interface UserInfo {
  username: string;
  role: string;
  displayName: string;
  createdAt: string;
}

interface AuthState {
  user: UserInfo | null;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const user = await invoke<UserInfo>("login", { username, password });
      set({ user, loading: false });
      return true;
    } catch (err) {
      const msg = typeof err === "string" ? err : "Đăng nhập thất bại";
      set({ error: msg, loading: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await invoke("logout");
    } catch {}
    set({ user: null });
  },

  checkAuth: async () => {
    try {
      const user = await invoke<UserInfo | null>("get_current_user");
      set({ user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  isAdmin: () => get().user?.role === "admin",
}));
