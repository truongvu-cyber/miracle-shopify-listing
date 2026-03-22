import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeState {
  theme: Theme;
  resolved: "light" | "dark";
  setTheme: (theme: Theme) => void;
  initTheme: () => void;
}

function getSystemTheme(): "light" | "dark" {
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyTheme(resolved: "light" | "dark") {
  const root = document.documentElement;
  if (resolved === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

const STORAGE_KEY = "miracle-theme";

export const useThemeStore = create<ThemeState>((set) => ({
  theme: "dark",
  resolved: "dark",

  setTheme: (theme) => {
    const resolved = resolveTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    applyTheme(resolved);
    set({ theme, resolved });
  },

  initTheme: () => {
    const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const theme = saved || "system";
    const resolved = resolveTheme(theme);
    applyTheme(resolved);
    set({ theme, resolved });
  },
}));
