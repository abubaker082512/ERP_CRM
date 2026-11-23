"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type BeraxisTheme = "dark" | "light";

interface ThemeContextValue {
  theme: BeraxisTheme;
  isLight: boolean;
  setTheme: (theme: BeraxisTheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "dark",
  isLight: false,
  setTheme: () => {},
  toggleTheme: () => {},
});

const STORAGE_KEY = "beraxis_theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<BeraxisTheme>("dark");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        setThemeState(saved);
        applyDomTheme(saved);
      } else {
        applyDomTheme("dark");
      }
    } catch {
      applyDomTheme("dark");
    }
  }, []);

  const applyDomTheme = (next: BeraxisTheme) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("data-theme", next);
    root.classList.remove("light", "dark");
    root.classList.add(next);
  };

  const setTheme = (next: BeraxisTheme) => {
    setThemeState(next);
    applyDomTheme(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isLight: theme === "light",
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
