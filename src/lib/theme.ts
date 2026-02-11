"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "birdie-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "dark";
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    // Apply theme on mount and changes
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  const toggle = useCallback(() => {
    setThemeState((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
}

// Context for sharing theme across components
interface ThemeCtx { theme: Theme; toggle: () => void }
export const ThemeContext = createContext<ThemeCtx>({ theme: "dark", toggle: () => {} });
export const useThemeContext = () => useContext(ThemeContext);
